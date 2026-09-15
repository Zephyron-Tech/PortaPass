# PortaPass (PoC)

White-label digital room key middleware for independent hotels. This PoC
demonstrates: mock magic link → mock identity verification → Apple Wallet
`.pkpass` download styled as a room key.

Read [ROADMAP.md](./ROADMAP.md) first — real door unlock requires a lock
vendor partnership (Salto / Assa Abloy / dormakaba), not just this app.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and follow the demo check-in link
(`/checkin/room-101?token=abc`).

Without Apple certificates configured, the check-in/verify flow works fully;
`/api/pass` returns a 501 explaining what's missing. See
[certs/README.md](./certs/README.md) to enable real pass signing.

## Lead form / Resend

The landing-page contact form posts to `/api/leads`. Set server-only variables
in `.env.local` locally and in the deployment environment on Vercel:

```dotenv
RESEND_API_KEY=re_...
LEADS_FROM="PortaPass <hello@zephyron.tech>"
LEADS_TO=hello@zephyron.tech
```

Use a sending-only Resend key scoped to the verified `zephyron.tech` domain.
The website can use a different domain: Resend verifies the sender, not the
landing URL. Keep the endpoint on the same origin as the form. If migrating
the entire app, also update `APP_BASE_URL` and Bank iD registered redirect URLs;
those settings are independent of Resend. Do not put the key in `NEXT_PUBLIC_*`.

No key means HTTP 503, not fake success. A successful response means Resend
accepted the message, not that it reached the recipient inbox. Verify delivery
in the Resend dashboard and target mailbox after configuring the environment.
Messages are plain text; the visitor email is `Reply-To`, never `From` or `To`.
Retries with unchanged fields reuse Resend's idempotency key (24-hour window).

Before exposing the form publicly, configure a Vercel Firewall rate-limit rule
for POST `/api/leads` (start with 5 requests per IP per 10 minutes), with bot
protection as needed. The code's bounded in-memory limiter is only a per-instance
backstop, not a distributed serverless limit. Outside Vercel it shares one
bucket; configure rate limiting at your trusted reverse proxy. Origin checking
and a honeypot are not authentication and cannot stop determined bots.

Review the privacy notice against the actual Resend/hosting/mailbox contracts,
accept Resend's DPA and confirm international-transfer safeguards. The operator
must delete concluded enquiries from the mailbox/provider as described in the
notice; this app has no retention worker or database. Do not submit sensitive
guest identity data through the contact form.

## Docker

```bash
docker compose up --build
```

## Structure

- `src/app/checkin/[roomId]` — guest-facing check-in flow (magic link target)
- `src/app/api/checkin/verify` — mock identity verification endpoint
- `src/app/api/pass` — generates and streams the signed `.pkpass`
- `src/lib/mockData.ts` — hardcoded booking data (stand-in for Previo/Mews)
- `src/lib/passkit.ts` — Apple Wallet pass generation (`passkit-generator`)
- `src/passkit-model/roomkey.pass` — pass template (images + `pass.json`)
