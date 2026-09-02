# Plan 024: Add response security headers, with a report-only CSP first

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- next.config.ts app/layout.tsx e2e/seo.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: MED — a CSP that is too strict breaks fonts, Vercel Analytics, or the deep-link script. That is why the CSP ships **report-only**; the four plain headers are safe.
- **Depends on**: 023 (so the image hole is closed at the renderer as well as by policy); 020 for CI
- **Category**: security
- **Planned at**: commit `50e98a4`, 2026-08-31
- **Recommended executor model**: **Opus 5.** Getting a CSP right for Next 16 + Turbopack + `next/font` + Vercel Analytics + one inline `<head>` script requires reasoning about what each of those actually emits, and reading the served HTML rather than guessing. The plain headers alone would be a Haiku task; the CSP is not.

## Why this matters

Verified on production 2026-08-31: the only security header is Vercel's default HSTS. There is no `X-Content-Type-Options`, no `Referrer-Policy`, no frame-ancestors protection, and no Content-Security-Policy. The site renders model-generated markdown in the browser; its safety currently rests on `react-markdown`'s escaping and the `a`/`img` overrides — one library default and two component entries, with nothing behind them. A CSP is the defence-in-depth layer, and `Referrer-Policy` stops outbound requests leaking the full page URL.

## Current state

- `next.config.ts` (14 lines) — sets `pageExtensions` and `turbopack.root`; no `headers()`; wrapped by `createMDX({})`.
- No `middleware.ts`, no `vercel.json`.
- `app/layout.tsx:76-90` — one inline `<script dangerouslySetInnerHTML>` in `<head>` (the deep-link hash capture; see README "Deep links" — it must stay inline). This is the one thing a strict `script-src` must hash or nonce.
- `app/layout.tsx:2` — fonts via `next/font/google` (self-hosted at build; served from `/_next/static/media/`). `app/layout.tsx:3` — `import { Analytics } from "@vercel/analytics/next"` (loads `https://va.vercel-scripts.com/v1/script.js` and posts to `https://vitals.vercel-insights.com` in production).
- Two more `dangerouslySetInnerHTML` sites, both JSON-LD: `components/system/structured-data.tsx:21` (`<script type="application/ld+json">` — not executed, but some browsers still check CSP for it; `'unsafe-inline'`-free policies generally allow it because it is a data block, verify) and `components/ui/chart.tsx:50` (`<style>` for chart colors; only on `/design-system`).
- `components/portfolio/architecture-canvas.tsx:16` imports `@xyflow/react/dist/style.css` — a bundled stylesheet, served from `/_next/static`.
- Tailwind v4 and Next emit inline `<style>` in dev; production CSS is external. React Flow sets inline `style=` attributes on nodes (attribute styles are **not** governed by `style-src` unless `'unsafe-hashes'` is in play — they are fine).
- `e2e/seo.spec.ts:11-31` — a `request`-fixture test on `/sitemap.xml`; model the header test on it.
- Production origin for header verification: `https://louie-portfolio-six.vercel.app` (public).

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| Build + serve | `pnpm build && pnpm start --port 3123` | serves            |
| Header check | `curl -sI http://localhost:3123/ \| grep -i "content-security\|x-content-type\|referrer-policy\|x-frame"` | 4 lines |
| E2E (this suite) | `npx playwright test e2e/seo.spec.ts` | `0 failed` |
| E2E (all) | `pnpm test:e2e`          | `0 failed`          |

## Scope

**In scope**:
- `next.config.ts` (add `headers()`)
- `e2e/seo.spec.ts` (add one test)
- `README.md` (one new deviations entry under a "Security headers (2026-…)" heading, following the existing numbered ledger style)

**Out of scope**:
- `app/layout.tsx` — do **not** move the inline script to a file; README "Deep links" explains why it must be inline. Hash it instead.
- `middleware.ts` — not needed; a nonce-per-request would require middleware and would also disable static prerendering for every page. Use a hash.
- Enforcing CSP (non-report-only) — a follow-up after a week of clean reports; see Maintenance notes.

## Git workflow

- Branch: `plan-024`
- One commit per step, imperative sentence, no prefix.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: The four plain headers

In `next.config.ts` add to `nextConfig`:

```ts
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ];
},
```

(`microphone=()` is correct today; Plan 009 voice mode would revisit it.)

**Verify**: `pnpm build && (pnpm start --port 3123 & sleep 3; curl -sI http://localhost:3123/ | grep -ci "x-content-type-options\|referrer-policy\|x-frame-options\|permissions-policy"; kill %1)` → `4`.

### Step 2: Compute the inline script's hash

Build, serve, and extract the exact inline script text from the served HTML — not from the source file, because JSX whitespace handling can change the bytes:

