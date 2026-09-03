# Plan 024: Add response security headers, including an enforcing CSP

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
- **Risk**: MED — the CSP ships **enforcing** (owner decision below), so a wrong directive breaks something for real visitors rather than warning. Mitigated by measurement: the full suite was run under enforcing across both browser engines before the decision, and the policy is deliberately permissive. The four plain headers are safe.
- **Depends on**: 023 (so the image hole is closed at the renderer as well as by policy); 020 for CI
- **Category**: security
- **Planned at**: commit `50e98a4`, 2026-08-31. **Substantially revised 2026-09-02** at `d4306bf`. Two in-scope files drifted since the plan was written and both were reconciled: `app/layout.tsx` (Plan 021 removed two metadata lines, shifting the inline script to `:74-75`) and `e2e/seo.spec.ts` (Plan 021 added two tests; now 8). `next.config.ts` is unchanged. More importantly, **Steps 2 and 3 were rewritten** after the advisor measured that hash-based `script-src` is not achievable on this stack — see "Current state".
- **Recommended executor model**: **Opus 5.** Getting a CSP right for Next 16 + Turbopack + `next/font` + Vercel Analytics + one inline `<head>` script requires reasoning about what each of those actually emits, and reading the served HTML rather than guessing. The plain headers alone would be a Haiku task; the CSP is not.

## Why this matters

Verified on production 2026-08-31: the only security header is Vercel's default HSTS. There is no `X-Content-Type-Options`, no `Referrer-Policy`, no frame-ancestors protection, and no Content-Security-Policy. The site renders model-generated markdown in the browser; its safety currently rests on `react-markdown`'s escaping plus the `a` and `img` overrides Plan 023 added — a library default and two component entries, with nothing behind them.

**The single most valuable directive here is `img-src`.** Plan 023 stopped the renderer from emitting a model-authored `<img>`; `img-src 'self' data:` stops the *browser* from fetching one even if a future edit reopens that path. Together they close the markdown exfiltration channel at two layers. `frame-ancestors 'none'` prevents clickjacking, `Referrer-Policy` stops outbound requests leaking the full page URL, and `connect-src` bounds where any script can send data.

**What this plan does NOT achieve, and why — read before executing.** A strict `script-src` is not reachable on this stack, and the plan was revised on 2026-09-02 once that was measured rather than assumed. See "Current state" for the evidence.

### Owner decision, 2026-09-02: the CSP ships **enforcing**, not report-only

The plan originally shipped `Content-Security-Policy-Report-Only` and deferred enforcement. That was abandoned after the first execution attempt surfaced a finding that inverts the reasoning:

**WebKit ignores a report-only policy that carries no `report-to`.** Its own console message, observed in the mobile (WebKit) project: *"was delivered in report-only mode, but does not specify a 'report-to'; the policy will have no effect."* Not "will not block" — **no effect at all**: it neither blocks nor reports. So report-only would have left every Safari and iPhone visitor with zero protection, while the "observe for a week, then enforce" plan silently observed Chromium only. For a portfolio whose own test suite runs WebKit precisely because "a portfolio gets opened on Macs and iPhones", the cautious-looking option protected nobody there.

Enforcing was then measured before the decision, not after: the full e2e suite was re-run with `Content-Security-Policy` in place of the report-only header — **204 passed across both engines, with no functional failure**. The only failures were the header-name assertion in `seo.spec.ts` (expected) and a pre-existing local artifact (below). Chromium console showed zero violations on `/`, `/work/offboard` and `/about`. Switching to enforcing also **removes** the WebKit warning entirely.

Louie chose to ship enforcing on that evidence. The residual risk he accepted: `connect-src` cannot be fully exercised locally, because `@vercel/analytics` only runs on Vercel — if its reporting host is not covered, analytics could silently stop. `vitals.vercel-insights.com` is allowed for this reason, and production must be checked right after the first deploy. Reverting is a one-word change.

## Current state

- `next.config.ts` (14 lines) — sets `pageExtensions` and `turbopack.root`; no `headers()`; wrapped by `createMDX({})`.
- No `middleware.ts`, no `vercel.json`.
- `app/layout.tsx:74-75` — one inline `<script dangerouslySetInnerHTML>` in `<head>` (the deep-link hash capture; see README "Deep links" — it must stay inline). Line numbers shifted by −2 when Plan 021 removed two metadata lines.

