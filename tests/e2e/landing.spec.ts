import { expect, test, type Page } from "@playwright/test";

const widths = [320, 375, 768, 1024, 1440];

async function noOverflow(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.evaluate(() => ({
    root: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(metrics.root).toBe(metrics.viewport);
  expect(metrics.body).toBe(metrics.viewport);
}

for (const width of widths) {
  test(`landing layout and targets at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : width === 375 ? 667 : width === 1024 ? 768 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check-in začíná před příjezdem.");
    await noOverflow(page);

    await expect(page.locator(".hero-card")).toHaveCount(1);
    await expect(page.locator(".key-card")).toHaveCount(1);
    await expect(page.locator("[data-reveal] [data-reveal]")).toHaveCount(0);
    const card = await page.locator(".key-card").boundingBox();
    expect(card).not.toBeNull();
    expect(card!.width / card!.height).toBeCloseTo(1.586, 2);
    await expect(page.locator(".hero-card-sticky")).toHaveCSS("position", width < 1024 ? "static" : "sticky");
    if (width < 1024) {
      const intro = (await page.locator(".hero-intro").boundingBox())!;
      const card = (await page.locator(".hero-card-sticky").boundingBox())!;
      const reasons = (await page.locator(".hero-reasons").boundingBox())!;
      expect(card.y).toBeGreaterThanOrEqual(intro.y + intro.height);
      expect(reasons.y).toBeGreaterThanOrEqual(card.y + card.height);
    }
    expect(await page.locator(".hero-card-sticky").evaluate((element) => {
      const offenders: string[] = [];
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if ([style.overflowX, style.overflowY].some((value) => ["hidden", "auto", "scroll"].includes(value))) {
          offenders.push(`${parent.tagName}.${parent.className}`);
        }
      }
      return offenders;
    })).toEqual([]);

    const panels = page.locator(".walkthrough-peel-card");
    await expect(panels).toHaveCount(3);
    const second = panels.nth(1);
    const copy = await second.locator(".walkthrough-copy").boundingBox();
    const device = await second.locator(".walkthrough-device").boundingBox();
    expect(copy).not.toBeNull();
    expect(device).not.toBeNull();
    if (width >= 768) {
      const tracks = await second.locator(".walkthrough-peel-content").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").map(Number.parseFloat));
      expect(tracks).toHaveLength(2);
      expect(tracks[1]).toBeGreaterThanOrEqual(272);
      expect(device!.width).toBeCloseTo(272, 0);
      expect(device!.x).toBeGreaterThan(copy!.x + copy!.width);
      await expect(page.locator(".walkthrough-peel-sticky")).toHaveCSS("position", "static");
    } else {
      expect(device!.y).toBeGreaterThanOrEqual(copy!.y + copy!.height);
    }

    const links = page.locator("a");
    expect(await links.count()).toBeGreaterThan(10);
    for (const link of await links.all()) {
      if (!(await link.isVisible())) continue;
      // Firefox's protocol quad subtraction can turn an exact 44px width into 43.99998px.
      const box = await link.evaluate((element) => element.getBoundingClientRect().toJSON());
      expect(box.height, await link.innerText()).toBeGreaterThanOrEqual(44);
      expect(box.width, await link.innerText()).toBeGreaterThanOrEqual(44);
    }
    for (const reveal of await page.locator("[data-reveal]").all()) {
      await expect(reveal).toHaveCSS("opacity", "1");
      await expect(reveal).toHaveCSS("animation-name", "none");
    }
    await expect(page.locator(".hero-card")).toHaveCSS("transform", "none");
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true });
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await noOverflow(page);
  });
}

test("footer destinations and keyboard focus", async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // macOS WebKit uses Option+Tab to include links regardless of system preferences.
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  const focused = page.locator(":focus-visible");
  await expect(focused).toHaveCount(1);
  expect(await focused.evaluate((element) => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 2;
  })).toBe(true);

  const destinations = [
    ["Demo", "/demo", "Vyzkoušejte check-in"],
    ["Podmínky použití", "/podminky", "Podmínky použití"],
    ["Ochrana osobních údajů", "/ochrana-osobnich-udaju", "Ochrana osobních údajů"],
  ];
  for (const [name, href, heading] of destinations) {
    const link = page.getByRole("contentinfo").getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await link.click();
    await expect(page).toHaveURL(new URL(href, "http://127.0.0.1:3100").href);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await page.goto("/");
  }
  const contact = page.getByRole("contentinfo").getByRole("button", { name: "Kopírovat e-mail hello@zephyron.tech" });
  await expect(contact).toHaveText("hello@zephyron.tech");
});

test("CTA variants preserve primary, quiet and inverse hierarchy", async ({ page }) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const primary = page.locator(".hero-actions a").first();
  const quiet = page.locator(".hero-actions a").last();
  const inverse = page.locator("#pilot a");
  await expect(primary).toHaveCSS("background-color", "rgb(20, 18, 15)");
  await expect(quiet).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(quiet).toHaveCSS("color", "rgb(60, 55, 47)");
  await expect(inverse).toHaveCSS("background-color", "rgb(245, 239, 230)");
  await expect(inverse).toHaveCSS("color", "rgb(20, 18, 15)");
});

test("custom controls have branded selection and hover feedback", async ({ page }) => {
  await page.goto("/");
  const selection = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement, "::selection");
    return { background: style.backgroundColor, color: style.color };
  });
  expect(selection).toEqual({ background: "rgb(245, 196, 94)", color: "rgb(20, 18, 15)" });
  const button = page.locator(".hero-actions a").first();
  await button.hover();
  await expect(button).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)");
});

test("device slots reserve the same bounds when an image arrives", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const slot = page.locator(".walkthrough-device figure > div").first();
  const before = (await slot.boundingBox())!;
  expect(before.height / before.width).toBeCloseTo(19.5 / 9, 2);
  await slot.evaluate(async (element) => {
    const image = new Image();
    image.alt = "Test rozměrů rezervovaného prostoru";
    image.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain";
    image.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1950"><rect width="900" height="1950" fill="white"/></svg>');
    await image.decode();
    element.replaceChildren(image);
  });
  expect(await slot.boundingBox()).toEqual(before);
});

test("walkthrough mockups are eagerly loaded before the desktop scene appears", async ({ page }) => {
  await page.goto("/");
  const shots = page.locator(".walkthrough-peel .walkthrough-device img");
  await expect(shots).toHaveCount(3);
  await expect(shots.nth(0)).toHaveAttribute("loading", "eager");
  await expect(shots.nth(1)).toHaveAttribute("loading", "eager");
  await expect(shots.nth(2)).toHaveAttribute("loading", "eager");
});

test("root paints the canvas; real secondary text meets contrast", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const colors = await page.locator(".hero-intro p.text-ink-2").filter({ hasText: "Ověření hosta" }).evaluate((element) => {
    const root = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgba = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    };
    return {
      text: element.textContent,
      ink: rgba(getComputedStyle(element).color),
      root: rgba(root.backgroundColor),
      top: rgba(root.getPropertyValue("--background-top")),
      body: rgba(body.backgroundColor),
      rootImage: root.backgroundImage,
      bodyImage: body.backgroundImage,
    };
  });
  expect(colors.text).toContain("Ověření hosta");
  expect(colors.root[3]).toBe(255);
  expect(colors.body[3]).toBe(0);
  expect(colors.rootImage).toContain("linear-gradient");
  expect(colors.bodyImage).toBe("none");
  const luminance = (rgb: number[]) => rgb.slice(0, 3).reduce((sum, channel, index) => {
    const value = channel / 255;
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
  const ratios = [colors.root, colors.top].map((background) => {
    const ink = colors.ink.slice(0, 3).map((channel, index) =>
      channel * colors.ink[3] / 255 + background[index] * (1 - colors.ink[3] / 255));
    const levels = [luminance(ink), luminance(background)].sort((a, b) => a - b);
    return (levels[1] + 0.05) / (levels[0] + 0.05);
  });
  await testInfo.attach("computed-contrast", {
    body: JSON.stringify({ ...colors, ratios }, null, 2), contentType: "application/json",
  });
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
});
