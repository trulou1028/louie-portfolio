# Plan 027: Make the docs and code comments say what the code does

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- README.md AGENTS.md app/globals.css app/layout.tsx components/ai/ai-louie-live.tsx mdx-components.tsx components/app-shell/contextual-rail.tsx`
> If any in-scope file changed since this plan was written, compare each
> "Current state" excerpt against the live text before editing it; where an
> excerpt no longer matches, skip that item and note it — do not guess.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (prose only; no code paths change)
- **Depends on**: none. If Plan 025 has landed, item 6 is already done — skip it.
- **Category**: docs
- **Planned at**: commit `50e98a4`, 2026-08-31
- **Recommended executor model**: **Haiku 4.5.** Every edit is a quoted before/after with a grep to confirm; no design judgment.

## Why this matters

This repo is worked on mostly by agents, and its three load-bearing documents contradict the code in ways that produce wrong work:

- `AGENTS.md` tells an agent the site has no dark mode and to never write `dark:` variants — but `<html class="dark">` is the shipped default and a full `.dark` palette exists. It also names two typefaces (Instrument Serif, Geist Sans) that are not loaded; the site uses Outfit and Roboto Slab.
- `components/ai/ai-louie-live.tsx` says the lazy-load wrapper "is gone" and the chat "skips the lazy load". `ai-louie-thread.tsx` still lazy-loads it behind an `IntersectionObserver`, deliberately, and is the production path. An agent trusting the first comment would delete a measured performance decision.
- The `globals.css` header says "No `.dark` palette is defined" 97 lines above the `.dark` palette.
- Smaller: `mdx-components.tsx` says `Metric` is imported in the MDX files (none does); `app/layout.tsx` implies `lib/analytics.ts` guards live events (nothing calls `track`); `contextual-rail.tsx` counts "three places" for a breakpoint that appears in nine.

## Current state (exact text to change)

1. `README.md:60-62`:
   ```
   4. **shadcn "nova" preset.** The CLI required a preset; nova pairs Lucide with
      Geist, matching spec §3 and §7. Its grayscale palette is fully overridden by
      the spec §6 tokens.
   ```
2. `README.md:66-68`:
   ```
   6. **No `.dark` palette.** The `dark` variant stays registered so upstream
      components carrying `dark:` classes compile, but no dark theme is defined —
      dark mode is deferred per spec §6 and §37.
   ```
3. `AGENTS.md:65-67`:
   ```
   **Fonts.** Instrument Serif (`font-serif`) for display statements and project
   titles only. Geist Sans (`font-sans`) for UI and body. Geist Mono
   (`font-mono`) for short system labels only — never paragraphs (spec §7).
   ```
   Truth: `app/layout.tsx:10-23` loads `Outfit` (`--font-outfit`), `Geist_Mono` (`--font-geist-mono`), `Roboto_Slab` (`--font-roboto-slab`); `app/globals.css` maps `--font-sans` → Outfit and both `--font-serif` and `--font-heading` → Roboto Slab (grep `--font-serif` there to cite the line).
4. `AGENTS.md:88`: `**Dark mode.** Deferred (spec §6, §37). Do not add `dark:` variants.`
   Truth: `app/layout.tsx:55` — `className={\`dark ${outfit.variable} …\`}`; `app/globals.css:104` — `.dark {` with a full palette; `app/globals.css:14-35` explains the split `--accent` (text-safe) vs `--accent-fill` rule.
5. `app/globals.css:5-7`:
   ```
   /* Kept so upstream shadcn components carrying `dark:` classes still compile.
      No `.dark` palette is defined — dark mode is deferred (spec §6, §37). */
   @custom-variant dark (&:is(.dark *));
   ```
6. `components/app-shell/contextual-rail.tsx:15-18` — "encoded in three places that MUST agree: this constant (the JS half), the `max-lg:hidden` guard on the rail pane, and the `lg:`/`max-lg:` variants in `ask-panel.tsx`." (Plan 025 rewrites this; skip if done.)
7. `components/ai/ai-louie-live.tsx:43-49`:
   ```
    * Plan 017: rebuilt on the AI SDK's `useChat` plus shadcn's chat components
    * (`MessageScroller`, `Message`, `Bubble`, `Marker`), replacing the previous
    * chat library — an 836KB client chunk that no longer earned its weight once
    * Plan 014 cut the generative UI and browser-executed tools it existed to
    * run. `useChat` needs no provider, so the panel renders directly; the
    * lazy-load apparatus that used to hide the runtime's size
    * (`ai-louie-thread.tsx`, `IntersectionObserver`) is gone with it.
   ```
   and `:297-302`:
   ```
   /**
    * The live assistant. Rendered directly — `useChat` needs no provider, and
    * without the previous chat library's ~840KB the chat is small enough to
    * skip the lazy load that used to hide it (spec §27 is satisfied by the
    * swap itself now, not by deferring the runtime).
    */
   ```
   Truth: `components/ai/ask-panel.tsx:70` renders `<AiLouieThread />`; `ai-louie-thread.tsx:35-37` `dynamic()`-imports this file and `:93-104` gates it on `IntersectionObserver`; its docblock `:19-26` records that Plan 017 measured and **kept** the deferral. `Marker` is no longer imported by this file (the thinking row uses `thinking-orbs`).
8. `mdx-components.tsx:8-11`: "Structural pieces — `Section`, `SystemDiagram`, `ArtifactFrame`, `Metric` — are imported directly inside each `.mdx` file". Truth: `grep -l "Metric" content/work/*.mdx` → nothing; `Metric`'s only importer is `app/design-system/page.tsx`. Also the component is `CaseStudySection`, not `Section`.
9. `app/layout.tsx:96-97`: `{/* Privacy-conscious, no cookies (spec §30). Event properties are guarded in lib/analytics.ts so free text can never be sent. */}`. Truth: `grep -rn "track(" app components` → no call sites; `lib/analytics.ts` is currently unused (decision pending in `plans/README.md`).

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| Unit      | `pnpm test`              | all pass            |

## Scope

**In scope** (prose and comments only): `README.md`, `AGENTS.md`, `app/globals.css` (lines 5-7 only), `components/app-shell/contextual-rail.tsx` (docstring only), `components/ai/ai-louie-live.tsx` (the two comment blocks only), `mdx-components.tsx` (docblock only), `app/layout.tsx` (the one JSX comment only).

**Out of scope**: any non-comment line in any file; the README "Deviations" numbering (append, never renumber); `plans/*` except the index row.

## Git workflow

- Branch: `plan-027`
- One commit, imperative sentence, no prefix (e.g. `Make the docs say what the code does`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: README deviations 4 and 6

Replace item 4's second sentence so it reads: "nova pairs Lucide with Geist; the Geist Sans half was later replaced by Outfit and the display face by Roboto Slab (see the RHEA preset note in `app/globals.css`)." Replace item 6 with: "**Both palettes ship; dark is the default.** `:root` carries the light palette and `.dark` the dark one, with `<html class="dark">` in `app/layout.tsx` making dark the default (the RHEA preset, `restyle/rhea-dark`). The `dark` variant is registered for upstream components. A theme toggle is a later one-liner. Supersedes the original 'dark mode is deferred' decision; spec §6's ordering (light first) was honoured, then dark was adopted as the primary look."

**Verify**: `grep -n "No \`.dark\` palette" README.md` → no output.

### Step 2: AGENTS.md fonts and dark mode

Replace the Fonts paragraph with: "**Fonts.** Roboto Slab (`font-serif`, also `--font-heading`) for display statements and project titles only. Outfit (`font-sans`) for UI and body. Geist Mono (`font-mono`) for short system labels only — never paragraphs (spec §7). All three load through `next/font/google` in `app/layout.tsx`."

Replace the Dark mode line with: "**Dark mode.** Dark is the default (`<html class="dark">`); both palettes live in `app/globals.css`. Do not add `dark:` variants in portfolio components — write against the tokens, which already resolve per theme. Respect the split accent: `text-accent` for text and markers, `bg-accent-fill` (+ `text-accent-on-fill`) for filled controls; see the note above `:root` in `globals.css`."

**Verify**: `grep -n "Instrument Serif\|Geist Sans" AGENTS.md` → no output; `grep -n "Dark is the default" AGENTS.md` → 1.

### Step 3: globals.css header

Replace lines 5-6 with: `/* Registers the \`dark\` variant for upstream shadcn components. Both palettes are defined below — light on :root, dark on .dark — and <html class="dark"> makes dark the default. */`

**Verify**: `grep -n "No \`.dark\` palette is defined" app/globals.css` → no output.

### Step 4: contextual-rail docstring (skip if Plan 025 landed)

Replace "three places" with the real inventory: this constant; `useMinWidth(1024)` in `app-shell.tsx`; `max-lg:hidden` in `app-shell.tsx` and `contextual-rail.tsx`; `lg:overflow-y-auto` in `contextual-rail.tsx`; `max-lg:*` in `ask-panel.tsx`; `lg:hidden` in `mobile-nav.tsx` and `table-of-contents.tsx`; the numeric pre-hydration guard in `app/globals.css` (cite its line after grepping `1023`).

**Verify**: `grep -n "three places" components/app-shell/contextual-rail.tsx` → no output.

### Step 5: ai-louie-live.tsx comments

Rewrite `:43-49` to: "Plan 017: rebuilt on the AI SDK's `useChat` plus shadcn's chat components (`MessageScroller`, `Message`, `Bubble`), replacing the previous chat library. The deferral is unchanged: `ai-louie-thread.tsx` still `dynamic()`-imports this file behind an `IntersectionObserver` — Plan 017 measured folding the chunk into the eager bundle and kept the lazy load. That file owns the bundle-size figures; do not duplicate them here."

Rewrite `:297-302` to: "The live assistant. `useChat` needs no provider, so this renders directly once `ai-louie-thread.tsx` has loaded the chunk (spec §27)."

**Verify**: `grep -n "is gone with it\|skip the lazy load" components/ai/ai-louie-live.tsx` → no output. `pnpm lint` → exit 0.

### Step 6: mdx-components.tsx and layout.tsx comments

`mdx-components.tsx:8-11` → "Structural pieces — `CaseStudySection`, `SystemDiagram`, `ArtifactFrame`, `PendingContent` — are imported directly inside each `.mdx` file so the content stays explicit about what it is rendering."

`app/layout.tsx:96-97` → `{/* Privacy-conscious, no cookies (spec §30). Page views only: no custom events are sent yet (lib/analytics.ts is unused pending a decision). */}`

**Verify**: `grep -n "Metric" mdx-components.tsx` → no output; `grep -n "unused pending" app/layout.tsx` → 1.

### Step 7: Gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test` → exit 0.

## Test plan

None — prose only. The greps in each step are the checks.

## Done criteria

- [ ] All seven step greps pass as stated
- [ ] `git diff --stat` touches only the seven in-scope files
- [ ] `git diff` shows no non-comment code line changed (reviewer: read the diff)
- [ ] `pnpm typecheck && pnpm lint && pnpm test` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any "Current state" excerpt is not found verbatim — skip that item, note it, continue with the rest.
- A step would require touching a non-comment line.

## Maintenance notes

- The bundle-size figures now live in one place (`ai-louie-thread.tsx`); update them there after any chat-bundle change.
- When Louie decides on `lib/analytics.ts` (wire or delete), revisit the `app/layout.tsx` comment.
