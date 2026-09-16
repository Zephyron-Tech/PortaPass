import type { MetadataRoute } from "next";

const BASE = process.env.APP_BASE_URL ?? "https://portapass.zephyron.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ["/", "/podminky", "/ochrana-osobnich-udaju"].map((path) => ({
    url: new URL(path, BASE).toString(),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));
}
