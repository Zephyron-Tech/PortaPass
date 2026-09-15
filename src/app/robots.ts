import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Guest check-in URLs carry booking tokens, and the API returns signed
      // passes — neither belongs in a search index.
      disallow: ["/api/", "/checkin/"],
    },
    sitemap: new URL(
      "/sitemap.xml",
      process.env.APP_BASE_URL ?? "https://portapass.zephyron.tech",
    ).toString(),
  };
}
