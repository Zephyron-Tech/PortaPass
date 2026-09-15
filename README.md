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
