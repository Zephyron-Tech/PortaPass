# Roadmap notes

## Current PoC scope

- Magic link → Bank iD identity verification (sandbox) → generate and deliver
  a `.pkpass` styled as a hotel room key.
- Booking data is hardcoded (`src/lib/mockData.ts`), no PMS integration yet.
- The pass carries no NFC field and **does not unlock any real door**.

## Settled: the iOS Safari "wants to add 1 pass" sheet

Tapping Add to Apple Wallet in iOS Safari shows a confirmation sheet
("Safari Wants to Add 1 Pass to Wallet" — Add / Review / Cancel) before the
pass preview. Chrome on iOS goes straight to the preview, as does tapping a
`.pkpass` attachment in Mail.

**This is not fixable from the server.** Investigated and ruled out:

- `Content-Disposition: attachment` → `inline` → header removed entirely
- URL path ending in `.pkpass` with no query string (`/api/pass/[...parts]`)
- MIME type was correct (`application/vnd.apple.pkpass`) throughout

Opening the `.pkpass` URL directly in the address bar still shows the sheet,
which rules out the link element and any response header as the trigger. The
gate is **origin-based**: a pass opened from a local file (Mail attachment,
Files) is treated as a user-opened document and goes straight to the preview,
while a pass from a website is site-initiated and gets the extra
confirmation. Apple documents that "the user must always see and approve the
pass" and exposes no way for a site to control the presentation.

Do not spend more time on headers here. If the extra tap ever matters
commercially, the two real options are:

1. **Email the pass** alongside the booking confirmation — tapping the
   attachment gives the same direct preview airlines get for boarding passes.
2. A native app calling `PKAddPassesViewController`, which is a large
   commitment for one saved tap.

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
- Add Google Wallet pass generation (separate from Apple's PassKit).
- Add UbyPort / e-Turista auto-reporting as a compliance angle — this is a
  concrete pain point for independent CZ hotels and a plausible wedge even
  before real lock integration lands.

## Bank iD: sandbox vs production

Identity verification runs against the Bank iD **sandbox**, which is free and
needs no contract. Production requires creating an organization, signing a
contract with Bankovní identita a.s., and a **30 000 Kč + VAT activation
fee** — so don't activate before a hotel pilot is signed.

Per-use pricing then makes the product decision obvious (2026 price list):

| Tier | Includes | Price |
|---|---|---|
| CONNECT | name, birthdate | 0,49 Kč per use |
| IDENTIFY | + addresses, birth number | 20 Kč/yr per guest |
| IDENTIFY PLUS | + **`profile.idcards`** | 60 Kč/yr per guest |
| IDENTIFY AML | + verification | 140 Kč/yr per guest |

CONNECT is what a room key needs — it proves the person checking in is the
person who booked. Auto-filling a document number into UbyPort requires
`profile.idcards`, i.e. IDENTIFY PLUS at 60 Kč per guest versus the guest
typing it once. Price the product on CONNECT; treat UbyPort auto-fill as a
paid upsell.

Open commercial question for the contract conversation: can PortaPass hold
**one** contract and verify guests on behalf of many hotels (as a processor),
or must each hotel contract separately? At 30 000 Kč activation each, the
latter would be unsellable.