### Measured 2026-09-02: why `script-src` cannot be strict here

The advisor built the app, served it, and inventoried every inline `<script>` in the served HTML — locally and against production. Findings, all reproducible:

| Inline script | Size | Hash stable? |
|---|---|---|
| The deep-link capture (`window.__deepLinkHash=…`) | 162 B | **Yes** — authored, identical everywhere |
| Next's `(self.__next_f=self.__next_f\|\|[]).push([0])` | 43 B | **Yes** |
| Next's flight-data payload (`self.__next_f.push([1,…`) | 18–24 KB | **No** |
| Two JSON-LD blocks (`Person`, `WebSite`) | 229 / 485 B | Yes, but they are data, not executed |

The flight payload's hash differs **per page** — measured on one build: `/` → `eJohgmkEdXs1Ro/3…` (22,370 B), `/about` → `Dz3PADAK6v2FNYGn…` (17,861 B), `/work` → `P5SUDsY8LWRABbg3…` (18,360 B) — **and per build** (production served 24,228 B for `/`). A `headers()` entry in `next.config.ts` emits one static header per `source` pattern, so it cannot carry a hash that changes with the page. **Hashing is therefore not viable, and Step 2 no longer asks you to compute hashes.**

The alternatives and why they are rejected: a per-request nonce needs `middleware.ts`, which the Scope section rules out because it would disable static prerendering on every page — a real performance cost to buy a directive this site gets little from, given it loads no third-party scripts at all. That leaves `script-src 'self' 'unsafe-inline'`, which is honest: it still restricts *external* script origins (the site loads none), while permitting the framework's own inline bootstrap. Every other directive in the policy is unaffected and does real work.

- Also measured: production loads **no external script hosts whatsoever** (all `/_next/static`, same-origin), fonts are self-hosted by `next/font` (no `fonts.googleapis.com`), and `@vercel/analytics` does not appear in the initial HTML — it injects at runtime and, on Vercel, serves from the same origin (`/_vercel/insights/*`). The `va.vercel-scripts.com` and `vitals.vercel-insights.com` entries in the policy below are therefore precautionary. Because the policy now ships enforcing, whether they are needed has to be confirmed on the deployed site rather than locally — see Maintenance notes.
- `app/layout.tsx:2` — fonts via `next/font/google`, **self-hosted at build** and served from `/_next/static/media/`, so `font-src 'self'` is sufficient and no Google Fonts origin is needed (confirmed against production HTML). `app/layout.tsx:3` — `import { Analytics } from "@vercel/analytics/next"`. Its script does **not** appear in the served HTML at all; it is injected client-side after hydration, and on Vercel it is served same-origin under `/_vercel/insights/`. The `va.vercel-scripts.com` / `vitals.vercel-insights.com` entries are kept as belt-and-braces for older package behaviour — report-only mode will show whether either is actually exercised.
- Two more `dangerouslySetInnerHTML` sites, both JSON-LD: `components/system/structured-data.tsx:21` (`<script type="application/ld+json">`) and `components/ui/chart.tsx:50` (`<style>` for chart colors; only on `/design-system`). Both are covered by the `'unsafe-inline'` in `script-src`/`style-src`, so neither needs special handling under this policy.
- `components/portfolio/architecture-canvas.tsx:16` imports `@xyflow/react/dist/style.css` — a bundled stylesheet, served from `/_next/static`.
- Tailwind v4 and Next emit inline `<style>` in dev; production CSS is external. React Flow sets inline `style=` attributes on nodes (attribute styles are **not** governed by `style-src` unless `'unsafe-hashes'` is in play — they are fine).
- `e2e/seo.spec.ts:11-31` — a `request`-fixture test on `/sitemap.xml`; model the header test on it. The file holds **8** tests as of `d4306bf` (Plan 021 added two); yours makes 9.
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
- `e2e/home.spec.ts` — **added to scope 2026-09-02**, one-line filter widening only. See Step 4b; the console-error test needs to tolerate a local-only artifact these headers expose. Touch nothing else in that file.
- `README.md` — one new deviations entry. The ledger currently ends at **36**, so yours is **37**, under a `**Security headers (2026-09-02)**` heading matching the existing style.

