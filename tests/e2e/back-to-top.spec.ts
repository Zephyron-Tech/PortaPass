import { expect, test } from "@playwright/test";

test("back to top appears after hero and returns to page start", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: "Zpět nahoru" });
  await expect(button).toHaveAttribute("data-visible", "false");
  await page.evaluate(() => scrollTo({ top: innerHeight, behavior: "instant" }));
  await expect(button).toHaveAttribute("data-visible", "true");
  await button.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(button).toHaveAttribute("data-visible", "false");
});
