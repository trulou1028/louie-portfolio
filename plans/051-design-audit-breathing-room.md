# Plan 051: Design audit — breathing room, type, and quieter case study cards

Status: audit only, 2026-10-15. Not implemented. Measured on
louiesakoda.com at `origin/main` `b136162`, at 1440×900 and 390×844.

Louie's brief: keep the current design and clean it up. Strong typography,
clear and minimal communication. Today the layout is compact, with little
breathing room, and it is a lot to take in. The case study cards carry too
much information, and Louie does not like their background colors. Start
with the cards.

## Measurements

| What | Today |
|---|---|
| Text styles on the homepage (size / weight pairs) | 12 |
| Weights used at 14px | 3 (400, 500, 600) |
| Weights used at 16px | 3 (400, 500, 600) |
| Display sizes | 2 that look the same: hero 57px / 820, closing 56px / 780 |
| Space between homepage sections | 56px phone, 64px desktop (`gap-14 sm:gap-16`, `app/page.tsx:50`) |
| Space inside a case study card | 32px padding |
| Space between cards | 16px (`gap-4`) |
| Elements in a case study card | 6: logo (+ product chip on CK-12), arrow button, title, summary, role, screenshot |
| Elements in an independent project card | 7: logo, status chip, arrow button, title, status line, demo link, screenshot |
| Case study card height | 384–482px desktop, 461–521px phone |
| Saturated color fields on the homepage | 6 (charcoal, orange, green, and three near-black plates) |

## Findings, in priority order

**F1. The case study cards say everything twice.** Each card has a title
and a summary that make the same point. "Turning learning predictions into
teacher decisions" is followed by "Separate prediction from diagnosis. Make
uncertainty visible. Help teachers decide where to look next." The role
line and the logo chip add two more things to read. A recruiter scanning
for 10 seconds reads the title and looks at the screenshot; the rest is
noise at that moment. It belongs on the case study page.

**F2. The plate colors compete with the work.** Six full color fields sit
on one page. The orange and green plates are the loudest things on the
page, louder than the screenshots they frame. The charcoal plates for
Offboard and the independent projects make those cards read heavier than
the CK-12 ones, so the visual weight follows plate color, not importance.
The CK-12 logo needs a white chip to stay legible on its own plate, which
is a sign the plate is fighting the content.

**F3. Spacing is the same everywhere, so nothing groups.** The gap between
sections (64px) is only twice the padding inside a card (32px), and the
gap between cards (16px) is half of that. With 6 sections stacked at the
same rhythm, the page reads as one long block. Breathing room comes from
contrast in spacing: tight inside a group, wide between groups.

**F4. Too many type styles for a site about clarity.** 12 size and weight
pairs, with three weights at both 14px and 16px. Differences of 100 in
weight at small sizes are hard to see and add texture, not hierarchy. The
hero and the closing headline are 1px apart in size and 40 apart in weight,
which reads as an accident.

**F5. The hero asks for eight decisions.** Headline, lead, ask bar, Job
description chip, "Try asking" label, two question chips, "See selected
work", plus the Offboard image and caption. The ask bar alone has four
parts.

**F6. The header carries a second headline.** Avatar, name, title, four
nav links, Contact, Ask Louie: 9 items. The title repeats the hero.

**F7. The experience band is dense.** Four columns, each with three lines
of 14px text, in a tinted box. It reads as a résumé pasted into the page.

**F8. `/work` is denser still.** It uses `WorkPlate`, which adds a facts
row (role, years, team) to the same card. Same fix as F1 and F2.

## Recommendations

### R1. One card anatomy: image, title, one line

```
┌──────────────────────────────────────┐
│                                      │
│        screenshot on a quiet         │   neutral frame, no plate color
│        frame, generous inset         │
│                                      │
└──────────────────────────────────────┘
                                          20px
Turning learning predictions into          title, H3 (24px / 600)
teacher decisions
                                          8px
CK-12 Foresights · Lead Product Designer   one meta line, small (14px / 400), muted
```

