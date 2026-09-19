import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

const widths = [320, 375, 768, 1024, 1440];
const checkin = "/checkin/room-101?token=abc";
const verify = "**/api/checkin/verify";
const booking = {
  token: "abc", roomId: "room-101", roomNumber: "101",
  roomType: "Deluxe Double", hotelName: "Hotel Vltava", guestName: "Jan Novák",
  checkIn: "2026-09-15", checkOut: "2026-09-18",
};

async function guestLayout(page: Page, testInfo: TestInfo, state: string) {
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.locator(".guest-screen").evaluate((element) => {
    const actions = element.querySelector(".guest-actions")!;
    const box = element.getBoundingClientRect();
    const actionBox = actions.getBoundingClientRect();
    return {
      viewport: document.documentElement.clientWidth,
      root: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      left: box.left, right: box.right,
      actionLeft: actionBox.left, actionRight: actionBox.right,
      actionBottom: actionBox.bottom, bottom: box.bottom,
      screenHeight: box.height, viewportHeight: window.innerHeight,
      paddingBottom: Number.parseFloat(getComputedStyle(element).paddingBottom),
      position: getComputedStyle(actions).position,
      clipped: [element, document.body, document.documentElement].some((node) =>
        [getComputedStyle(node).overflowX, getComputedStyle(node).overflowY].includes("hidden")),
    };
  });
  expect(metrics.root).toBe(metrics.viewport);
  expect(metrics.body).toBe(metrics.viewport);
  expect(metrics.left).toBeGreaterThanOrEqual(0);
  expect(metrics.right).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.actionLeft).toBeGreaterThanOrEqual(metrics.left);
  expect(metrics.actionRight).toBeLessThanOrEqual(metrics.right);
  expect(metrics.actionBottom).toBeLessThanOrEqual(metrics.bottom);
  expect(metrics.position).toBe("static");
  expect(metrics.clipped).toBe(false);
  if (metrics.viewport < 1024) {
    expect(metrics.bottom - metrics.actionBottom).toBeCloseTo(metrics.paddingBottom, 0);
    if (metrics.screenHeight <= metrics.viewportHeight) {
      expect(metrics.actionBottom).toBeGreaterThan(metrics.viewportHeight * 0.75);
    }
  } else {
    const header = (await page.locator(".guest-screen > header").boundingBox())!;
    const content = (await page.locator(".guest-content").boundingBox())!;
    expect(content.x).toBeGreaterThanOrEqual(header.x + header.width);
    expect(metrics.actionLeft).toBeCloseTo(content.x, 0);
    expect(content.width).toBeGreaterThanOrEqual(380);
  }
  for (const target of await page.locator("a, button:not(.back-to-top), summary").all()) {
    if (!(await target.isVisible())) continue;
    // Read DOM dimensions directly to avoid Firefox protocol quad rounding.
    const box = await target.evaluate((element) => element.getBoundingClientRect().toJSON());
    expect(box.height, await target.innerText()).toBeGreaterThanOrEqual(44);
    expect(box.width, await target.innerText()).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: testInfo.outputPath(`${state}.png`), fullPage: true });
}

