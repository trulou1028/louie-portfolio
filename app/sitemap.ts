import type { MetadataRoute } from "next";

import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";
import { experiments } from "@/content/experiments/experiments";

/**
 * Sitemap (spec §28).
 *
 * Built from `ROUTES` so a new page cannot be added without appearing here.
 * `/design-system` is absent because it is not in `ROUTES` — internal routes
 * stay out of the index by construction rather than by remembering.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const priorities: Record<string, number> = {
    "/": 1,
    "/work": 0.9,
    "/work/ck12-analytics": 0.9,
    "/work/offboard": 0.9,
    "/work/flexi": 0.9,
    "/ai-systems": 0.7,
    "/resume": 0.7,
  };

  const pages = ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    changeFrequency: "monthly" as const,
    priority: priorities[route] ?? 0.5,
  }));

  const experimentPages = experiments.map((experiment) => ({
    url: `${SITE_URL}/experiments/${experiment.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [...new Map([...pages, ...experimentPages].map((page) => [page.url, page])).values()];
}
