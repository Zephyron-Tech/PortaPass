export type WalletPlatform = "apple" | "google" | "both";

/**
 * iOS -> Apple only (Google Wallet has no real iOS integration). Android ->
 * Google only (Apple Wallet doesn't exist there). Everything else (desktop,
 * any browser) -> both: neither OS nor browser tells you which phone the
 * visitor carries, so let them pick.
 *
 * Known gap: iPadOS Safari sends a desktop-class ("Macintosh") User-Agent by
 * default, so iPads land in "both" rather than being detected as iOS. The
 * Apple button still works there either way — not solvable server-side.
 */
export function detectWalletPlatform(userAgent: string | null): WalletPlatform {
  if (!userAgent) return "both";
  if (/iPad|iPhone|iPod/.test(userAgent)) return "apple";
  if (/Android/.test(userAgent)) return "google";
  return "both";
}
