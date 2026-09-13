# Evidence-Backed Lending

A working demo of a compliance evidence layer for AI credit decisions, built directly
on the [CooL SDK](https://github.com/Northwind-Cipher/cool-sdk) (`cool-nwc`).

**Round 1 pitch → Round 2 build.** Same problem, same solution, now runnable.

---

## The problem

Banks and NBFCs in India increasingly use automated scoring to approve or reject
loans. RBI's draft Model Risk Management Framework (June 2026) and the RBI
Governor's public remarks (August 2026) require these institutions to maintain
explainable, immutable audit trails for AI-driven credit and fraud decisions —
including a record of **when and why a human overrode the model**.

Today, most of these decisions produce nothing more than a log line. A log line
can be edited after the fact. A screenshot proves nothing. When a customer
disputes a rejection, or a regulator asks for the trail, the bank usually has no
cryptographically trustworthy way to prove what actually happened.

## What this is

A small lending application where:

1. A rule-based scoring engine decides **APPROVED** or **REJECTED** on a loan
   application.
2. Every decision is wrapped in a **CooL evidence receipt** — signed, tamper-evident,
   and verifiable completely offline by anyone who receives it.
3. A loan officer can **override** the AI's decision, and that override is recorded
   as its own signed evidence event, cryptographically chained to the original
   decision.
4. Anyone — an auditor, a regulator, the applicant, or you — can paste that receipt
   into the **Verify** page and get a structured, per-domain verdict: binding,
   signature, inclusion, attestation, and more. There's also a one-click "tamper one
   byte and re-verify" button that reproduces CooL's own tamper demo, so you can see
   verification fail in real time.

This is deliberately **not** a real ML model — the scoring logic is a few
if-statements over income, tenure, credit score, and debt-to-income ratio. That's
intentional: any bank's real underwriting model (a gradient-boosted classifier, a
bureau API, an LLM-based agent) plugs in at exactly the same seam. CooL doesn't
care what produced the decision — it produces tamper-evident evidence *about*
whatever did.

## How CooL SDK is used

CooL is not a decoration on this project — it **is** the product's core value
proposition. Three integration points, all in `lib/cool.ts` and the three API
routes:

| Where | What happens |
|---|---|
| `app/api/decide/route.ts` | After the scoring engine decides, `cool.record()` is called with `type: "credit.decision"`. The full application (`payloads.input`) and the decision (`payloads.output`) are handed to CooL, which commits each as a **salted SHA-256 hash and discards the plaintext** before returning the signed evidence record. The applicant's raw data is never in the artifact that gets stored or downloaded. |
| `app/api/override/route.ts` | When an officer overrides a decision, `cool.record()` is called again with `type: "credit.override"` **and the same `executionId`** as the original decision. CooL's evidence model chains the two events together — this is the literal answer to RBI's "record when and why a human overrode the AI" requirement, using a real SDK feature rather than a bolted-on log table. |
| `app/api/verify/route.ts` | `verifyEvidence()` from `cool-nwc` runs against whatever evidence JSON is submitted. No database, no session, no call back to this server — the receipt carries its own signature, its own RFC 6962 inclusion proof, and its own signed tree head. This is what makes the evidence usable by a party (an auditor, a regulator) who has zero access to the bank's systems, which is the whole point of the RBI pitch. |

### Why cryptographic evidence matters here specifically

A `console.log` of a loan decision is trivially editable and provides no way for a
third party to check it wasn't. CooL's hybrid Ed25519 + ML-DSA-65 signatures plus
an RFC 6962 transparency log mean:

- **Binding**: the evidence is bound to a deterministic hash of its own contents —
  change one byte, and the binding check fails (see the tamper demo on `/verify`).
- **Non-repudiation**: the signature proves *which* signing key produced the
  record; you can't forge a receipt for a decision that never happened.
- **Offline, no-trust verification**: no auditor needs API access to the bank's
  database — they need the JSON file.
- **Data minimisation and auditability at once**: the applicant's income, name,
  and credit score are never in the artifact that a regulator would receive,
  only salted commitments to them — yet the bank can still *disclose* the salt
  later to prove a specific value was the one committed to, if genuinely required.

## Architecture

```
                      Browser (Next.js client components)
                     /apply                    /verify
                       |                           |
                       v                           v
        POST /api/decide                  POST /api/verify
                       |                           |
                       v                           v
        scoreLoanApplication()           verifyEvidence(evidence)
        (lib/decisionEngine.ts)          (cool-nwc, offline)
                       |
                       v
              cool.record({ type: "credit.decision", metadata, payloads })
                       |
                       v
        +-----------------------------+
        |   CooL evidence plane       |   simulator locally / on Vercel;
        |   commit -> sign -> log     |   swap in dstack for real TDX
        +-----------------------------+
                       |
                       v
          cool.receipt.v2  (self-contained, downloadable, verifiable anywhere)
                       |
        officer override -----> POST /api/override
                       |             (same executionId, type: "credit.override")
                       v
              cool.record({ type: "credit.override", executionId, metadata })
```

