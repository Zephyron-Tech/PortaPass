import { expect, test } from "@playwright/test";

test("peel preserves readable width and never blends two steps", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const section = page.locator(".walkthrough-peel");
  await expect(section).toHaveAttribute("data-enhanced", "true");
  const content = section.locator(".walkthrough-peel-content");
  for (const progress of [0, 0.2, 0.28, 0.4, 0.62, 0.72, 0.86, 1, 0.4, 0]) {
    await section.evaluate((element, value) => {
      window.scrollTo({
        top: element.getBoundingClientRect().top + scrollY + (element.clientHeight - innerHeight) * value,
        behavior: "instant",
      });
    }, progress);
    const current = progress < 0.26 ? 0 : progress < 0.68 ? 1 : 2;
    await expect(section.locator(".walkthrough-peel-card").nth(current)).not.toHaveAttribute("aria-hidden", "true");
    await expect.poll(async () => content.evaluateAll((elements) =>
      elements.filter((element) => Number(getComputedStyle(element).opacity) > 0.01).length,
    )).toBeLessThanOrEqual(1);
    const widths = await section.locator(".walkthrough-copy").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
    expect(widths.every((width) => width > 340)).toBe(true);
    if (progress === 0 || progress === 0.4 || progress >= 0.86) {
      await expect(content.nth(current)).toHaveCSS("opacity", "1");
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(section).toHaveAttribute("data-enhanced", "false");
  await expect(section.locator(".walkthrough-peel-sticky")).toHaveCSS("position", "static");
  for (const card of await content.all()) await expect(card).toHaveCSS("opacity", "1");
});

test("wheel advances a visible peel stage once", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const section = page.locator(".walkthrough-peel");
  await expect(section).toHaveAttribute("data-enhanced", "true");
  await section.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: "instant" }));
  await page.waitForTimeout(250);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 240);
  await expect.poll(() => section.locator(".walkthrough-peel-content").nth(1).evaluate((element) => Number(getComputedStyle(element).opacity))).toBe(1);
  await expect(section.locator(".walkthrough-peel-card").nth(1)).not.toHaveAttribute("aria-hidden", "true");
});

test("fast entry settles on 01 and transitions are speed limited", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const section = page.locator(".walkthrough-peel");
  await expect(section).toHaveAttribute("data-enhanced", "true");
  await page.evaluate(() => document.fonts.ready);
  const { start, distance } = await section.evaluate((element) => ({
    start: element.getBoundingClientRect().top + scrollY,
    distance: element.clientHeight - innerHeight,
  }));
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), start - 400);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 1800);
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(50);
    await page.mouse.wheel(0, 400);
  }
  await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - start)).toBeLessThan(2);
  await expect(section.locator(".walkthrough-peel-content").first()).toHaveCSS("opacity", "1");
  await page.waitForTimeout(700);

  for (const destination of [0.34, 0.78]) {
    // The visually static hold is skipped before the speed-limited peel.
    await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), start + distance * (destination === 0.34 ? 0.16 : 0.58));
    const sampling = page.evaluate(async () => {
      const points: { y: number; t: number }[] = [];
      const until = performance.now() + 2600;
      while (performance.now() < until) {
        await new Promise(requestAnimationFrame);
        points.push({ y: scrollY, t: performance.now() });
      }
      return points;
    });
    await page.mouse.wheel(0, 240);
    const points = await sampling;
    const speeds = points.slice(1).map((point, i) => Math.abs(point.y - points[i].y) * 1000 / (point.t - points[i].t));
    // Allow pixel rounding and browser frame timestamp jitter.
    expect(Math.max(...speeds)).toBeLessThan(800);
    expect(Math.abs(await page.evaluate(() => scrollY) - (start + distance * destination))).toBeLessThan(2);
    await page.waitForTimeout(700);
  }
  const end = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(end + 200);
});

test("entry consumes momentum but a fresh gesture continues promptly", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const section = page.locator(".walkthrough-peel");
  await expect(section).toHaveAttribute("data-enhanced", "true");
  await page.evaluate(() => document.fonts.ready);
  await section.evaluate((element) => scrollTo({ top: element.getBoundingClientRect().top + scrollY - 300, behavior: "instant" }));
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 1200);
  const first = section.locator(".walkthrough-peel-content").first();
  for (let i = 0; i < 24; i++) {
    await page.waitForTimeout(60);
    await page.mouse.wheel(0, 80);
  }
  await expect(first).toHaveCSS("opacity", "1");
  await page.waitForTimeout(220);
  await page.mouse.wheel(0, 240);
  await expect.poll(() => first.evaluate((e) => Number(getComputedStyle(e).opacity)), { timeout: 700 }).toBeLessThan(0.95);
  await expect(section.locator(".walkthrough-peel-content").nth(1)).toHaveCSS("opacity", "1");
  await expect(section.locator(".walkthrough-peel-content").nth(2)).toHaveCSS("opacity", "0");
});