**Out of scope**:
- `app/layout.tsx` — do **not** move the inline script to a file; README "Deep links" explains why it must be inline. It is covered by `'unsafe-inline'`, not by a hash (see the measurement above).
- `middleware.ts` — deliberately not used. A per-request nonce is the only way to a strict `script-src` here, and it would disable static prerendering on every page. That trade is not worth it for a site that loads no third-party scripts; see the measurement above.
- A `report-to` / `report-uri` endpoint — would be new infrastructure (spec §3). Its absence is precisely why report-only was abandoned; enforcing needs no reporting endpoint to work.

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

### Step 2: Confirm the inline-script inventory (no hashing)

The advisor already measured this — see "Current state". You are re-confirming it on your own build, **not** discovering it, and you are **not** computing hashes. Build, serve, and print the inline-script sizes for two different pages:

Write a short Python script to a file (do **not** nest a heredoc inside another heredoc — it breaks the shell) that, for each of `/` and `/about`, fetches the page and prints the **byte length** of every inline `<script>` body that is not `application/ld+json`. Regex that works: `r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>'` with `re.S`, skipping any match whose opening tag contains `ld+json`.

Start the server capturing its PID explicitly — `pnpm start --port 3123 & SERVER_PID=$!`, `sleep 6`, then `kill $SERVER_PID` — rather than relying on `%1` job control, and make sure no server is left running when you finish.

**Verify**: both paths print three sizes — roughly `162`, `43`, and one large value in the tens of thousands that **differs between `/` and `/about`**. That differing value is Next's flight payload, and it is why Step 3 uses `'unsafe-inline'` instead of hashes. If the large value turns out to be *identical* across both pages, STOP and report — the situation would have changed and a hashed policy might be reachable after all.

### Step 3: Report-only CSP

Add a second header to the same `headers` array, built as a string in `next.config.ts` for readability:

```ts
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
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  // Next and Tailwind inject <style> during some render paths.
  "style-src 'self' 'unsafe-inline'",
  // The directive that matters most here. Plan 023 stopped the renderer
  // emitting a model-authored <img>; this stops the browser fetching one if
  // that path ever reopens. `data:` is kept for inline SVG/PNG.
  "img-src 'self' data:",
  "font-src 'self'",                 // next/font self-hosts; no Google Fonts
  "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");
```

Add it as `{ key: "Content-Security-Policy", value: csp }` — **enforcing, per the owner decision above**. Do **not** add a `report-uri`/`report-to` endpoint (no infrastructure, spec §3). Update the leading comment accordingly: it no longer "observes and reports without blocking", it enforces; say that WebKit ignores report-only policies without `report-to`, which is why this ships enforcing.

In development Next needs `'unsafe-eval'` for HMR. Either append it when `process.env.NODE_ENV !== "production"`, or omit the CSP header entirely in dev — pick one and say which in a comment.

**Verify**: `pnpm build`, serve, then open `/`, `/work/offboard` (React Flow renders at ≥1024px), and `/about` in a browser and read the console. There must be **zero** `Content-Security-Policy-Report-Only` violations on those three. Then open `/work/offboard#architecture` and confirm the section still scrolls and highlights — that proves the inline deep-link script ran. Record anything you see on `/design-system` (dev-only route, `noindex`, 404s in production; a violation there is acceptable — note it, do not chase it).

Note: the og-image route added by Plan 021 (`app/opengraph-image.tsx`) serves a same-origin PNG, so `img-src 'self'` already covers it. No extra directive is needed.

### Step 4: Lock the headers in e2e

Append to `e2e/seo.spec.ts`:

```ts
test("security headers are present", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("img-src 'self' data:");
  // Enforcing, not report-only: WebKit ignores report-only without report-to.
  expect(headers["content-security-policy-report-only"]).toBeUndefined();
});
```

**Verify**: `npx playwright test e2e/seo.spec.ts` → `0 failed`.

### Step 4b: Let the console-error test tolerate the local analytics artifact

`e2e/home.spec.ts:224` ("the homepage renders without console errors") fails once these headers ship, on **both** engines. The cause is real but local-only: `@vercel/analytics` requests `/_vercel/insights/script.js`, a path that only exists on Vercel. Off-Vercel it 404s as `text/plain`, and `X-Content-Type-Options: nosniff` then correctly refuses to execute it — so the header is working as intended and the test is simply too strict for a non-Vercel build. Previously that 404 surfaced as `Failed to load resource`, which the filter already ignored; `nosniff` changes the wording, not the situation.

