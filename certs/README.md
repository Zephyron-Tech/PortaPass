# Apple Wallet certificates

Never commit real certificates or keys. This folder is gitignored except this file.

To generate a signable `.pkpass` for the PoC, you need:

1. An Apple Developer account (paid, $99/yr) with a registered **Pass Type ID**
   (e.g. `pass.tech.zephyron.portapass.roomkey` — must match `passTypeIdentifier`
   in [`src/passkit-model/roomkey.pass/pass.json`](../src/passkit-model/roomkey.pass/pass.json)).
2. A certificate issued for that Pass Type ID (`Certificates, Identifiers & Profiles`
   → Identifiers → Pass Type IDs), exported as `.p12` from Keychain Access.
3. The Apple WWDR (Worldwide Developer Relations) intermediate certificate.

Convert with OpenSSL into PEM files the app expects:

```bash
openssl pkcs12 -in Certificates.p12 -clcerts -nokeys -out certs/signerCert.pem
openssl pkcs12 -in Certificates.p12 -nocerts -nodes -out certs/signerKey.pem
openssl x509 -inform der -in AppleWWDRCAG4.cer -out certs/wwdr.pem
```

Then set in `.env.local`:

```
APPLE_WWDR_CERT_PATH=./certs/wwdr.pem
APPLE_SIGNER_CERT_PATH=./certs/signerCert.pem
APPLE_SIGNER_KEY_PATH=./certs/signerKey.pem
APPLE_SIGNER_KEY_PASSPHRASE=your-passphrase-if-any
```

Without these, `/api/pass` returns a 501 with a clear error — the rest of the
check-in flow still works for demoing the UX.

## Deploying (Vercel etc.)

The `certs/` folder is gitignored, so it never reaches the deployment
bundle — file-path env vars won't work there. Instead, base64-encode each
PEM and set it directly as a platform env var:

```bash
base64 -i certs/wwdr.pem | pbcopy        # paste as APPLE_WWDR_CERT_BASE64
base64 -i certs/signerCert.pem | pbcopy  # paste as APPLE_SIGNER_CERT_BASE64
base64 -i certs/signerKey.pem | pbcopy   # paste as APPLE_SIGNER_KEY_BASE64
```

Set those three in the Vercel project's Environment Variables. The
`*_BASE64` vars take priority over the `*_PATH` vars, so local dev keeps
using files while the deployment uses the base64 versions.

**Important:** this only produces a visually correct, installable `.pkpass`.
It does not unlock a real door. See [ROADMAP.md](../ROADMAP.md).
