import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";

const mockEnv = {
  RESEND_API_KEY: "",
  BANKID_CLIENT_ID: "",
  BANKID_CLIENT_SECRET: "",
  BANKID_REDIRECT_URI: "",
  BANKID_ISSUER: "",
  BANKID_SCOPES: "",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 3,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: "test-results",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    viewport: { width: 1440, height: 900 },
    locale: "cs-CZ",
    timezoneId: "Europe/Prague",
    colorScheme: "light",
    reducedMotion: "no-preference",
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // Firefox's macOS profile service uses CoreFoundation's home, not HOME.
        launchOptions: process.platform === "darwin"
          ? { env: { ...process.env, CFFIXED_USER_HOME: tmpdir() } }
          : {},
      },
    },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: [
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/demo",
      reuseExistingServer: false,
      env: { ...mockEnv, APP_BASE_URL: "http://127.0.0.1:3100" },
    },
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3101",
      url: "http://127.0.0.1:3101/demo",
      reuseExistingServer: false,
      env: {
        ...mockEnv,
        APP_BASE_URL: "http://127.0.0.1:3101",
        BANKID_CLIENT_ID: "playwright-fake-client",
        BANKID_CLIENT_SECRET: "playwright-fake-secret-not-a-credential",
        BANKID_REDIRECT_URI: "http://127.0.0.1:3101/api/auth/bankid/callback",
        // Defense in depth: even an escaped interception cannot reach a provider.
        BANKID_ISSUER: "http://127.0.0.1:3101/playwright-no-provider/",
      },
    },
  ],
});
