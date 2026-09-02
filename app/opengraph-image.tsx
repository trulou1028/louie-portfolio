import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";

/**
 * The site-wide share image (spec §28). Generated at build time from
 * `content/profile.ts` so the copy cannot drift from the site.
 *
 * Raw hex is used here and nowhere else in components: `ImageResponse`
 * renders outside the document, so `app/globals.css` tokens are not
 * available. Values mirror the `.dark` block — canvas, foreground,
 * foreground-muted, accent — and must be updated with it.
 */
export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0c0a09",
          color: "#fafaf9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#a8a29e" }}>
          {profile.positioning.eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05, maxWidth: 1000 }}>
          {profile.positioning.primary}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ff9900" }} />
          <span>{profile.name}</span>
          <span style={{ color: "#a8a29e" }}>· {profile.role}</span>
        </div>
      </div>
    ),
    size,
  );
}