```bash
pnpm start --port 3123 &
curl -s http://localhost:3123/ > /tmp/home.html
# Print each inline <script> body's sha256 (base64), one per line:
python3 - <<'PY'
import re,hashlib,base64
html=open('/tmp/home.html').read()
for m in re.finditer(r'<script(?![^>]*\bsrc=)(?![^>]*type="application/ld\+json")[^>]*>(.*?)</script>', html, re.S):
    body=m.group(1)
    print(base64.b64encode(hashlib.sha256(body.encode()).digest()).decode(), '|', body[:60].replace('\n',' '))
PY
kill %1
```

Expect: exactly one non-JSON-LD inline script that is the deep-link capture (starts with something like `(function(){` or `window.__deepLinkHash`), plus possibly Next's own inline bootstrap scripts. Record every hash printed. If Next emits inline bootstrap scripts of its own (it does in some configurations), those must be hashed too or the CSP cannot be strict — see STOP conditions; report-only makes this safe to discover.

**Verify**: the Python block prints ≥ 1 line and one of them clearly corresponds to the deep-link script.

### Step 3: Report-only CSP

Add a second header to the same `headers` array, built as a string in `next.config.ts` for readability:

```ts
const csp = [
  "default-src 'self'",
  // Hashes for the inline <head> deep-link script (app/layout.tsx) and any
  // Next bootstrap scripts, recomputed from served HTML — see plans/024.
  `script-src 'self' https://va.vercel-scripts.com ${SCRIPT_HASHES.map((h) => `'sha256-${h}'`).join(" ")}`,
  "style-src 'self' 'unsafe-inline'",   // Next/Tailwind inject <style> in some paths; tighten later
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");
```

with `const SCRIPT_HASHES = [/* from Step 2 */];` above it, and the header `{ key: "Content-Security-Policy-Report-Only", value: csp }`. Do **not** add a `report-uri`/`report-to` endpoint (no infrastructure, spec §3); violations are visible in the browser console, which is where the reviewer checks them.

In development (`process.env.NODE_ENV !== "production"`) Next needs `'unsafe-eval'` for HMR; append it to `script-src` only in that case, or skip the CSP header entirely in dev — either is acceptable; say which in the file.

**Verify**: `pnpm build && pnpm start --port 3123 &`, then open `http://localhost:3123/`, `/work/offboard` (React Flow at ≥1024px), and `/design-system` in a browser and read the console: there must be **zero** `Content-Security-Policy-Report-Only` violation lines on `/` and `/work/offboard`. Also drive a deep link: open `/work/offboard#architecture` and confirm the section scrolls and highlights (the inline script still runs). Record any violation on `/design-system` (dev-only route; acceptable, note it).

### Step 4: Lock the headers in e2e

Append to `e2e/seo.spec.ts`:

```ts
test("security headers are present", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy-report-only"]).toContain("frame-ancestors 'none'");
});
```

**Verify**: `npx playwright test e2e/seo.spec.ts` → `0 failed`.

### Step 5: Record the decision

Add a numbered entry to README's deviations ledger (next number after the last one there) stating: headers added in `next.config.ts`; CSP is report-only pending a week of clean production console checks; the inline deep-link script is allowed by hash and the hash must be recomputed when that script changes (link the Step 2 command).

### Step 6: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → exit 0; `pnpm test:e2e` → `0 failed`.

## Test plan

- Step 4's header test; the CSP correctness itself is verified by browser console in Step 3 (record the result in the report — there is no automated violation collector without infrastructure).

## Done criteria

- [ ] `grep -n "async headers" next.config.ts` → 1
- [ ] `curl -sI` against a local `pnpm start` shows all five headers
- [ ] Zero CSP-report-only violations in the console on `/` and `/work/offboard`; deep link `#architecture` still highlights
- [ ] `pnpm test:e2e` → `0 failed`; `e2e/seo.spec.ts` has 1 more test
- [ ] README ledger entry added
- [ ] No files outside the in-scope list modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Step 2 shows Next emitting inline scripts whose content varies per build (hash changes between two consecutive builds) — report; the strict `script-src` may need `'strict-dynamic'` with a nonce via middleware, which is a design decision, not an executor call.
- The deep link stops highlighting after the CSP header is added even in report-only mode (it should not — report-only never blocks; if it does, something else changed).
- `pnpm test:e2e` shows failures outside `seo.spec.ts`.

## Maintenance notes

- Enforce after a clean week: rename `Content-Security-Policy-Report-Only` → `Content-Security-Policy`. That is a one-word change and a new plan row, not a silent edit.
- Any change to the inline script in `app/layout.tsx` invalidates `SCRIPT_HASHES`; the e2e header test will not catch that (report-only), so the Step 2 command is linked from the README entry.
- Plan 009 (voice) will need `microphone=(self)` and possibly a WebSocket `connect-src`.
