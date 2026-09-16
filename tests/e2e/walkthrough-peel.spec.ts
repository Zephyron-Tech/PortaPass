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
