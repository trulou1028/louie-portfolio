# Plan 021: Give every page its own canonical URL and a real share image

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- app/layout.tsx app/page.tsx app/work/page.tsx app/about/page.tsx app/ai-systems/page.tsx app/experiments app/writing/page.tsx e2e/seo.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none (020 recommended first so CI catches regressions)
- **Category**: bug (SEO) + direction (portfolio effectiveness)
- **Planned at**: commit `50e98a4`, 2026-08-31
- **Recommended executor model**: **Sonnet 5.** Metadata edits are mechanical; the share image needs a small amount of layout taste inside a fixed 1200×630 frame, which Sonnet handles well when the palette and copy are given (they are, below).

## Why this matters

Verified against production on 2026-08-31: `/`, `/about`, `/work`, `/ai-systems`, `/experiments`, and `/writing` all emit `<link rel="canonical" href="https://louiesakoda.com"/>` — the **home** URL, not their own — because the root layout sets `alternates: { canonical: "/" }` and Next does not merge that per page; only `/resume`, `/work/offboard`, and `/work/flexi` override it. Crawlers are told six distinct pages are duplicates of the homepage. Worse, until the domain cutover `louiesakoda.com` serves the *old Webflow site*, so every canonical and sitemap entry currently points crawlers at a different website (that half is an operator env-var setting, listed under "Operator steps").

Separately, `app/layout.tsx:44` declares `twitter: { card: "summary_large_image" }` with **no image anywhere** — no `openGraph.images`, no `opengraph-image` file. Every LinkedIn, Slack, or X share of this portfolio renders without a visual. For a site whose job is to get a recruiter to click, that is the highest-leverage missing asset that an executor (rather than Louie) can supply.

## Current state

- `app/layout.tsx:26-48`:
  ```ts
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://louiesakoda.com";

  export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: { default: `${profile.name} · ${profile.role}`, template: `%s · ${profile.name}` },
    description: profile.positioning.supporting,
    openGraph: {
      type: "website",
      siteName: profile.name,
      title: `${profile.name} · ${profile.role}`,
      description: profile.positioning.supporting,
      url: siteUrl,
      locale: "en_US",
      // TODO(asset): a real 1200×630 share image (spec §28).
    },
    twitter: { card: "summary_large_image", title: ..., description: ... },
    alternates: { canonical: "/" },
  };
  ```
