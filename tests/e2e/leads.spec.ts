import { expect, test as base, type Page } from "@playwright/test";

const labels = {
  hotel: "Hotel nebo penzion",
  email: "Kontaktn\u00ed e-mail",
  phone: "Telefon (nepovinn\u00e9)",
  message: "Zpr\u00e1va (nepovinn\u00e9)",
};
const submitName = "Odeslat popt\u00e1vku";
const successName = "Popt\u00e1vka byla odesl\u00e1na";
const uuid = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const lead = { hotel: "Hotel Test", email: "owner@example.test", phone: "+420 123 456 789", message: "Please arrange a demo." };

const test = base.extend<{ networkGuard: void }>({
  networkGuard: [async ({ context, baseURL }, use) => {
    const unexpected: string[] = [];
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(baseURL!).origin || url.pathname === "/api/leads") {
        unexpected.push(`${route.request().method()} ${url.href}`);
        await route.abort();
        return;
      }
      await route.continue();
    });
    await use();
    expect(unexpected, "External requests and unmocked lead requests must never escape").toEqual([]);
  }, { auto: true }],
});

async function fillLead(page: Page, values = lead) {
  for (const field of Object.keys(labels) as (keyof typeof labels)[]) {
    await page.getByLabel(labels[field], { exact: true }).fill(values[field]);
  }
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("required labels and native validation block invalid submissions", async ({ page }, testInfo) => {
  await page.goto("/#kontakt");
  const hotel = page.getByLabel(labels.hotel, { exact: true });
  const email = page.getByLabel(labels.email, { exact: true });
  await expect(hotel).toHaveAttribute("required", "");
  await expect(email).toHaveAttribute("required", "");
  await expect(email).toHaveAttribute("type", "email");
  await expect(page.getByLabel(labels.phone, { exact: true })).not.toHaveAttribute("required");
  await expect(page.getByLabel(labels.message, { exact: true })).not.toHaveAttribute("required");
  await expect(page.locator('input[name="website"]')).toBeHidden();
  await page.getByRole("button", { name: submitName }).click();
  await expect(hotel).toBeFocused();
  expect(await hotel.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
  await hotel.fill(lead.hotel);
  await email.fill("not-an-email");
  await page.getByRole("button", { name: submitName }).click();
  await expect(email).toBeFocused();
  expect(await email.evaluate((element: HTMLInputElement) => element.validity.typeMismatch)).toBe(true);
  await expect(page.locator("#kontakt form")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("#kontakt").getByRole("alert")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("leads-native-validation.png"), fullPage: true });
});

test("keyboard navigation gives the submit button a visible ink outline", async ({ page, browserName }, testInfo) => {
  await page.goto("/#kontakt");
  const form = page.locator("#kontakt form");
  const tab = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  await form.getByLabel(labels.phone, { exact: true }).focus();
  await page.keyboard.press(tab);
  await expect(form.getByLabel(labels.message, { exact: true })).toBeFocused();
  await page.keyboard.press(tab);
  const submit = form.getByRole("button", { name: submitName });
  await expect(submit).toBeFocused();
  await expect(form.locator(":focus-visible")).toHaveCount(1);
  await expect(submit).toHaveCSS("outline-color", "rgb(20, 18, 15)");
  expect(await submit.evaluate((element) => {
    const style = getComputedStyle(element);
    return !["none", "hidden"].includes(style.outlineStyle) && Number.parseFloat(style.outlineWidth) >= 2;
  })).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("leads-submit-keyboard-focus.png"), fullPage: true });
});

test("empty optional fields submit successfully and focus confirmation", async ({ page }, testInfo) => {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/leads", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().headers()["content-type"]).toBe("application/json");
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.goto("/#kontakt");
  await page.getByLabel(labels.hotel, { exact: true }).fill("  Hotel Test  ");
  await page.getByLabel(labels.email, { exact: true }).fill("OWNER@EXAMPLE.TEST");
  await page.getByRole("button", { name: submitName }).click();
  const heading = page.getByRole("heading", { name: successName });
  await expect(heading).toBeFocused();
  await expect(page.locator("#kontakt").getByRole("status")).toContainText(lead.email);
  await expect(page.locator("#kontakt form")).toHaveCount(0);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toEqual({ hotel: lead.hotel, email: lead.email, phone: "", message: "", website: "", submissionId: expect.stringMatching(uuid) });
  await page.screenshot({ path: testInfo.outputPath("leads-success.png"), fullPage: true });
});

