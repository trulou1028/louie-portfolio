# Portfolio revision: local review packet

September 19, 2026. Baseline `feedf6e`. Changes are in the local working tree, not committed or deployed. Louie authorized implementation of Plans 029-035. The production domain and older portfolio/deck sites have not been changed.

## Review the result

Local production preview: [homepage](http://localhost:3100/), [analytics](http://localhost:3100/work/ck12-analytics), [Offboard](http://localhost:3100/work/offboard), [Flexi](http://localhost:3100/work/flexi), [Neuron](http://localhost:3100/experiments/neuron-shift).

The preview uses a placeholder AI key. Browse the portfolio normally; real model answers are not enabled in this preview. The automated assistant tests use controlled responses, and the deterministic retrieval tests exercise the actual evidence index.

| Plan | Implemented | Still open |
|---|---|---|
| 029 | Positioning, featured order, consolidation direction adopted | Further personal copy refinements after owner reading |
| 030 | Claim ledger, source register, asset manifest, editorial briefs, refreshed content punch list | Specific collaboration/observation facts and full Offboard workflow asset set |
| 031 | Image-led rows, concise hero/nav, on-demand assistant, role/scope/status/result headers | None for this local layout scope |
| 032 | Separate analytics route, real images, attribution, table, evidence, TOC/metadata/schema | Concrete cross-functional influence episode |
| 033 | One Offboard story including Job Packets, control boundary, plan-first correction, architecture | Review/risk/partial screenshots; dated correction observation and any measured result |
| 034 | Flexi narrative narrowed to demonstrable UI, attributed research, Neuron prototype article/demo, taxonomy | Optional Neuron recording; any later claims need additional proof |
| 035 | Interview kit, local verification, this review packet | Timed owner rehearsal, external comprehension review, production authorization and verification |

## Verification

- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `pnpm test`: 81 passed across eight files.
- `pnpm build`: pass; prebuild validated 32 evidence entries. Production routes include the new analytics and Neuron pages.
- Full production Playwright suite: **241 passed, 7 skipped, 0 failed**, desktop Chromium and iPhone WebKit. Skips are platform-specific tests, not failed feature checks.
- After final editorial polish and adding static/reduced-motion coverage, affected suites: **139 passed, 3 skipped, 0 failed**. Covers Home, case studies, images, accessibility, SEO, no-JavaScript reading, and reduced motion. The command rebuilt the final application.
- Automated route/DOM checks preserve old Offboard/Flexi anchors and validate new anchors, unique sitemap URLs, canonicals, titles, captions, no public TODO markers, and responsive overflow.
- Assistant checks cover open/close, Escape/focus return, retained draft, old hash entry, nested job-fit dialog, long mobile answers, failures, and analytics privacy. Retrieval tests distinguish teacher analytics, Offboard outcome limits, Flexi research, and Neuron prototype status.
- Manual visual review: Home at 1440 and 390; assistant at 390; analytics at 1280 and 768; Flexi at 390; Neuron at 1024. The browser viewport override was reset afterward.
- React review: content remains server-rendered; the dialog is the interaction boundary; chat runtime is activated only after opening; state stays mounted across closes; images have intrinsic dimensions and semantic alt text; no new package/runtime service was added.
- `git diff --check`: pass.

An initial full run had a WebKit load-event stall on Home/Work. It did not recur in a focused four-worker mobile run with a cold image cache, the full rerun, or final affected suites. No speculative loading workaround was added; image decode/navigation regression tests now cover both listings. One obsolete test tried to click content behind the new modal and was corrected to dismiss it first.

This is local application and browser evidence, not a live-provider response evaluation or a production deployment check. Published study figures were source-reviewed; the project implementations themselves were not independently audited for every historical product claim.

## Saved visual evidence

- [Desktop homepage](screenshots/home-desktop.jpg)
- [Mobile homepage](screenshots/home-mobile.jpg)
- [Mobile assistant](screenshots/ask-mobile.jpg)
- [Desktop analytics evaluation](screenshots/analytics-desktop.jpg)
- [Tablet analytics evaluation](screenshots/analytics-tablet.jpg)
- [Mobile Flexi section](screenshots/flexi-mobile.jpg)
- [Laptop Neuron article](screenshots/neuron-laptop.jpg)

## Editorial handoff

Read the [claim ledger](claim-ledger.md), [asset manifest](asset-manifest.md), [briefs](editorial-briefs.md), and [interview kit](interview-story-kit.md). Missing autobiographical facts remain in these editorial files, not invented in public copy. The owner-supplied ready-for-review packet image replaces the initial dashboard hero. Expanded editing, risk-pause, and partial-result states remain missing.

Next owner review: read both flagship openers aloud, confirm the personal scope, and supply the concrete collaboration and entry-point observation when available. A deployment can follow a separate instruction. Do not switch the canonical domain or retire older shared links as part of a local review.

## September 19 follow-up: motion, navigation, and Offboard image

- Added restrained, once-per-view entrances through the installed `motion/react-mini` package. Hero, project cards, and case-study headers move using the global deliberate timing and travel-distance tokens. Text remains fully opaque throughout. Reduced-motion preferences skip or stop motion, and server-rendered content remains visible without JavaScript.
- Fixed stale section navigation by scoping the early hash capture to its pathname and clearing it when the persistent app shell leaves that route. Keeping capture through same-route responsive remounts preserves the mobile pre-hydration deep-link behavior.
- Used Louie's supplied 1556×957 Job Packet screenshot unchanged on Home, Work, and the Offboard article. Updated alt text, caption, product-section narrative, and asset tracking. This shows a completed packet ready for review, not an expanded editing interaction or measured outcome.
- Final checks: typecheck, lint, 81 unit tests, evidence validation, and production build passed. Full desktop Chromium/mobile WebKit suite: **253 passed, 7 platform-specific skips**. Added regressions for fresh Offboard card navigation after Outcomes in both case studies, reduced-motion entrances, and responsive card layout. No-JavaScript reading and accessibility checks passed.
- Visual review caught the need to keep card links block-level inside the motion wrapper; fixed and covered in the layout regression. The first fade version briefly reduced text contrast; opacity animation was removed. An initial consume-once hash fix lost a mobile hydration race; route-scoped capture replaces it and the full suite passes.
- Reviewed the final Offboard image at 1440 and 390 pixels. Saved [desktop](screenshots/offboard-packet-desktop.jpg) and [mobile](screenshots/offboard-packet-mobile.jpg) evidence. Reset the browser viewport afterward.
- This is verified local work. Production has not been deployed.

## September 19 follow-up: visible scroll motion and violet accent

- Fixed the actual invisible-motion defect: production CSS minification converts millisecond timing tokens to seconds. The previous parser divided both by 1000, reducing a 380ms animation to 0.38ms. The parser now respects either unit; the production browser test checks the native animation duration is 700ms.
- Extended once-per-entry motion to article sections. Sections and cards move 2.5rem over 700ms when entering the canvas viewport. Native scrolling, full text opacity, no-JavaScript visibility, stable anchor targets, and reduced-motion behavior remain intact.
- Replaced rust/amber accents with the owner-requested #a37eff, represented by HSL tokens. Dark-mode text and fills use that exact color. Filled controls use dark labels, and light-mode links use a deeper violet for contrast. README records the requested palette/motion departures from the initial spec.
- Desktop contents tracks the section at the reading line, using a violet tint, left marker, and aria-current=location. Scrolling does not rewrite URLs or move focus. Removed a bottom-of-page shortcut that incorrectly selected Learnings while Outcomes occupied the reading line.
- Offboard leads both Home and Work through the shared project metadata order.
- Final verification: typecheck, lint, 81 unit tests, evidence validation, production build, and full browser suite passed. **258 browser tests passed, 8 platform-specific skips.** Includes native animation timing, reduced motion, no-JavaScript reading, accessibility, responsive layout, and Offboard navigation regressions.
- Visual evidence: [desktop homepage](screenshots/offboard-first-violet-home.jpg), [mobile Work](screenshots/offboard-first-violet-mobile.jpg), and [active reading rail](screenshots/violet-reading-rail.jpg). Browser viewport reset after review. Local preview restarted; no production deployment.

## September 19 follow-up: staggered entrances and experience correction

- Replaced uniform block entrances with 90ms cascades through case-study headings, prose, and artifacts, as well as homepage hero content and list items. Adjacent reveals share a capped delay. Travel is now 1.5rem with a softer cubic-bezier easing curve; duration remains 700ms. All values are global motion tokens and preserve the production seconds/milliseconds parsing fix.
- Added motion to Home and Work section headings so headings no longer stay static while neighboring content moves. Content remains server-rendered, fully opaque, and usable with reduced motion or no JavaScript. Existing anchor IDs stay on stationary section elements.
- Removed the reading-rail highlight’s left border. The violet background and text continue to identify the current section.
- Applied Louie's explicit 14+ years correction to shared profile copy and homepage, and reconciled the resume, evidence title, metadata, and design-system example. The resume describes 14+ years of digital product design, without implying all those years were AI work.
- Verification: typecheck, lint, 81 unit tests, evidence validation, and production build passed. Full browser suite: **260 passed, 8 platform-specific skips**. Following the final list cascade adjustment, focused motion and narrative suites: **13 passed, 1 desktop-only skip**. Regression checks assert staggered delays, actual 700ms browser timing, animated homepage headings, borderless current-section styling, and the corrected experience line.
- [Borderless reading rail](screenshots/borderless-reading-rail.jpg) visually reviewed. Browser viewport reset. Local preview only; no deployment.

## September 19 follow-up: editorial reference, navigation assistant, About actions

- Reviewed the public [editorial stagger hero](https://motion.dev/ui/hero-sections), its [component documentation](https://motion.dev/ui/components/stagger-reveal), and the [installation requirements](https://motion.dev/ui/install). The exact registry source requires Motion+ authentication. Implemented the public behavior locally with the existing Motion dependency; no authenticated source or new package was installed.
- Headings now reveal through word masks synchronized by their measured visual line. Supporting content uses a small 0.75rem fade-and-lift entrance. Removed cross-component delay accumulation, and prepare starting positions before observation so scrolling does not send already-visible blocks backwards. Native text wrapping, semantic headings, stable anchor containers, no-JavaScript reading, reduced motion, keyboard focus, and resize fallbacks are retained.
- Moved Ask Louie from the hero into desktop navigation and the mobile navigation header. One app-shell dialog owns activation, draft, and transcript state across routes. Existing hash entry still opens it; internal evidence links dismiss it. The full first Offboard card fits the reviewed 1440×900 homepage viewport.
- Replaced the About contact button cluster and separate Work/Resume buttons with a single closing panel: Explore and Get in touch, consistent icon/link rows, and responsive stacking.
- Verification: typecheck, lint, 81 unit tests, evidence validation, production build, and full desktop/mobile browser suite passed: **264 passed, 8 platform-specific skips**. New checks cover navigation-only assistant placement, preserved drafts across route changes, one dialog instance, and all five About actions in one named section. Motion and no-JavaScript regressions remain green.
- Accessibility audits use reduced motion to inspect final readable styles rather than transient opacity frames; separate motion tests exercise normal animation. A section-highlight test was corrected to wait for its first painted transition frame instead of asserting synchronously on the initially transparent frame.
- Visual evidence: [desktop homepage](screenshots/editorial-home-desktop.jpg), [desktop About actions](screenshots/about-unified-actions-desktop.jpg), [mobile About actions](screenshots/about-unified-actions-mobile.jpg). Viewport reset after review. Local changes only, not a production deployment.
