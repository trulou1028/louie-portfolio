# Plan 043: Hero questions, nested radius, and the thinking state

Status: shipped, 2026-09-30.

## Why

Owner feedback on the shipped Plan 042:

1. The hero ask bar's corners (24px) did not match the send button inside
   it (12px). The field should be 16px, and nested corners should follow
   one rule.
2. The starter buttons under the bar read as static tags, not as things to
   click, and the questions were not the strongest ones for a hiring
   manager.
3. The thinking state (the `thinking-orbs` dotted orb and a label) looked
   generic.

## What changed

1. **Nested radius.** New tokens `--radius-control` (8px) and
   `--radius-field` (16px). The hero bar is a `rounded-field`; its two
   controls, inset 8px, are `rounded-control`. AGENTS.md records the rule:
   outer radius = inner radius + gap, checked by eye.
2. **Job description moves into the bar.** "Job description" (amber, with
   a file icon) sits inside the field next to Send. Below 640px it shows
   the icon only; its accessible name stays "Paste a job description".
3. **"Try asking" and new questions.** A plain text label, then three
   questions. Each ends in a small circle with the Send arrow, which fills
   on hover, so it reads as "this sends". The questions answer what a
   hiring manager asks about this role:
   - "How do you design AI people trust?" (AI judgment)
   - "Can you build what you design?" (founding / engineering)
   - "What have you shipped at scale?" (scale)
   The same three are the panel's empty-state questions away from a
   project page. `lib/ai/portfolio-search.test.ts` checks that each one
   retrieves evidence.
4. **Thinking state** (`components/ai/thinking-sources.tsx`).
   - A 2px arc turns around Louie's avatar.
   - The status line rises in each time the stream reports a new phase:
     "Reading your question", "Searching my case studies", "Writing from
     what I found".
   - Under it, five small cards (Offboard, Foresights, Flexi, Neuron Shift,
     Resume) deal through a stack. When the search returns, the cards for
     the routes it returned open into labeled chips; the rest leave.
   - Reduced motion: no ring turn, no dealing, plain swaps.
   - The job-description wait uses the same card stack in place of the orb.
5. **`thinking-orbs` removed** from dependencies.

## Checks

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- `pnpm test:e2e` (desktop and mobile projects)