test("pending submission blocks duplicates; failed retry preserves data and ID", async ({ page }, testInfo) => {
  const requests: Record<string, unknown>[] = [];
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/leads", async (route) => {
    expect(route.request().method()).toBe("POST");
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) {
      await gate;
      await route.fulfill({ status: 502, json: { error: "provider-private-error" } });
    } else {
      await route.fulfill({ status: 200, json: { ok: true } });
    }
  });
  await page.goto("/#kontakt");
  await fillLead(page);
  const form = page.locator("#kontakt form");
  await page.getByRole("button", { name: submitName }).click();
  try {
    await expect.poll(() => requests.length).toBe(1);
    await expect(form).toHaveAttribute("aria-busy", "true");
    await expect(form.getByRole("button")).toBeDisabled();
    for (const label of Object.values(labels)) await expect(page.getByLabel(label, { exact: true })).toBeDisabled();
    await expect(form.getByRole("status")).toContainText("Odes\u00edl\u00e1n\u00ed popt\u00e1vky");
    await form.evaluate((element: HTMLFormElement) => {
      element.requestSubmit();
      element.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await page.screenshot({ path: testInfo.outputPath("leads-pending.png"), fullPage: true });
    expect(requests).toHaveLength(1);
  } finally {
    release();
  }
  await expect(form.getByRole("alert")).toBeFocused();
  await expect(form.getByRole("alert")).not.toContainText("provider-private-error");
  await expect(form).toHaveAttribute("aria-busy", "false");
  for (const field of Object.keys(labels) as (keyof typeof labels)[]) {
    await expect(page.getByLabel(labels[field], { exact: true })).toHaveValue(lead[field]);
  }
  await page.getByRole("button", { name: submitName }).click();
  await expect(page.getByRole("heading", { name: successName })).toBeFocused();
  expect(requests).toHaveLength(2);
  expect(requests[0]).toEqual({ ...lead, website: "", submissionId: expect.stringMatching(uuid) });
  expect(requests[1]).toEqual(requests[0]);
});

for (const failure of ["rejected", "unavailable", "rate-limited", "network", "malformed", "false-success"] as const) {
  test(`${failure} preserves fields and provides accessible error and email fallback`, async ({ page }, testInfo) => {
    await page.route("**/api/leads", async (route) => {
      expect(route.request().method()).toBe("POST");
      if (failure === "network") await route.abort("failed");
      else if (failure === "malformed") await route.fulfill({ status: 200, contentType: "application/json", body: "{" });
      else await route.fulfill({
        status: failure === "rejected" ? 502 : failure === "unavailable" ? 503 : failure === "rate-limited" ? 429 : 200,
        json: { error: "private-provider-detail" },
      });
    });
    await page.goto("/#kontakt");
    await fillLead(page);
    await page.getByRole("button", { name: submitName }).click();
    const alert = page.locator("#kontakt").getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toBeFocused();
    await expect(alert).toContainText(failure === "rate-limited" ? "P\u0159\u00edli\u0161 mnoho pokus\u016f" : "Popt\u00e1vku se nepoda\u0159ilo odeslat");
    await expect(alert).not.toContainText("private-provider-detail");
    await expect(page.getByRole("button", { name: submitName })).toBeEnabled();
    await expect(page.getByRole("heading", { name: successName })).toHaveCount(0);
    for (const field of Object.keys(labels) as (keyof typeof labels)[]) {
      await expect(page.getByLabel(labels[field], { exact: true })).toHaveValue(lead[field]);
    }
    const fallback = page.getByRole("link", { name: "Napsat e-mailem", exact: true });
    await expect(fallback).toBeVisible();
    const mail = new URL((await fallback.getAttribute("href"))!);
    expect(mail.protocol).toBe("mailto:");
    expect(mail.pathname).toBe("hello@zephyron.tech");
    await page.screenshot({ path: testInfo.outputPath(`leads-${failure}.png`), fullPage: true });
  });
}

