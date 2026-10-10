# Plan 049: TransferSight case study, with its phone screens

Status: shipped to branch, 2026-10-10. Awaiting Louie's review.

Louie's request: add TransferSight (repo `~/code/transfersight`, not
`transfersight-v3`). Recruiters ask about mobile work; show it where the
product calls for it, without forcing it.

## What changed

1. **`/experiments/transfersight`.** Seven sections: the problem, the app
   flow, trust, growth, the landing page, the data underneath, and limits.
   Brief like the others. Ordered Motif, TransferSight, Neuron Shift, so on
   the homepage it takes a large tile.
2. **Mobile, from the product itself.** The app flow is six phone screens
   (390 wide) from Louie's prototype. `components/portfolio/phone-screens.tsx`
   shows them full height with one caption each, 2 across on a phone, 3 from
   `sm`. The landing page appears at desktop and phone width side by side.
   Tags include "Mobile", and two recruiter questions ("Do you have mobile
   design experience?", "Have you designed for phones?") now retrieve
   `transfersight-flow`.
3. **Assets.** The six screens were rendered from
   `docs/prototype-screens/*.dc.html` with the design canvas's own runtime
   (the repo copies lack its `support.js`), at 3x. The homepage image
   composes three of them on TransferSight's background. Landing screenshots
   are from www.transfersight.com. The wordmark is the landing page's own
   crosshair and Geist type, rendered on dark and light.
4. **Ask Louie.** Seven evidence entries, three page questions, and the
   usual name lists. The system prompt says the app is designed, not built.

## Content rules applied

- Every athlete, school, and number in the screens is demo data, and the
  page says so. The prototype's early navy look and its NIL estimate (since
  removed from the landing page) are disclosed.
- Not used: the landing page's "Why this exists" quote (a draft per
  ROADMAP.md), internal targets and kill criteria, pricing tests,
  competitors, and security details.

## Open for Louie

- `TODO(content)` in `content/experiments/transfersight.mdx`: his own story
  of why he started TransferSight and how his years at Utah shaped it.
- Status label: `prototype` ("Prototype") with the badge "In development".