async function keyboardFocus(page: Page, target: Locator) {
  const unfocusedShadow = await target.evaluate((element) => getComputedStyle(element).boxShadow);
  // macOS WebKit uses Option+Tab to include links and buttons in keyboard navigation.
  const tab = page.context().browser()?.browserType().name() === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press(tab);
    if (await target.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(target).toBeFocused();
  expect(await target.evaluate((element, previousShadow) => {
    const style = getComputedStyle(element);
    return element.matches(":focus-visible") && (
      (style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 2) ||
      (style.boxShadow !== "none" && style.boxShadow !== previousShadow)
    );
  }, unfocusedShadow)).toBe(true);
}

for (const width of widths) {
  test(`guest demo, pending, error, success and invalid layout at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : width === 375 ? 667 : width === 1024 ? 768 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/demo");
    await expect(page.getByRole("heading", { name: "Vyzkoušejte check-in" })).toBeVisible();
    await guestLayout(page, testInfo, "demo");
    const open = page.getByRole("button", { name: "Otevřít ukázkovou rezervaci" });
    await keyboardFocus(page, open);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new URL(checkin, "http://127.0.0.1:3100").href);
    await expect(page.getByRole("heading", { name: "Ověření hosta" })).toBeVisible();
    await expect(page.getByRole("button", { name: /s Bank iD/ })).toHaveCount(0);
    await guestLayout(page, testInfo, "intro");

    let release!: () => void;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    await page.route(verify, async (route) => {
      await pending;
      await route.fulfill({ status: 500, json: { error: "Injected failure" } });
    });
    try {
      await page.getByRole("button", { name: "Spustit simulaci" }).click();
      await expect(page.getByRole("status")).toHaveText("Načítáme ukázkovou rezervaci…");
      await expect(page.getByRole("button", { name: "Probíhá simulace…" })).toBeDisabled();
      await expect(page.locator(".guest-actions")).toHaveAttribute("aria-busy", "true");
      await guestLayout(page, testInfo, "pending");
    } finally {
      release();
    }
    await expect(page.getByText("Server vrátil neočekávanou odpověď.", { exact: false })).toBeFocused();
    await expect(page.locator(".guest-actions")).toHaveAttribute("aria-busy", "false");
    await guestLayout(page, testInfo, "error");
    await page.unroute(verify);

    const longBooking = {
      ...booking,
      roomNumber: "101".repeat(16), roomType: "DeluxeDouble".repeat(12),
      hotelName: "HotelVltava".repeat(14), guestName: "AlexandraNovakova".repeat(10),
    };
    await page.route(verify, (route) => route.fulfill({ json: { verified: true, booking: longBooking } }));
    await page.getByRole("button", { name: "Spustit simulaci" }).click();
    await expect(page.getByRole("heading", { name: "Ukázkový klíč je připraven" })).toBeFocused();
    await expect(page.getByText("Simulace dokončena. Totožnost nebyla ověřena.")).toBeVisible();
    await expect(page.getByText(/Na iPhonu potvrďte přidání/)).toHaveCount(0);
    await expect(page.locator(".key-card")).toHaveCount(1);
    const card = await page.locator(".key-card").boundingBox();
    expect(card!.width / card!.height).toBeCloseTo(1.586, 2);
    await expect(page.locator(".key-card").locator("..")).toHaveAttribute("aria-hidden", "true");
    await guestLayout(page, testInfo, "success-collapsed");

    const summary = page.getByText("Podrobnosti ukázkové rezervace", { exact: true });
    await keyboardFocus(page, summary);
    await expect(page.locator("details")).not.toHaveAttribute("open");
    await page.keyboard.press("Enter");
    await expect(page.locator("details")).toHaveAttribute("open", "");
    const fields = [
      ["Hotel", longBooking.hotelName], ["Host", longBooking.guestName],
      ["Pokoj", longBooking.roomNumber], ["Typ pokoje", longBooking.roomType],
      ["Příjezd", "15. 9. 2026"], ["Odjezd", "18. 9. 2026"],
    ];
    await expect(page.locator("details dd")).toHaveCount(fields.length);
    for (const [label, value] of fields) {
      const field = page.locator("details dl > div").filter({ has: page.getByText(label, { exact: true }) });
      const detail = field.locator("dd");
      await expect(detail).toBeVisible();
      await expect(detail).toHaveText(value);
      expect(await detail.evaluate((element) => {
        const style = getComputedStyle(element);
        return element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight && style.whiteSpace !== "nowrap" &&
          style.textOverflow !== "ellipsis" && style.overflowWrap === "anywhere";
      })).toBe(true);
    }
    await guestLayout(page, testInfo, "success-expanded");

    await page.goto("/checkin/room-101?token=wrong");
    await expect(page.getByText("K tomuto odkazu se nepodařilo najít rezervaci.", { exact: false })).toBeFocused();
    await expect(page.getByRole("button")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Zpět na ukázku" }).last()).toHaveAttribute("href", "/demo");
    await guestLayout(page, testInfo, "invalid-link");
  });
}

test("real mock POST succeeds and Wallet uses direct document navigation", async ({ page }) => {
  await page.goto(checkin);
  const requestPromise = page.waitForRequest(verify);
  await page.getByRole("button", { name: "Spustit simulaci" }).click();
  const request = await requestPromise;
  expect(request.method()).toBe("POST");
  expect(request.postDataJSON()).toEqual({ roomId: "room-101", token: "abc" });
  await expect(page.getByRole("heading", { name: "Ukázkový klíč je připraven" })).toBeFocused();
  const wallet = page.getByRole("link", { name: "Přidat do Apple Wallet" });
  const href = "/api/pass/room-101/abc/klic-101.pkpass";
  await expect(wallet).toHaveAttribute("href", href);
  await expect(wallet).not.toHaveAttribute("download");
  await expect(wallet).not.toHaveAttribute("target", "_blank");
  const requests: { navigation: boolean; type: string; method: string }[] = [];
  await page.route("**/api/pass/**", async (route) => {
    requests.push({ navigation: route.request().isNavigationRequest(), type: route.request().resourceType(), method: route.request().method() });
    await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Wallet navigation intercepted</title>" });
  });
  await keyboardFocus(page, wallet);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new URL(href, "http://127.0.0.1:3100").href);
  await expect(page).toHaveTitle("Wallet navigation intercepted");
  expect(requests).toEqual([{ navigation: true, type: "document", method: "GET" }]);
});

for (const fault of [
  { name: "HTTP 500", status: 500, body: "{}", message: "Server vrátil neočekávanou odpověď." },
  { name: "malformed JSON", status: 200, body: "{broken", message: "Server vrátil neočekávanou odpověď." },
  { name: "HTTP 404", status: 404, body: "{}", message: "K tomuto odkazu se nepodařilo najít rezervaci." },
  { name: "missing booking fields", status: 200, body: JSON.stringify({ verified: true, booking: { token: "abc", roomId: "room-101" } }), message: "Server vrátil neočekávanou odpověď." },
  { name: "mismatched booking", status: 200, body: JSON.stringify({ verified: true, booking: { ...booking, token: "other" } }), message: "Server vrátil neočekávanou odpověď." },
]) {
  test(`${fault.name} announces error and permits retry`, async ({ page }) => {
    await page.goto(checkin);
    await page.route(verify, (route) => route.fulfill({ status: fault.status, contentType: "application/json", body: fault.body }));
    await page.getByRole("button", { name: "Spustit simulaci" }).click();
    await expect(page.getByText(fault.message, { exact: false })).toBeFocused();
    await expect(page.getByRole("link", { name: "Přidat do Apple Wallet" })).toHaveCount(0);
    await expect(page.getByRole("status")).toBeEmpty();
    await expect(page.getByRole("button", { name: "Spustit simulaci" })).toBeEnabled();
    await page.unroute(verify);
    await page.getByRole("button", { name: "Spustit simulaci" }).click();
    await expect(page.getByRole("heading", { name: "Ukázkový klíč je připraven" })).toBeFocused();
  });
}

test("15-second timeout aborts pending verification and allows recovery", async ({ page }) => {
  await page.goto(checkin);
  await page.evaluate(() => document.fonts.ready);
  const now = new Date("2026-09-15T10:00:00Z");
  await page.clock.install({ time: now });
  await page.clock.pauseAt(new Date(now.getTime() + 1_000));
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route(verify, async (route) => {
    await gate;
    await route.fulfill({ json: { verified: true, booking } });
  });
  const request = page.waitForRequest(verify);
  try {
    await page.getByRole("button", { name: "Spustit simulaci" }).click();
    await request;
    await expect(page.getByRole("button", { name: "Probíhá simulace…" })).toBeDisabled();
    await page.clock.fastForward(14_999);
    await expect(page.getByRole("button", { name: "Probíhá simulace…" })).toBeDisabled();
    await page.clock.fastForward(1);
    await expect(page.getByText("Simulace neodpověděla do 15 sekund. Zkuste ji prosím znovu.")).toBeFocused();
    await expect(page.getByRole("button", { name: "Spustit simulaci" })).toBeEnabled();
  } finally {
    release();
  }
  await page.unrouteAll({ behavior: "wait" });
  await page.clock.resume();
  await page.getByRole("button", { name: "Spustit simulaci" }).click();
  await expect(page.getByRole("heading", { name: "Ukázkový klíč je připraven" })).toBeFocused();
});

test("prototype-like failure reason renders safe generic error", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${checkin}&verify=failed&reason=__proto__`);
  await expect(page.getByText("Ověření se nezdařilo. Zkuste to prosím znovu.")).toBeFocused();
  await expect(page.getByRole("button", { name: "Spustit simulaci" })).toBeEnabled();
  expect(errors).toEqual([]);
});

