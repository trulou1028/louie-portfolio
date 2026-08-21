import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Next infers it from the nearest
  // lockfile and walks up to the home directory, which holds an unrelated
  // package.json.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
