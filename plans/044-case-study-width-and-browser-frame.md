# Plan 044: Case-study screenshots, text width, and browser frame

Status: shipped, 2026-09-30.

## What changed

1. **New screenshots** (owner-supplied, 2026-09-30):
   - Offboard Decision 01: the risk gate (a test packet with its score set to show the gate; the caption says so) and a packet that stopped for missing job detail.
   - Offboard Decision 02: the tailored resume with tracked changes. The contact line is blurred.
   - Offboard entry-point section: the Layoff Plan. The sidebar email is blurred.
   - CK-12 Decision 02: the not-enough-data state.
   - /work galleries show them as previews.
2. **Text width.** Case-study paragraphs, lists, and figure captions fill the content column (760px) and use `text-body` (16px). The 68ch cap is removed from `mdx-components.tsx` and from the figure captions.
3. **Homepage lead.** New `--text-lead` token (20px). The line under the display statement uses it from `sm` up.
4. **Browser frame.** `ArtifactFrame` draws a Chrome-style bar above full-window screenshots (`frame="browser"`, the default). Crops use `frame="none"`. `url` shows only a real address: offboard.co, ck12.org, neuron-shift.vercel.app. Decision marks stay positioned on the image alone.
