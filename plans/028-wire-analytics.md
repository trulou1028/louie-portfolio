# Plan 028: Wire the nine analytics events that map to real interactions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- lib/analytics.ts lib/analytics.test.ts components/ai components/app-shell app/layout.tsx app/resume/page.tsx app/work`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW — additive; no existing behaviour changes. The privacy guard already exists and is tested.
- **Depends on**: none (020 recommended first so CI runs the new tests)
- **Category**: direction
- **Planned at**: commit `50e98a4`, 2026-08-31
- **Recommended executor model**: **Sonnet 5.** The call sites are mechanical, but two need judgment about the client/server boundary (Steps 2 and 5) and the plan gives the pattern for both.

## Why this matters

**The decision (Louie deferred it, 2026-08-31): wire it, don't delete it.** Reasoning, so a future reader does not relitigate:

This portfolio exists to get Louie hired. Right now there is no way to answer the questions that would change what he builds next — does anyone actually use AI Louie, or do recruiters read the case studies and leave? Does anyone paste a job description? Does anyone click through to contact him? Those answers direct the content work in `plans/CONTENT-TODOS.md`, which is the site's real bottleneck.

The cost is unusually low because the hard part is already done and tested: `lib/analytics.ts` exists with a closed event list and a `sanitizeProperties` guard that drops anything resembling free text, `lib/analytics.test.ts` covers it, and `<Analytics />` from `@vercel/analytics` is already mounted in `app/layout.tsx:98`. What is missing is only the call sites. Deleting the module would throw away the guard — the part that is easy to get wrong — and leave the site with page views only.

Four of spec §30's thirteen events describe features that do not exist: `ai_evidence_opened` and `ai_navigation_triggered` (the browser-executed tools were removed by Plan 014) and `voice_started` / `voice_question_completed` (Plan 009, post-launch). This plan wires nine and marks those four unwired in the code rather than pretending they fire.

Privacy stance is unchanged and non-negotiable: no conversation text, no job-description text, ever. Every property in this plan is an enum-like label or a number. Vercel Analytics remains cookieless.

## Current state

- `lib/analytics.ts:19-33` — `ANALYTICS_EVENTS` is spec §30's list verbatim (13 entries). `:47-65` `sanitizeProperties` drops any string over 64 chars or containing a newline / double space. `:67-72` `track(event, properties)` calls `vercelTrack`.
- `grep -rn "track(" app components` → **no call sites**. The only importer of `lib/analytics.ts` is `lib/analytics.test.ts`.
- `app/layout.tsx:96-98` — `<Analytics />` is mounted, preceded by a comment claiming the guard is in use (Plan 027 corrects that comment; if 027 lands first, this plan corrects it again to say events are wired).
- `components/ai/ai-louie-thread.tsx:93-105` — `IntersectionObserver` calls `setApproached(true)` exactly once, then disconnects. This is the natural `ai_louie_started` moment.
- `components/ai/ai-louie-live.tsx:318-322`:
  ```ts
  function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
  }
  ```
  and `Suggestions` (`:239-295`) calls `onSelect(prompt)` from the three question chips.
- `components/ai/job-description-dialog.tsx:47-79` — `compare()` sets `phase` to `loading`, then `done` (with `body.result`) or `error`. The dialog's open state is Base UI's `Dialog`; find its `onOpenChange` (or add one) for `job_description_started`.
- `app/resume/page.tsx:54-65` — the PDF download `<Action render={<a href={resume.pdfPath} download />}>`; the page is a **server** component.
- `components/portfolio/work-card.tsx` — a **server** component; the whole card is one `<Link>`.
- `components/app-shell/left-rail.tsx:91-110` and `components/app-shell/site-footer.tsx:22-39` — contact links (`mailto:`, LinkedIn, Calendly); both **server** components.
- `components/app-shell/app-shell.tsx:1` — already `"use client"`.
- Convention: portfolio semantics live in wrappers under `components/system|portfolio|app-shell|ai` (AGENTS.md); `components/ui/*` stays upstream.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| Unit      | `pnpm test`              | all pass            |
| Build     | `pnpm build`             | exit 0              |
| E2E       | `pnpm test:e2e`          | `0 failed`          |

