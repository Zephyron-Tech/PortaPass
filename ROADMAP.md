# Roadmap notes

## Current PoC scope

- Mock magic link → mock identity verification ("BankID") → generate and
  download a `.pkpass` visually styled as a hotel room key.
- Data is hardcoded (`src/lib/mockData.ts`), no PMS or lock integration.
- The pass includes an NFC field (`setNFC`) with a dummy string payload,
  self-signed with our own Apple Pass Type ID certificate. This proves the
  wallet-pass UX end to end but **does not unlock any real door**.

## Known constraint: real door unlock is not just software

Apple's "Room Key in Apple Wallet" is a closed partner program: the NFC
credential exchange that actually opens a lock is issued through a certified
lock vendor acting as Apple's "credential manager," not through a generic
signed `.pkpass` NFC field. As of research (Sept 2026) the certified vendors
are:

- **Salto** (confirmed rolling out Apple Wallet room keys in 2026)
- **VingCard / Assa Abloy** (Vostio / Vconnect, also has Google Wallet support)
- **dormakaba**

Google Wallet hotel keys follow a similar model through the same vendors.

Orea Hotels (first Czech chain live with phone/watch unlock, Sept 2026) is
built on one of these vendor stacks, not a homegrown pkpass.

### What this means for productization

To go from "PoC that generates a nice-looking pass" to "guest can actually
unlock the door," PortaPass needs one of:

1. A commercial/API partnership with Salto, Assa Abloy (VingCard), or
   dormakaba to issue real wallet credentials through their systems, or
2. Integration through an existing aggregator that already has that access
   (e.g. Flexipass, Zaplox, Duve's Assa Abloy Vostio integration), or
3. Direct lock hardware partnership if targeting a specific hotel that
   controls its own lock estate.

None of these are pure software/API work we can do unilaterally — they
require a business relationship with a lock vendor. This should be raised
explicitly with any hotel director evaluating the PoC: **the demo proves the
guest experience and the check-in/identity flow; real unlock is a
partnership + integration project, not a coding task.**

## Suggested next steps after PoC feedback

- Pick one lock vendor to pursue for a pilot integration (Salto looks most
  active on Apple Wallet in 2026).
- Wire real PMS lookup (Previo or Mews API) instead of `mockData.ts`.
- Replace mock "Verify with BankID" with real BankID / MojeID integration.
- Add Google Wallet pass generation (separate from Apple's PassKit).
- Add UbyPort / e-Turista auto-reporting as a compliance angle — this is a
  concrete pain point for independent CZ hotels and a plausible wedge even
  before real lock integration lands.