- **Keep:** screenshot, title, one meta line (product · role).
- **Remove from the card:** summary, separate role line, arrow button, logo
  and logo chip. The whole card stays one link; hover lifts the screenshot
  and darkens the title.
- **Independent projects:** same anatomy at a smaller size. The meta line
  carries the status ("Motif · Live site, no outside users yet"). The demo
  link moves to the write-up page.
- **Note:** this reverses one call from the earlier October homepage audit,
  which added the summary because "without it a tile names the role, not
  the thinking" (`components/portfolio/work-tile.tsx:11-14`). The titles now
  carry the argument themselves, so the summary repeats it. Louie decides.

### R2. Move the screenshots off the color plates

- Each screenshot sits on one neutral frame: `surface-muted` (#EEECE5), the
  same token for every project, with a 40px inset at desktop and 20px on
  phones, `rounded-panel`.
- Offboard uses `packet.webp` (the full app window), which brings its own
  dark UI. The panels-on-plate image was made to float on the charcoal
  plate and needs that plate.
- Color stays where there is room for it: the header of each case study
  page. The homepage becomes ink, canvas, and the screenshots.

### R3. A spacing scale with contrast

| Use | Phone | Desktop |
|---|---|---|
| Between homepage sections | 80px | 128px |
| Section heading to its content | 24px | 32px |
| Between cards in a row | 24px | 32px |
| Between rows of cards | 48px | 64px |
| Screenshot to title | 20px | 20px |
| Title to meta line | 8px | 8px |

Tight inside a card, wide between sections. Add these as tokens in
`app/globals.css`, not as one-off values.

### R4. Six type roles, two text weights

| Role | Size / line height | Weight | Use |
|---|---|---|---|
| Display | existing `text-home-hero` | 800 | Hero headline only |
| H2 | 40 / 1.1 | 700 | Section titles and the closing line |
| H3 | 24 / 1.25 | 600 | Card titles, principles |
| Body | 17 / 1.6 | 400 | Lead and paragraphs |
| Small | 14 / 1.5 | 400 | Meta lines, captions, experience details |
| Label | 13 mono | 400 | System labels only |

- Text uses two weights: 400 and 600. Display keeps 800.
- The closing headline moves to H2, so the hero stays the only display line.
- Muted text is one color (`foreground-muted`), not a lighter weight.

### R5. Hero: four things

Headline, lead, ask bar, one link to the work. The ask bar keeps the input
and the send button; the Job description chip and the "Try asking" chips
move into the Ask panel's empty state, where they already exist. Louie
decides, since the chips were a deliberate addition (Plan 043).

### R6. Header: drop the title next to the name

The hero says it. Name, nav, Contact, Ask Louie.

### R7. Experience: a plain list, no tinted band

One row per role: company (600), role and years (400, muted), on the
canvas with hairline rules. Same data, half the visual weight.

### R8. Ask Louie open by default on the desktop homepage

Added 2026-10-15 at Louie's request. On the homepage at 1080px and wider,
the Ask panel starts open as a 400px column on the right (header, greeting,
"Paste a job description", three starter questions, composer). It stays
in view while the page scrolls.

- The hero loses its ask bar entirely: the panel is the ask. That settles
  R5 (headline, lead, one link).
- The header's Ask Louie button shows a pressed state while the panel is
  open; the panel has its own close button.
- Below 1080px the panel stays closed, as today.
- Only the homepage opens it. Case study pages need the width for reading.
- Open question for the build: remember a visitor who closed it, so it
  does not reopen on every visit.

### R9. Work page: one row per case study

- Page title (a seventh type role: 56 / 1.05, 700) and one lead sentence.
  Drop the "Selected work" label above it.
- Each case study is one row: screenshot on the neutral frame, then meta
  line, title, the one-sentence summary, and "Read the case study". Here
  the summary stays: this page exists to compare the work.
- Remove the facts rows (role, years, team). They are on each case study.
- Independent projects use the homepage card.
- Fix the lead: it says "followed by an independent exploration", but
  there are three independent projects.

### R10. Case study pages: one opening, not three

Today the Offboard page opens with a logo chip, the title, a lead sentence,
a facts row, a scope line, and a boxed Problem / What I did / Result card.
The lead and "Problem" say the same thing.

- Title, then one meta line (product · role · years · team).
- Problem / What I did / Result as three plain columns. No box, no
  separate lead, no scope line.
- The hero image keeps its brand plate. This is where project color
  belongs (R2).
- Sections separate by space (112px), not by hairline rules.
- The table of contents uses the section titles' own words, and the
  "Ask about Offboard" card becomes one link under it.

## Order of work

1. **Cards (R1, R2)** on the homepage. Biggest visible change, smallest code
   change: `components/portfolio/work-tile.tsx` and
   `components/portfolio/project-plates.tsx`.
2. **Spacing and type tokens (R3, R4)** in `app/globals.css`, then apply on
   the homepage.
3. **Hero, header, experience, and the open Ask panel (R5–R8).**
4. **`/work` page (F8, R9)** with the same card anatomy.
5. **Case study pages (R10)**, starting with Offboard.

Mockups of steps 1–5 are on the "Audit 051" page of the design canvas:
https://claude.ai/artifact/DTgcwM9gG9F1MrUoihWocK

## Done criteria

- The measurement script below reports 7 or fewer size / weight pairs on
  the homepage.
- A case study card holds 2 text elements plus the screenshot.
- No full-bleed plate color on the homepage.
- Section gaps at least 112px at 1024px and wider.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass;
  `e2e` homepage tests updated for the new card markup; checked at 390px.

## Decisions made (2026-10-15)

- **Dark mode only, no switch.** Reverses "light is the default" in
  AGENTS.md; record the deviation in README.md when built.
- **New hero copy, supplied by Louie:** headline "I make complex things feel
  simple.", description "I design and build AI-powered products that help
  people learn, navigate complexity, and make better decisions.", CTA
  "Explore my work ↓". Replaces `profile.positioning.primary` and
  `.supporting`.
- **Type and color from direction G:** Instrument Serif for headlines,
  Geist for body, Geist Mono for labels and nav pills, lime #C6FF00 with
  dark text for primary actions and the headline highlight. R1's card
  anatomy stays. This supersedes R4's Archivo roles.
- **Hero motion:** small project screenshots inside the headline that pop
  in, cycle through 2–3 real screens, and enlarge on hover; a lime sweep
  on "feel simple." A still version for reduced motion.
- Reference board: "Homepage v2 — dark (chosen)" on the "Audit 051" canvas
  page.

## Decisions for Louie

1. Drop the summary from the cards? Recommended: yes (R1).
2. Screenshot frame: neutral `surface-muted` frame, or the screenshot
   straight on the canvas with only a hairline? Recommended: the frame; it
   keeps the cards a consistent size.
3. Move the Job description and "Try asking" chips out of the hero? (R5)

## References (Mobbin)

- Pentagram work grid: image first, one line of caption.
  https://mobbin.com/sites/sections/933958ee-3d23-4692-bcb7-650e850a84ee
- Figma case studies: neutral frames, title and one link.
  https://mobbin.com/sites/sections/3234074f-60c7-403c-945d-2c7e588395d8
- Clay case studies: image, name, date, nothing else.
  https://mobbin.com/sites/sections/66ffa87c-0bf5-47fe-acd4-2018636364a1

## Measurement script

Run in the browser console on the homepage:

```js
const map = {};
for (const el of document.querySelectorAll("main *")) {
  if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
  const s = getComputedStyle(el);
  if (s.display === "none") continue;
  const k = `${s.fontSize} / ${s.fontWeight}`;
  map[k] = (map[k] || 0) + 1;
}
console.table(map);
```