test("server field errors are associated and focused; edited payload gets a new ID", async ({ page }, testInfo) => {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/leads", async (route) => {
    expect(route.request().method()).toBe("POST");
    requests.push(route.request().postDataJSON());
    await route.fulfill(requests.length === 1
      ? { status: 400, json: { error: "untrusted error", fields: { phone: "untrusted phone error" } } }
      : { status: 200, json: { ok: true } });
  });
  await page.goto("/#kontakt");
  await fillLead(page, { ...lead, phone: "abc" });
  await page.getByRole("button", { name: submitName }).click();
  const phone = page.getByLabel(labels.phone, { exact: true });
  await expect(phone).toBeFocused();
  await expect(phone).toHaveAttribute("aria-invalid", "true");
  await expect(phone).toHaveAccessibleDescription(/Telefon mus\u00ed obsahovat alespo\u0148 6 \u010d\u00edslic/);
  await expect(phone).toHaveAttribute("aria-describedby", /.+-error$/);
  await expect(page.locator("#kontakt").getByRole("alert")).toHaveText("Zkontrolujte pros\u00edm ozna\u010den\u00e1 pole.");
  await expect(page.locator("#kontakt")).not.toContainText("untrusted");
  await page.screenshot({ path: testInfo.outputPath("leads-field-error.png"), fullPage: true });
  await phone.fill(lead.phone);
  await page.getByRole("button", { name: submitName }).click();
  await expect(page.getByRole("heading", { name: successName })).toBeFocused();
  expect(requests).toHaveLength(2);
  expect(requests[0].submissionId).toMatch(uuid);
  expect(requests[1]).toEqual({ ...lead, website: "", submissionId: expect.stringMatching(uuid) });
  expect(requests[1].submissionId).not.toBe(requests[0].submissionId);
});

for (const width of [320, 1440]) {
  test(`contact form and errors have no overflow at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/leads", async (route) => {
      expect(route.request().method()).toBe("POST");
      await route.fulfill({ status: 400, json: { fields: { hotel: "invalid", email: "invalid", phone: "invalid", message: "invalid" } } });
    });
    await page.goto("/#kontakt");
    await fillLead(page, { hotel: "H".repeat(160), email: `${"e".repeat(60)}@example.test`, phone: lead.phone, message: "M".repeat(2000) });
    await page.evaluate(() => document.fonts.ready);
    for (const state of ["filled", "errors"]) {
      if (state === "errors") {
        await page.getByRole("button", { name: submitName }).click();
        await expect(page.locator("#kontakt").getByRole("alert")).toBeVisible();
      }
      const metrics = await page.locator("#kontakt form").evaluate((form) => ({
        root: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        viewport: document.documentElement.clientWidth,
        form: form.scrollWidth,
        available: form.clientWidth,
        controls: Array.from(form.querySelectorAll("input:not([name=website]), textarea, button")).map((element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right };
        }),
      }));
      expect(metrics.root).toBe(metrics.viewport);
      expect(metrics.body).toBe(metrics.viewport);
      expect(metrics.form).toBeLessThanOrEqual(metrics.available);
      for (const control of metrics.controls) {
        expect(control.left).toBeGreaterThanOrEqual(0);
        expect(control.right).toBeLessThanOrEqual(width);
      }
      await page.screenshot({ path: testInfo.outputPath(`leads-${width}-${state}.png`), fullPage: true });
    }
  });
}

test("all demo CTAs and homepage header contact navigate to the visible contact anchor", async ({ page }, testInfo) => {
  await page.goto("/");
  const ctas = page.getByRole("link", { name: "Domluvit uk\u00e1zku", exact: true });
  expect(await ctas.count()).toBeGreaterThan(0);
  for (let index = 0; index < await ctas.count(); index++) {
    await page.goto("/");
    await expect(ctas.nth(index)).toHaveAttribute("href", "#kontakt");
    await ctas.nth(index).click();
    await expect(page).toHaveURL(/\/#kontakt$/);
    await expect(page.locator("#kontakt")).toBeInViewport();
  }
  await page.goto("/");
  const contact = page.getByRole("banner").getByRole("link", { name: "Kontakt", exact: true });
  await expect(contact).toHaveAttribute("href", "/#kontakt");
  await contact.click();
  await expect(page).toHaveURL(/\/#kontakt$/);
  await expect(page.locator("#kontakt")).toBeInViewport();
  await expect(page.getByLabel(labels.hotel, { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("leads-contact-anchor.png"), fullPage: true });
});