## Scope

**In scope**:
- `lib/analytics.ts` (mark the four unwired events; no behaviour change)
- `components/system/track-view.tsx` (create)
- `components/system/track-contact-clicks.tsx` (create)
- `components/ai/ai-louie-thread.tsx`, `components/ai/ai-louie-live.tsx`, `components/ai/job-description-dialog.tsx` (add `track` calls)
- `app/work/offboard/page.tsx`, `app/work/flexi/page.tsx`, `app/resume/page.tsx` (mount `TrackView`)
- `app/layout.tsx` (mount `TrackContactClicks`; fix the comment)
- `e2e/analytics.spec.ts` (create)

**Out of scope**:
- Any change to `sanitizeProperties` or the guard's thresholds.
- Sending any property derived from visitor-typed text — not the question, not a length of the question, not the job description, not a hash of either.
- `portfolio_case_section_viewed` — deliberately deferred; see "Deferred" below.
- Wiring the four dead events, or building voice.
- `components/ui/*`.

## Git workflow

- Branch: `plan-028`
- One commit per step, imperative sentence, no prefix.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Mark the unwired events

In `lib/analytics.ts`, keep `ANALYTICS_EVENTS` exactly as it is (spec §30 verbatim — check `lib/analytics.test.ts` first; if a test asserts the list's contents or length, it must keep passing). Add a comment block above it:

```ts
/**
 * Spec §30's event list, verbatim.
 *
 * Nine of these fire (Plan 028). Four do not, and the list keeps them so it
 * still matches the spec:
 * - `ai_evidence_opened`, `ai_navigation_triggered` — the browser-executed
 *   tools they described were removed by Plan 014.
 * - `voice_started`, `voice_question_completed` — Plan 009, post-launch.
 */
```

**Verify**: `pnpm test` → `lib/analytics.test.ts` still passes.

### Step 2: A view tracker for server-rendered pages

Create `components/system/track-view.tsx`:

```tsx
"use client";

import * as React from "react";

import { track, type AnalyticsEvent, type AnalyticsProperties } from "@/lib/analytics";

/**
 * Fires one analytics event when a page is reached, from a server component.
 *
 * Server pages cannot call `track` (it needs the browser), and making a whole
 * page a client component to report an arrival would be a large cost for a
 * small signal. This mounts as a leaf instead, renders nothing, and fires
 * once — which also means it counts arrivals from every path: a nav click, a
 * link inside an AI answer, a pasted deep link, or a search result.
 *
 * Properties must stay enum-like; `sanitizeProperties` drops anything that
 * looks like prose (spec §30).
 */
function TrackView({
  event,
  properties,
}: {
  event: AnalyticsEvent;
  properties?: AnalyticsProperties;
}) {
  // A ref, not state: this must fire exactly once per mount and must never
  // cause a re-render. React 19 StrictMode double-invokes effects in dev, so
  // the guard is what keeps development from double-counting.
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, properties);
    // Mount-only by design; a prop change on a mounted tracker is not a new view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export { TrackView };
```

Mount it in the three server pages:
- `app/work/offboard/page.tsx`, inside the `<Canvas>` beside `<DeepLinkHighlight />`: `<TrackView event="portfolio_project_opened" properties={{ project: "offboard" }} />`
- `app/work/flexi/page.tsx`: the same with `project: "flexi"`
- `app/resume/page.tsx`, inside `<Canvas>`: `<TrackView event="resume_opened" properties={{ source: "page" }} />`

**Verify**: `pnpm typecheck && pnpm lint` → exit 0. `grep -rn "TrackView" app | wc -l` → 6 (three imports, three usages).

### Step 3: The AI surface

- `components/ai/ai-louie-thread.tsx`: inside the `IntersectionObserver` callback, immediately after `setApproached(true)`, add `track("ai_louie_started", { trigger: "approach" })`; in the no-`IntersectionObserver` fallback branch, use `{ trigger: "fallback" }`. Import `track` from `@/lib/analytics`.
- `components/ai/ai-louie-live.tsx`: in `sendText`, after the guard and before/after `sendMessage`, add `track("ai_question_submitted", { turn: messages.length })`. **Send no text and no length of the text** — `turn` is a count of prior messages, which is not visitor content.
- `components/ai/ai-louie-live.tsx`: in `Suggestions`, change the three question chips' `onClick` to fire `track("ai_prompt_chip_clicked", { chip: SUGGESTION_SLUGS[prompt] })` before `onSelect(prompt)`. Add a `const SUGGESTION_SLUGS: Record<string, string>` mapping each of the three prompts to a short kebab slug (e.g. `"Show me Offboard"` → `"show-offboard"`). Do **not** send the prompt text itself — it is short and authored by us, but the rule is that no message-shaped string goes to analytics, and a slug keeps the property stable if the copy is reworded.

**Verify**: `grep -c "track(" components/ai/ai-louie-thread.tsx components/ai/ai-louie-live.tsx` → 2 and 2. `pnpm typecheck && pnpm lint` → exit 0.

### Step 4: The job-description evaluator

In `components/ai/job-description-dialog.tsx`:
- `job_description_started` when the dialog opens. Find how the dialog's open state is controlled (Base UI `Dialog` with a `trigger` prop); if there is an `onOpenChange`, fire on the `true` transition; if the dialog is uncontrolled, add `onOpenChange` for this purpose only and keep the existing behaviour identical. Property: `{ source: "chip" }`.
- `job_description_compared` in `compare()` on the success path only (right after `setPhase({ status: "done", result: body.result })`). Properties: `{ matches: body.result.strongMatches.length, gaps: body.result.gaps.length }` — read the real field names off `VerifiedJobFit` in `lib/ai/job-fit.ts` and use those. **Never** send the description, its length, or any string from it.

**Verify**: `grep -c "track(" components/ai/job-description-dialog.tsx` → 2. `pnpm typecheck && pnpm lint` → exit 0.

### Step 5: Contact clicks, without turning the rails into client components

The contact links live in `left-rail.tsx` and `site-footer.tsx`, both server components, in two places. Rather than convert either, add one delegated listener.

Create `components/system/track-contact-clicks.tsx`:

```tsx
"use client";

import * as React from "react";

import { track } from "@/lib/analytics";

/**
 * One document-level listener for contact clicks, so the left rail and the
 * footer can stay server components.
 *
 * The alternative was a client wrapper around every contact link in two
 * files; this is one file and no change to how those links render. It reads
 * only the href's shape — never its value — so nothing identifying is sent.
 */
function TrackContactClicks() {
  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const method = href.startsWith("mailto:")
        ? "email"
        : href.includes("linkedin.com")
          ? "linkedin"
          : href.includes("calendly.com")
            ? "calendly"
            : null;

      if (method) track("contact_clicked", { method });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

export { TrackContactClicks };
```

Mount it once in `app/layout.tsx`, next to `<Analytics />`. Update the comment there to: `{/* Privacy-conscious, no cookies (spec §30). Custom events are a closed list with guarded properties — see lib/analytics.ts. */}`

Also add the resume PDF download to this listener? **No** — keep it explicit instead: in `app/resume/page.tsx` the download link is already inside a server page, and `resume_opened` already fires on arrival. A separate download event is not in spec §30's list; do not invent one.

**Verify**: `grep -n "TrackContactClicks" app/layout.tsx` → 2 (import + usage). `pnpm typecheck && pnpm lint && pnpm build` → exit 0.

### Step 6: Prove the events fire, and prove no text leaks

Create `e2e/analytics.spec.ts`. Vercel Analytics does not send events in a local production build (it needs the platform), so **do not** assert on network requests to Vercel. Instead, stub the transport: before each test, `page.addInitScript(() => { (window as any).__events = []; })` and intercept `lib/analytics`'s effect by asserting on what `sanitizeProperties` guarantees rather than what the network sends.

Concretely, make these two assertions:

1. **A unit-level guarantee** (add to `lib/analytics.test.ts`, not e2e): for every property object this plan introduces, `sanitizeProperties` returns it unchanged — i.e. `{ project: "offboard" }`, `{ trigger: "approach" }`, `{ turn: 3 }`, `{ chip: "show-offboard" }`, `{ source: "chip" }`, `{ matches: 2, gaps: 1 }`, `{ method: "email" }` all survive. This proves the properties are the right shape.
2. **An e2e guard against text leaking** (`e2e/analytics.spec.ts`): stub `window.va` (the Vercel Analytics queue function) via `addInitScript` before navigation, recording every call into `window.__vaCalls`. Then: open the site, click a suggestion chip, type a distinctive string like `"ZZQQ-secret-question"` into the composer and submit (with `/api/chat` mocked as the existing suite does), then read `window.__vaCalls` and assert (a) it is non-empty, and (b) `JSON.stringify(window.__vaCalls)` does **not** contain `"ZZQQ"`.

Check how `@vercel/analytics`'s `track` dispatches in the installed version (`node_modules/@vercel/analytics/dist/index.mjs` — look for `window.va`) and stub whatever it actually calls. If it queues to `window.vaq` instead, stub that.

**Verify**: `pnpm test` → new `sanitizeProperties` cases pass. `npx playwright test e2e/analytics.spec.ts` → `0 failed`, and the leak assertion fails if you temporarily change Step 3 to send `{ text: trimmed }` (do that once to prove the test is not vacuous, then revert).

### Step 7: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → exit 0; `pnpm test:e2e` → `0 failed`.

## Deferred, deliberately

`portfolio_case_section_viewed` needs a per-section `IntersectionObserver` across nine or ten sections on each case study. It is the most interesting event on the list — it would say which parts of an argument recruiters actually read — but it is also the noisiest (a fast scroll fires every section) and the only one requiring new observer code on the content pages. Wire it as its own plan once the other nine have produced a week of data, with a dwell threshold rather than a bare intersection.

## Test plan

- `lib/analytics.test.ts`: seven new `sanitizeProperties` cases (Step 6.1), modelled on the existing cases in that file.
- `e2e/analytics.spec.ts`: one test that events fire, one that no visitor text reaches the analytics queue (Step 6.2), proved non-vacuous.

## Done criteria

- [ ] `grep -rn "track(" app components | grep -v "\.test\." | wc -l` → 9
- [ ] `components/system/track-view.tsx` and `components/system/track-contact-clicks.tsx` exist
- [ ] `pnpm test` passes, including the new `sanitizeProperties` cases
- [ ] `pnpm test:e2e` → `0 failed`, `e2e/analytics.spec.ts` present
- [ ] The leak test was shown to fail against a deliberately bad `track` call, then restored
- [ ] No visitor-authored string is passed to `track` anywhere (`git diff` reviewed for this specifically)
- [ ] `pnpm typecheck && pnpm lint && pnpm build` exit 0
- [ ] No files outside the in-scope list modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- `lib/analytics.test.ts` asserts a property of `ANALYTICS_EVENTS` that Step 1's comment change would break — report; do not edit the test.
- The Base UI `Dialog` in `job-description-dialog.tsx` cannot report its open transition without changing existing behaviour — report; ship the other eight events.
- `@vercel/analytics` dispatches through something the e2e cannot stub — report what you found; keep the unit-level assertion (6.1) and drop only the e2e half.
- Any step would require sending a string that originated from the visitor.

## Maintenance notes

- The rule that keeps this safe: properties are enum-like labels and counts, never anything a visitor typed. `sanitizeProperties` is a backstop, not permission — a 60-character question would pass it.
- When Plan 009 lands voice, wire `voice_started` / `voice_question_completed` and update Step 1's comment.
- If the browser-executed tools ever return (spec §18 Tools 2/3), `ai_evidence_opened` and `ai_navigation_triggered` become wireable.
- Vercel Analytics custom events need the Pro plan on some accounts; if the events do not appear in the dashboard within a day of deploying, check the plan level before assuming the code is wrong.
