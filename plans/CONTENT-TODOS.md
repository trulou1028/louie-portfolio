# Content punch list

Everything the site is waiting on from Louie, in the order that unblocks the
most. Nothing here was guessed: each item exists because the alternative was
inventing a fact about a real person's career (spec §29, §39.5).

Generated during Plan 008. 35 markers across the codebase, plus 9
`PendingContent` blocks visible in the case studies.

---

## 1. Launch blockers — ✅ CLEARED 2026-08-22

Louie supplied the resume PDF, contact links, and a Calendly scheduling link.
`content/resume.ts` is fully populated, the PDF is downloadable at
`/resume/louie-sakoda-resume.pdf`, and email/LinkedIn/availability render in
the rail, footer, About page, and structured data. The resume also verified:
San Francisco, the "10+ years" figure, the 20M+ CK-12 platform scale, and the
full Offboard stack (Vite, Supabase, Postgres/RLS, Deno edge functions) —
those entries and case-study sections have been updated accordingly.

Note: Louie's phone number is on the PDF but deliberately NOT rendered on the
HTML resume page (public + crawlable = spam risk). His call to reverse.

Originally:

### Resume — `content/resume.ts`

The page renders the full structure the moment this is populated; until then it
says the resume isn't published yet. **An invented employment history is the
one error this site must never make**, so nothing is approximated.

- [ ] Roles: company, title, dates, responsibilities, highlights
- [ ] Education
- [ ] Skills, as you would list them
- [ ] A PDF at `public/resume/` — set `pdfPath` to enable the download action

### Contact and availability — `content/profile.ts`

Currently the left rail, mobile drawer, footer, About page, and `Person`
structured data all omit these rather than fake them.

- [ ] `links.email`
- [ ] `links.linkedin`
- [ ] `availability.status` + `label` + `detail` (the mockup showed two lines:
      "Available for new projects" / "Open to full-time roles")

---

## 2. Makes the work credible

The case studies are structurally complete and argue real decisions, but these
gaps are visible as "Content pending" blocks on the live pages.

### Offboard — `content/work/offboard.mdx`

- [x] **Architecture accuracy.** ✅ Resume-verified (Vite, Supabase, Postgres/RLS, Deno edge functions, paid plans, solo-built). The spec listed the stack as *candidates from
      current work*, not verified fact. Confirm the frontend framework, whether
      payments belong in the diagram, and which parts you built personally.
- [x] **Human-in-the-loop examples.** ✅ Pattern family resume-verified (visible progress, editable outputs, approval checkpoints, confirmation-first). Screenshots still wanted. One or two concrete shipped actions that
      use preview-and-confirm, and any case where you relaxed the pattern.
- [ ] **Outcomes.** Only verifiable ones — shipped/actively used, usage or
      repeat-usage figures, application packets, interview prep sessions,
      employer-sponsored users, quotable feedback. Omit anything unknown.
- [ ] **Learnings.** What held up, where users struggle, what you'd change.

### CK-12 Flexi — `content/work/flexi.mdx`

- [ ] **Research findings.** The most valuable gap on the site. The section
      names the areas studied and stops, because spec §14 forbids inventing
      research statistics. Needed: method, findings on reading level and tone,
      over-reliance and academic integrity, what teachers said they needed,
      observed failure modes, and any quotable material.
- [ ] **Uncertainty treatment.** How low confidence, refusal, and recovery
      actually look in the product.
- [ ] **Teacher surface.** What teachers can see, and where you drew the line
      against surveillance.
- [ ] **Outcomes** and **Learnings**, same standard as Offboard.

### Screenshots — `public/work/`

Six framed slots are waiting, each with a written caption. They currently show
a labelled empty frame rather than a stand-in image.

- [ ] Offboard: opportunity workspace · risk gate · preview-and-confirm
- [ ] Flexi: tutoring exchange · uncertainty treatment · teacher view
- [ ] Card thumbnails for both projects (`projects.ts` → `image`)

---

## 3. Polish

- [ ] **Portrait or illustration** for the About page and the rail profile.
- [ ] **Open Graph share image** (1200×630). Metadata is wired; the image isn't.
- [x] **Second hero line** ✅ Set from resume facts; refine wording if desired. summarising CK-12 and Offboard — spec §11 §1 left
      the wording pending your approval.
- [x] **"10+ years designing digital products"** ✅ Resume-verified.
- [ ] **Pull quotes.** Two are in use from the strategy mockup; confirm or
      rewrite them.
- [x] **Location.** ✅ Resume-verified: San Francisco, CA. Now in About + Person schema. The mockup said "Based in San Francisco". Not adopted —
      that mockup also misdescribed Offboard, so its facts aren't trusted
      unverified.
- [ ] **Experiments.** All four are honest placeholders. Each needs a summary
      and eventually a 20–60 second demonstration (spec §15).
- [ ] **Writing.** Empty by design rather than filled with placeholder posts.

---

## 4. Decisions only you can make

- [ ] **`--foreground-subtle` fails WCAG AA for text** (2.98:1 against canvas;
      4.5:1 required). Restricted to non-text use for now. Darkening it to
      roughly `35 6% 46%` would reach AA — your call, since it's a spec §6
      token.
- [ ] **Resume in the primary nav?** The strategy mockup omits it; spec §10
      lists it and spec §28 requires an HTML resume route. Currently kept.
- [ ] **Evidence index review.** 14 entries ground everything AI Louie says.
      Worth reading once — it's the authority for every factual claim, and
      several `detail` fields note that a section is still pending.

---

## How to verify you got them all

```bash
grep -rn "TODO(content)\|TODO(asset)" app components content lib
```

Any `PendingContent` block or empty artifact frame still visible on the site
will also show up as `data-pending-content` or `data-pending-asset` in the DOM.