- Pages with their own canonical (leave alone): `app/resume/page.tsx:17` (`canonical: "/resume"`), `app/work/offboard/page.tsx:26` and `app/work/flexi/page.tsx:26` (`canonical: project.href`).
- Pages with **no** `alternates` (inherit the root's `/`): `app/page.tsx` (no `metadata` export at all), `app/work/page.tsx:9-13`, `app/about/page.tsx:11-14`, `app/ai-systems/page.tsx:8-12`, `app/experiments/page.tsx:8-12`, `app/experiments/[slug]/page.tsx:18-31` (`generateMetadata`), `app/writing/page.tsx:8-11`.
- `e2e/seo.spec.ts:113-120` asserts only `og:title`, `og:description`, `og:type` — nothing about canonicals or images, which is why this shipped.
- `lib/site.ts` exports `SITE_URL` (same env var, trailing slash stripped) and `absoluteUrl(path)`; `app/sitemap.ts` and `components/system/structured-data.tsx` use it.
- Palette for the image (from `app/globals.css` `.dark` block, the shipped default theme): canvas `hsl(20 14% 4%)` ≈ `#0c0a09`; foreground `hsl(60 9% 98%)` ≈ `#fafaf9`; muted `hsl(27 6% 63%)` ≈ `#a8a29e`; accent `hsl(36 100% 50%)` = `#ff9900`. These are the **only** place raw hex is acceptable (AGENTS.md forbids it in components): `ImageResponse` cannot read CSS variables, and the file carries a comment saying so.
- Copy for the image comes from `content/profile.ts`: `profile.name` ("Louie Sakoda"), `profile.role` ("AI Product Designer & Builder"), `profile.positioning.primary` ("I plan, design & ship AI products.").
- Playwright sets `NEXT_PUBLIC_SITE_URL` to its own `baseURL` (`playwright.config.ts:47`), so in e2e a correct canonical equals `baseURL + path`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| Build     | `pnpm build`             | exit 0              |
| E2E (this suite only) | `pnpm test:e2e -- e2e/seo.spec.ts` | `0 failed` |
| E2E (all) | `pnpm test:e2e`          | `0 failed`          |

## Scope

**In scope**:
- `app/layout.tsx` (remove the root `alternates`; nothing else)
- `app/page.tsx` (add a `metadata` export)
- `app/work/page.tsx`, `app/about/page.tsx`, `app/ai-systems/page.tsx`, `app/experiments/page.tsx`, `app/experiments/[slug]/page.tsx`, `app/writing/page.tsx` (add `alternates.canonical`)
- `app/opengraph-image.tsx` (create)
- `e2e/seo.spec.ts` (add two tests)

**Out of scope**:
- `app/resume/page.tsx`, `app/work/offboard/page.tsx`, `app/work/flexi/page.tsx` — already correct.
- `lib/site.ts`, `app/sitemap.ts`, `app/robots.ts`, `components/system/structured-data.tsx` — correct as written; they follow `NEXT_PUBLIC_SITE_URL`, which is an operator setting.
- The default `https://louiesakoda.com` in `app/layout.tsx:26` and `lib/site.ts` — that is the intended post-cutover value. Do not change it.
- Per-page OG images for the case studies — a follow-up once real product imagery exists (`plans/CONTENT-TODOS.md`).

## Git workflow

- Branch: `plan-021`
- One commit per step, imperative sentence, no prefix.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove the inherited canonical and give each page its own

In `app/layout.tsx`, delete the line `alternates: { canonical: "/" },`.

In `app/page.tsx`, add at the top (after the imports):
```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
```

In each of `app/work/page.tsx`, `app/about/page.tsx`, `app/ai-systems/page.tsx`, `app/experiments/page.tsx`, `app/writing/page.tsx`, add to the existing `metadata` object:
```ts
alternates: { canonical: "/work" },   // or "/about", "/ai-systems", "/experiments", "/writing"
```

In `app/experiments/[slug]/page.tsx` `generateMetadata`, add to the returned object:
```ts
alternates: { canonical: `/experiments/${experiment.slug}` },
```

**Verify**: `grep -rn "canonical" app --include=page.tsx | wc -l` → 10 (one per public page: /, /work, /work/offboard, /work/flexi, /ai-systems, /experiments, /experiments/[slug], /writing, /about, /resume). `grep -n "alternates" app/layout.tsx` → no output. `pnpm typecheck` → exit 0.

### Step 2: Add a generated share image

Create `app/opengraph-image.tsx`:

```tsx
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
```

Next wires this file into `og:image` and `twitter:image` automatically; do **not** also add `openGraph.images` in `app/layout.tsx`. Remove the `// TODO(asset): a real 1200×630 share image (spec §28).` comment from `app/layout.tsx`.

**Verify**: `pnpm build` → exit 0 and the route list includes `/opengraph-image`. Then `pnpm start --port 3123 &` and `curl -sI http://localhost:3123/opengraph-image | grep -i "content-type"` → `image/png`; `curl -s http://localhost:3123/ | grep -o '<meta property="og:image"[^>]*>'` → one tag. Kill the server afterwards.

### Step 3: Lock both behaviours in e2e

Append to `e2e/seo.spec.ts`:

```ts
const PUBLIC_PATHS = [
  "/", "/work", "/work/offboard", "/work/flexi", "/ai-systems",
  "/experiments", "/writing", "/about", "/resume",
];

test("every page's canonical is its own URL", async ({ page, baseURL }) => {
  for (const path of PUBLIC_PATHS) {
    await page.goto(path);
    const href = await page.locator('link[rel="canonical"]').getAttribute("href");
    // Playwright sets NEXT_PUBLIC_SITE_URL to baseURL, so this is exact.
    expect(href, `${path} canonical`).toBe(`${baseURL}${path === "/" ? "" : path}`);
  }
});

test("a share image is declared and actually serves", async ({ page, request }) => {
  await page.goto("/");
  const image = page.locator('meta[property="og:image"]');
  await expect(image).toHaveCount(1);
  const src = await image.getAttribute("content");
  expect(src).toBeTruthy();
  const response = await request.get(src!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});
```

Note: the home canonical comparison — Next serialises `"/"` against `metadataBase` as the bare origin (no trailing slash) in this project's current output (`https://louiesakoda.com`, observed in production). If the assertion fails only on `/` because of a trailing slash, accept either form with a regex rather than changing app code.

**Verify**: `pnpm test:e2e -- e2e/seo.spec.ts` → `0 failed`, 2 new tests listed.

### Step 4: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → exit 0; `pnpm test:e2e` → `0 failed`.

## Operator steps (Louie, not the executor)

1. In Vercel → Project → Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` = `https://louie-portfolio-six.vercel.app` for **Production**, then redeploy. This makes canonicals, the sitemap, `og:url`, and the JSON-LD `Person`/`WebSite` URLs point at the site that is actually live.
2. At the domain cutover (README "Deployment" step 1), delete that variable so the code's default `https://louiesakoda.com` takes over, and redeploy.
3. After deploy, check one share preview (LinkedIn Post Inspector or opengraph.xyz) shows the image.

## Test plan

- Two new e2e tests in `e2e/seo.spec.ts` (Step 3): per-page canonical; share image declared and fetchable. Model after the existing `"OpenGraph metadata is present"` test in the same file.
- Verification: `pnpm test:e2e -- e2e/seo.spec.ts` → all pass including the 2 new.

## Done criteria

- [ ] `grep -n "alternates" app/layout.tsx` → no output
- [ ] `grep -rln "canonical" app --include=page.tsx | wc -l` → 10
- [ ] `app/opengraph-image.tsx` exists; `grep -n "TODO(asset): a real 1200" app/layout.tsx` → no output
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` exit 0
- [ ] `pnpm test:e2e` → `0 failed`, `e2e/seo.spec.ts` has 2 more tests than at `50e98a4` (was 6)
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `ImageResponse` fails at build with a font or JSX error you cannot resolve by removing a style property — report the exact error rather than switching to a static PNG (that decision is Louie's).
- The canonical e2e fails on more than the trailing-slash case for `/` — report which pages, do not loosen the assertion.
- Any page already has an `alternates` object that differs from what this plan lists — drift; stop.

## Maintenance notes

- A new public route needs its own `alternates.canonical`; the e2e test's `PUBLIC_PATHS` list should grow with `lib/routes.ts` `ROUTES`. Consider importing `ROUTES` there in a follow-up (the e2e tsconfig may need the `@/` alias).
- When real case-study screenshots land, per-route `opengraph-image.tsx` files under `app/work/offboard/` and `app/work/flexi/` can show the product instead of the headline.
- Reviewer: check the rendered PNG once by eye — `ImageResponse` silently drops unsupported CSS.