Each API route is a Next.js Route Handler running on the Node.js runtime (not
Edge — CooL needs Node's crypto and isn't Edge-compatible). There is
intentionally **no database**: every evidence record is self-contained, which is
also why this deploys cleanly to Vercel's serverless functions with no persistent
storage configured. The "log" a verifier checks against travels inside the
receipt itself (`inclusion` + `sth` fields), not on this server.

## Project structure

```
app/
  page.tsx                 landing page
  apply/page.tsx           loan application form + evidence display + override demo
  verify/page.tsx          paste/upload evidence, verify, tamper-and-reverify
  api/decide/route.ts      scores the application, calls cool.record()
  api/override/route.ts    records a chained human-override event
  api/verify/route.ts      calls verifyEvidence()
lib/
  decisionEngine.ts        the (intentionally simple) rule-based scorer
  cool.ts                  shared CooL client
components/
  VerdictTable.tsx         renders a structured verdict
```

## Running it locally

Requires Node ≥ 20 (CooL's own requirement).

```bash
npm install
npm run dev
# open http://localhost:3000
```

Try it end to end:

1. Go to `/apply`, submit an application (the defaults are pre-filled to approve —
   push the credit score below 650 or the loan amount way up to see a rejection).
2. Download the evidence receipt, or click "Verify this evidence →".
3. On `/verify`, click **Verify evidence** to see every check pass.
4. Click **Tamper one byte & re-verify** to watch `binding` and `signature` fail —
   exactly the demo CooL ships in its own repo (`npm run demo` in a clone of
   `cool-sdk`), reproduced here inside the product itself.
5. Back on `/apply`, try "Officer override this decision" to see a second,
   chained evidence event.

Building for production:

```bash
npm run build
npm start
```

## Deploying to Vercel

No environment variables are required for the default (simulated) attestation
mode — this is a plain Next.js App Router project, so:

```bash
npm i -g vercel
vercel
```

or connect the GitHub repository directly from the Vercel dashboard. CooL is
listed under `serverExternalPackages` in `next.config.mjs` so Vercel's build
doesn't try to bundle its Node-native crypto dependencies into the Edge runtime.

To run against real Intel TDX hardware via Phala dstack instead of the simulator,
set `COOL_DSTACK_ENDPOINT` and pass `attestation: { provider: "dstack" }` in
`lib/cool.ts` — see [`docs/dstack.md`](https://github.com/Northwind-Cipher/cool-sdk/blob/main/docs/dstack.md)
in the CooL repo. That's out of scope for this demo, which intentionally runs
CooL's honest, clearly-labelled `simulated` mode.

## Important technical decisions

- **No database.** CooL evidence is self-contained (signature + inclusion proof +
  signed tree head all travel with the record), so persistence isn't needed for
  verification to work. This keeps the demo deployable as pure serverless
  functions with zero infrastructure.
- **Rule-based "AI".** The scoring model is deliberately simple and auditable in
  its own right, so the demo's complexity budget goes toward the evidence layer,
  which is what this hackathon round is actually judging. A real deployment
  would swap `scoreLoanApplication()` for a real model call without touching any
  of the CooL integration.
- **Applicant data goes in `payloads`, not `metadata`.** CooL commits both as
  salted hashes, but keeping the full application under `payloads.input`
  specifically documents intent: this is exactly the sensitive material that must
  never appear in plaintext in the evidence artifact.
- **Simulated attestation, honestly labelled.** No dstack/TEE hookup is configured,
  so every receipt says `mode: "simulated"` and the verifier reports `simulated`
  — never `pass` — on the attestation and enclave domains, which is CooL's own
  security design, not a limitation introduced by this demo.

## Limitations & future improvements

- The scoring engine is rules-based, not a trained model — swapping in a real
  classifier is the natural next step and requires no changes to the CooL
  integration.
- Evidence is generated and verified within a single request; there is no
  persistent, queryable store of past decisions (by design — see above), which
  means this demo doesn't yet show a "bank's internal dashboard of all decisions
  ever made." A production system would add that as a separate concern, with
  each decision's evidence still independently verifiable.
- No real hardware attestation is wired up (see "Deploying to Vercel" above);
  everything runs through CooL's built-in simulator.
- No authentication — the `/apply` and `/verify` pages are open, which is
  appropriate for a public demo but not for a production lending system.
- The override flow lets anyone claim any `officerId`; a real deployment would
  authenticate the officer and bind their identity to the evidence some
  cryptographically stronger way than a free-text field.

## License

MIT for the code in this repository. `cool-nwc` itself is Apache-2.0, © Northwind
Cipher Pvt. Ltd.
