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
};

/**
 * No rehype-slug on purpose: case-study section anchors are a public contract
 * (spec §13, §14) and are set explicitly via <Section id="…"> so they cannot
 * drift when a heading is reworded.
 */
const withMDX = createMDX({});

export default withMDX(nextConfig);
