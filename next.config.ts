import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Report-only to begin with: this observes and reports, it never blocks.
// See plans/024 for the measurement behind `script-src`.
const csp = [
  "default-src 'self'",
  // `unsafe-inline`, not hashes, and deliberately so: Next inlines a
  // flight-data script whose content — and therefore whose hash — differs
  // on every page and every build, which one static header cannot
  // enumerate. A per-request nonce would need middleware and would disable
  // static prerendering site-wide. This still bars *external* script
  // origins, and this site loads none: every script in the served HTML is
  // same-origin.
  //
  // Dev appends 'unsafe-eval': Turbopack's HMR runtime needs it. The header
  // still ships in dev so violations surface while developing; production
  // never carries 'unsafe-eval'.
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  // Next and Tailwind inject <style> during some render paths.
  "style-src 'self' 'unsafe-inline'",
  // The directive that matters most here. Plan 023 stopped the renderer
  // emitting a model-authored <img>; this stops the browser fetching one if
  // that path ever reopens. `data:` is kept for inline SVG/PNG.
  "img-src 'self' data:",
  "font-src 'self'", // next/font self-hosts; no Google Fonts
  "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

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
          { key: "Content-Security-Policy-Report-Only", value: csp },
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