test("unverified success query and reload never invent an identity session", async ({ page }) => {
  await page.goto(`${checkin}&verify=ok`);
  await expect(page.getByRole("button", { name: "Spustit simulaci" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Přidat do Apple Wallet" })).toHaveCount(0);
  await page.getByRole("button", { name: "Spustit simulaci" }).click();
  await expect(page.getByText("Simulace dokončena. Totožnost nebyla ověřena.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Spustit simulaci" })).toBeVisible();
});

test("200 percent text sizing keeps guest details and action reachable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(checkin);
  await page.getByRole("button", { name: "Spustit simulaci" }).click();
  await expect(page.getByRole("heading", { name: "Ukázkový klíč je připraven" })).toBeFocused();
  await page.getByText("Podrobnosti ukázkové rezervace", { exact: true }).click();
  // Magnify authored text, excluding the decorative card whose full data is in details.
  await page.evaluate(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>("h1, p, summary, dt, dd, a")]
      .filter((node) => !node.closest('[aria-hidden="true"]'));
    const sizes = nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize));
    nodes.forEach((node, i) => { node.style.fontSize = `${sizes[i] * 2}px`; });
  });
  await guestLayout(page, testInfo, "enlarged-text");
  await page.getByRole("link", { name: "Přidat do Apple Wallet" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Přidat do Apple Wallet" })).toBeInViewport();
  await expect(page.locator("details dd").filter({ hasText: "Jan Novák" })).toBeVisible();
});

