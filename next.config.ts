import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Long-form case-study content is authored in MDX (spec §3, §4).
  pageExtensions: ["ts", "tsx", "mdx"],

  // Pin the workspace root. Without this, Next infers it from the nearest
  // lockfile and walks up to the home directory, which holds an unrelated
  // package.json.
  turbopack: {
    root: __dirname,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // `microphone=()` is correct today; Plan 009 voice mode revisits it.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

/**
 * No rehype-slug on purpose: case-study section anchors are a public contract
 * (spec §13, §14) and are set explicitly via <Section id="…"> so they cannot
 * drift when a heading is reworded.
 */
const withMDX = createMDX({});

export default withMDX(nextConfig);
