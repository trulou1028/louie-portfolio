import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * robots.txt (spec §28).
 *
 * Everything public is crawlable — spec §28 notes the site will increasingly
 * be read by AI systems as well as people, and that is a feature here.
 * The API routes are disallowed because they are endpoints, not pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/design-system"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