At `e2e/home.spec.ts:245-247` the filter reads:
```ts
const unexpected = errors.filter(
  (e) => !/Failed to load resource|api\/chat|503|ai_unavailable/i.test(e),
);
```
Add `_vercel/insights` as an alternative, and put a comment above it explaining exactly the above — that the path exists only on Vercel, so this is an artifact of running the suite anywhere else, and that on Vercel the script serves real JS with a correct MIME type. **Change nothing else in that file.**

**Verify**: `npx playwright test e2e/home.spec.ts` → `0 failed` on both projects.

### Step 5: Record the decision

Add entry **37** to README's deviations ledger, under a `**Security headers (2026-09-02)**` heading. Record all four of these, because each was measured and each will otherwise be re-litigated:

1. The four plain headers plus an **enforcing** CSP now ship from `next.config.ts`.
2. `script-src` uses `'unsafe-inline'` rather than hashes **because Next inlines a flight-data script whose hash differs per page and per build** (measured: 22,387 B on `/` vs 17,870 B on `/about`), which one static header cannot enumerate; a nonce would need middleware and cost static prerendering site-wide.
3. It ships **enforcing rather than report-only** because **WebKit ignores a report-only policy with no `report-to`** — its console states "the policy will have no effect" — so report-only would have protected no Safari or iPhone visitor at all. Enforcing was verified first: full e2e green across both engines.
4. The real protection therefore comes from `img-src` (which, with Plan 023's renderer fix, closes the markdown exfiltration channel at two layers), `frame-ancestors`, `object-src`, `connect-src`, `base-uri` and `form-action` — not from `script-src`.

Also note the one accepted risk: `connect-src` cannot be exercised locally because `@vercel/analytics` only runs on Vercel; production must be checked after the first deploy.

### Step 6: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → exit 0; `pnpm test:e2e` → `0 failed`.

## Test plan

- Step 4's header test; the CSP correctness itself is verified by browser console in Step 3 (record the result in the report — there is no automated violation collector without infrastructure).

## Done criteria

- [ ] `grep -n "async headers" next.config.ts` → 1
- [ ] `curl -sI` against a local `pnpm start` shows all five headers
- [ ] Zero CSP violations in the console on `/`, `/work/offboard` and `/about`; deep link `#architecture` still highlights
- [ ] `curl -sI` shows `content-security-policy` and **no** `content-security-policy-report-only`
- [ ] `pnpm test:e2e` → `0 failed`; `e2e/seo.spec.ts` has 1 more test; `e2e/home.spec.ts` has the same number of tests as before (filter widened, no test added)
- [ ] README ledger entry added
- [ ] No files outside the in-scope list modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Step 2's large inline script is **identical** across `/` and `/about` — that contradicts the advisor's measurement and would mean a hashed policy is reachable; report rather than proceeding with `'unsafe-inline'`.
- A CSP violation appears on `/`, `/work/offboard` or `/about` that you cannot resolve by adding a directive already discussed here (e.g. an unexpected third-party host) — report the exact violation text; do not add `'unsafe-eval'` to production or widen `default-src` to silence it. **Enforcing mode blocks**, so a violation here is a real breakage, not a warning.
- Widening `e2e/home.spec.ts`'s filter does not make it pass, or you find yourself needing to change anything in that file beyond the one filter line — report.
- The deep link `/work/offboard#architecture` stops highlighting — report-only mode never blocks, so this should be impossible; if it happens, something other than the CSP changed.
- `pnpm test:e2e` shows failures outside `seo.spec.ts`.

## Maintenance notes

- **The policy is enforcing from day one**, so a wrong directive blocks something for real visitors rather than merely warning. The revert is one word (`Content-Security-Policy` → `…-Report-Only`) plus a redeploy, but note that reverting to report-only restores protection for nobody on WebKit — prefer fixing the directive.
- **Check production after the first deploy**: open the live site in Chrome and in Safari, read the console for CSP violations, and confirm Vercel Analytics still reports (the one thing local tests cannot exercise). If analytics breaks, widen `connect-src` rather than dropping it.
- There are no script hashes to maintain, so editing the inline script in `app/layout.tsx` cannot invalidate the policy. If Next ever stops inlining its flight payload (or ships a stable-hash mode), revisit `script-src` — that is the one change that would make a strict policy reachable.
- Plan 009 (voice) will need `microphone=(self)` and possibly a WebSocket `connect-src`.
