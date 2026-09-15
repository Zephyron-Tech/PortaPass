# Browser Tests

Run against a current production build, not `next dev`:

```sh
npx playwright install chromium firefox webkit
npm run build
npx playwright test
```

Build is a separate prerequisite; the test configuration never builds or edits the app. Both ports 3100 and 3101 must be free. Playwright starts and stops two production Next servers and refuses to reuse an unknown server/environment.

- Port 3100 explicitly empties BankID settings so inherited environment variables and `.env.local` cannot enable the provider.
- Port 3101 uses fake credentials and a loopback issuer solely to render the actual BankID button. Browser interception fulfills the start navigation before it reaches the server; external browser requests are blocked and fail the test.
- Wallet navigation is intercepted as an HTML document. No pass signing material or real provider credentials are needed. Provider authentication and signed `.pkpass` contents are outside this suite.
- Chromium, Firefox, and WebKit exercise widths 320, 375, 768, 1024, and 1440. Screenshots, computed contrast attachments, and failure traces live under ignored `test-results/`, not committed baselines.
- Scroll timeline support is detected in the browser. Supporting engines must advance animation `currentTime` on scroll; unsupported engines must retain opaque content. Reduced-motion behavior is checked separately.
- HTTP errors, malformed responses, invalid links, long booking values, and the existing 15-second timeout are injected at the browser boundary, without changing APIs.

Focused runs:

```sh
npx playwright test --project=chromium
npx playwright test -g 'BankID button'
npx playwright test -g 'timeout'
```

Screenshots document actual renders; no screenshot comparison is implied. Contrast checks use browser-parsed computed text color against both root-gradient endpoint colors, not a hardcoded expected ratio. Browser automation cannot validate iPhone Wallet handoff, physical safe-area chrome, or real door access.

## Device Release Check

- On a real iPhone, expand/collapse Safari toolbars and rotate to landscape. Root background must paint status bar and overscroll; actions must clear the home indicator and cutouts.
- Complete configured Bank iD sandbox login, cancellation, expired-session return, and browser Back. Confirm the existing PS512/PKCE/client_secret_post flow without recording credentials or tokens.
- Install the signed pass and cancel/retry the Safari sheet. Check `application/vnd.apple.pkpass`, `Cache-Control: no-store`, and no `Content-Disposition` on both pass routes. The Safari confirmation sheet is expected, not a defect to work around.
- Run VoiceOver/NVDA through route changes, waiting, errors, success and expanded booking details. Automated focus assertions do not replace assistive-technology testing.
- Missing signing certificates and generation failures still navigate to existing API JSON responses; no frontend-only claim of recovery or Wallet installation confirmation is made.
- Pass issuance remains authorized by the demo booking link rather than Bank iD session. Resolve that separately before real guest credentials or door access; this frontend change does not alter authorization policy.
