import { expect, test } from "@playwright/test";

test("desktop walkthrough is a plain-flow carousel, never scroll-jacked", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const section = page.locator(".walkthrough-peel");
  await expect(section.locator(".walkthrough-peel-card")).toHaveCount(3);
  // The section's height is whatever its content needs, not an artificially
  // tall scroll-jack track (the old peel used 320svh).
  const sectionHeight = await section.evaluate((element) => element.getBoundingClientRect().height);
  expect(sectionHeight).toBeLessThan(900);
  // Scrolling the page must not advance the carousel itself.
  const dots = page.locator(".walkthrough-carousel-dots button");
  await expect(dots.first()).toHaveAttribute("data-current", "true");
  await page.mouse.wheel(0, 600);
  await expect(dots.first()).toHaveAttribute("data-current", "true");
});

test("arrows navigate slides and disable at the ends", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const prev = page.getByRole("button", { name: "Předchozí krok" });
  const next = page.getByRole("button", { name: "Další krok" });
  const dots = page.locator(".walkthrough-carousel-dots button");
  await expect(dots).toHaveCount(3);
  await expect(prev).toBeDisabled();
  await expect(next).toBeEnabled();
  await expect(dots.nth(0)).toHaveAttribute("data-current", "true");

  await next.click();
  await expect.poll(() => dots.nth(1).getAttribute("data-current")).toBe("true");
  await expect(prev).toBeEnabled();

  await next.click();
  await expect.poll(() => dots.nth(2).getAttribute("data-current")).toBe("true");
  await expect(next).toBeDisabled();

  await prev.click();
  await expect.poll(() => dots.nth(1).getAttribute("data-current")).toBe("true");
});

test("clicking a dot jumps directly to that slide", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const dots = page.locator(".walkthrough-carousel-dots button");
  await dots.nth(2).click();
  await expect.poll(() => dots.nth(2).getAttribute("data-current")).toBe("true");
  await expect(page.getByRole("button", { name: "Další krok" })).toBeDisabled();
});

test("horizontal trackpad scroll steps to the next/prev slide", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const dots = page.locator(".walkthrough-carousel-dots button");
  const scene = page.locator(".walkthrough-peel-scene");
  await scene.scrollIntoViewIfNeeded();
  const box = (await scene.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

  await page.mouse.wheel(200, 0);
  await expect.poll(() => dots.nth(1).getAttribute("data-current")).toBe("true");

  await page.waitForTimeout(600);
  await page.mouse.wheel(-200, 0);
  await expect.poll(() => dots.nth(0).getAttribute("data-current")).toBe("true");
});

test("vertical wheel over the carousel still scrolls the page, not the slides", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const scene = page.locator(".walkthrough-peel-scene");
  const dots = page.locator(".walkthrough-carousel-dots button");
  await scene.scrollIntoViewIfNeeded();
  const box = (await scene.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await expect(dots.first()).toHaveAttribute("data-current", "true");
});

test("arrows and dots are keyboard reachable with a visible focus ring", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const next = page.getByRole("button", { name: "Další krok" });
  await next.focus();
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  const dots = page.locator(".walkthrough-carousel-dots button");
  await expect.poll(() => dots.nth(1).getAttribute("data-current")).toBe("true");
});