for (const width of widths) {
  test(`BankID-branded button brand, focus, active state, and mocked verification (redirect hidden) at ${width}px`, async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const unexpected: string[] = [];
    const starts: string[] = [];
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== "http://127.0.0.1:3101") {
        unexpected.push(url.origin);
        await route.abort();
      } else if (url.pathname === "/api/auth/bankid/start") {
        starts.push(url.href);
        expect(route.request().isNavigationRequest()).toBe(true);
        await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>BankID start intercepted</title>" });
      } else {
        await route.continue();
      }
    });
    await page.goto(`http://127.0.0.1:3101${checkin}`);
    await page.evaluate(() => document.fonts.ready);
    const button = page.getByRole("button", { name: "Ověřit se s Bank iD" });
    await expect(button).toBeVisible();
    await expect(page.getByRole("button", { name: "Spustit simulaci" })).toHaveCount(0);
    const readMetrics = () => button.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        width: box.width, height: box.height,
        radius: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius, style.borderBottomRightRadius],
        background: style.backgroundColor, color: style.color, transform: style.transform,
      };
    });
    const before = await readMetrics();
    expect(before.height).toBe(48);
    expect(before.radius).toEqual(["8px", "8px", "8px", "8px"]);
    expect(before.background).toBe("rgb(0, 0, 0)");
    expect(before.color).toBe("rgb(255, 255, 255)");
    expect(before.transform).toBe("none");
    const path = button.locator("svg path");
    const artwork = (await path.boundingBox())!;
    const buttonBox = (await button.boundingBox())!;
    const divider = (await button.locator("span[aria-hidden]").boundingBox())!;
    expect(artwork.width).toBeGreaterThanOrEqual(80);
    const clearZone = artwork.width * 0.16;
    expect(artwork.x - buttonBox.x).toBeGreaterThanOrEqual(clearZone);
    expect(artwork.y - buttonBox.y).toBeGreaterThanOrEqual(clearZone);
    expect(buttonBox.y + buttonBox.height - artwork.y - artwork.height).toBeGreaterThanOrEqual(clearZone);
    expect(divider.x - artwork.x - artwork.width).toBeGreaterThanOrEqual(clearZone);
    await expect(path).toHaveCSS("fill", "rgb(255, 255, 255)");
    const font = await button.locator("span").last().evaluate((element) => {
      const style = getComputedStyle(element);
      const family = style.fontFamily.split(",")[0].trim();
      return {
        family, weight: style.fontWeight,
        checked: document.fonts.check(`${style.fontWeight} ${style.fontSize} ${family}`, element.textContent ?? ""),
        loaded: Array.from(document.fonts).some((face) =>
          face.family.replaceAll('"', "").replaceAll("'", "") === family.replaceAll('"', "").replaceAll("'", "") &&
          face.status === "loaded" && face.weight === style.fontWeight),
      };
    });
    expect(font.family).toMatch(/poppins/i);
    expect(font.family).not.toMatch(/fallback/i);
    expect(font.weight).toBe("500");
    expect(font.checked).toBe(true);
    expect(font.loaded).toBe(true);
    await keyboardFocus(page, button);
    await guestLayout(page, testInfo, "bankid-focused");
    await button.hover();
    await page.mouse.down();
    expect(await button.evaluate((element) => element.matches(":active"))).toBe(true);
    expect(await readMetrics()).toEqual(before);
    await page.screenshot({ path: testInfo.outputPath("bankid-active.png"), fullPage: true });
    await page.mouse.up();
    // BankID sandbox redirect is hidden for now: clicking the branded
    // button runs the same mocked verification as the no-BankID path
    // instead of navigating away.
    await expect(page.getByRole("heading", { name: "Ukázkový klíč je připraven" })).toBeVisible();
    expect(starts).toHaveLength(0);

    for (const invalid of ["/checkin/room-101", "/checkin/missing?token=abc", "/checkin/room-101?token=wrong", "/checkin/room-101?token=abc&token=other"]) {
      await page.goto(`http://127.0.0.1:3101${invalid}`);
      await expect(page.getByRole("button", { name: /Bank iD/ })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Zpět na ukázku" }).last()).toBeVisible();
    }
    expect(starts).toHaveLength(0);
    expect(unexpected).toEqual([]);
  });
}
