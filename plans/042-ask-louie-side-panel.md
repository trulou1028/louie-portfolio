# Plan 042: Ask Louie in the hero and a side panel

Status: shipped, 2026-09-29 (commit 7067fa7). Plan 043 revises the hero starters and the thinking state.

## Why

Ask Louie had one entry point: a header button that reads like any other
link. Visitors did not find it. The centered pop-up also covered the work
the visitor was reading.

## What changed

1. **Hero ask bar** (`components/ai/hero-ask.tsx`). A text box under the
   intro ("Ask about my work"), then three starter buttons: "Paste a job
   description" (amber, opens the comparison dialog), "Show me Offboard",
   and "How technical are you?". A line under them says answers come from
   the case studies and links to the work. It replaces the "See the work"
   and "Compare a job description" buttons.
2. **Side panel** (`components/ai/ask-louie-dialog.tsx`). On desktop
   (1024px and wider) the panel is non-modal, 420px, on the right under the
   header. The page stays readable and scrollable. Clicking the page does
   not close it; Close and Escape do. Below 1024px it is a modal
   full-screen sheet.
3. **Questions from outside the panel.** `useAskLouie().openAsk(text)` opens
   the panel and queues the question. The chat sends it once the runtime
   has loaded and is idle, and sends each question once.
4. **Project questions** (`components/ai/ask-questions.ts`). On a case study
   or the Neuron Shift page, the panel says "Reading: <project>" and offers
   three questions about that project. After an answer, the questions not
   yet asked stay under "More about <project>". Each question names its
   project and is covered by a retrieval test in
   `lib/ai/portfolio-search.test.ts`.
5. **Cited links.** On desktop, an answer's link to a section on the same
   page keeps the panel open, scrolls to the section, and highlights it
   through `DeepLinkHighlight`. On a phone, the sheet closes first.

## Follow-up, same day

6. **Ask card on case studies** (`components/ai/ask-about-project.tsx`).
   Under "On this page", a card titled "Ask about <project>" with two of
   the page's questions and an "Ask your own question" button. Below
   1024px, one "Ask about <project>" button sits under the inline contents.
7. **Case-study width.** `Canvas` no longer uses resizable full-bleed panes.
   Pages with a rail sit in the same `.portfolio-wide` frame as the header:
   content on the left, a sticky 17rem rail on the right. The content's left
   edge lines up with the name, the rail's right edge with Ask Louie. The
   Neuron Shift page now has the same rail. `persistent-panel-group.tsx`
   and the pre-hydration pane CSS were removed.
8. **Quieter hero.** The helper line under the starter buttons is gone, and
   the video caption is one short line.
9. **Local AI.** The worktree had no `.env.local`, so Ask Louie showed its
   unavailable message on localhost. A symlink to the main checkout's
   `.env.local` fixed it (ignored by git; no code change).

## Second follow-up, same day

10. **The panel pushes.** On desktop the open panel is docked full height
    on the right, and `html[data-ask-docked]` narrows the app frame (header
    and page) by `--ask-panel-width` (420px). Page layouts respond to the
    canvas width through container queries (`@4xl/canvas`, `@5xl/canvas`),
    so the page reflows instead of squeezing: the hero stacks below 64rem,
    and on case studies the right column folds into the inline "On this
    page" menu. The panel slides in while the frame narrows (240ms; instant
    under reduced motion).
11. **Thinking state.** Louie's turns are a row: avatar on the left, content
    beside it. "Thinking" (or "Searching my case studies" while the search
    tool runs) sits on the avatar's line, and the answer fades in in the
    same place, so nothing jumps.
12. **Header photo.** `profile.avatar` sits left of the name in the desktop
    and mobile headers.

## Third follow-up, same day

13. **Answer links match their text.** The chat prompt says link text must
    name the page it opens, and `resolveAnswerLink(href, label)` sends a
    link whose text names one project to that project's page (observed:
    "Offboard" linked to /resume).
14. **Warm canvas.** `--canvas` is #f9f7ef; `surface-muted` and borders lean
    the same warm way. Cards stay white.
15. **Job comparison in the panel.** The dialog is gone. "Paste a job
    description" opens the panel's "Compare a role" view (`JobCompare`,
    lazy-loaded). The wait shows the pasted text with a highlight reading
    down it and the sources lighting up in turn. The result is one
    sentence, then matches and gaps as one-line rows with small evidence
    links, three per group with "Show N more". The comparison prompt now
    asks for a summary of at most 30 words, 8-word requirement labels, and
    20-word explanations. Closing the panel unmounts the view and drops the
    pasted text. Opening it focuses the text box, which also stops the
    phone's modal focus guard from pulling focus away mid-paste.

## Tests

`e2e/ask-louie-panel.spec.ts` covers the ask bar, a starter button, the
job-description button, project questions, the cited-link highlight, and
the non-modal desktop panel, the case-study Ask card, the header alignment at 1280, 1440, and 1920px, the push layout, and the thinking row. Existing Ask Louie tests now scope their
starter-question and job-description selectors to the panel, because the
hero shows the same labels.
