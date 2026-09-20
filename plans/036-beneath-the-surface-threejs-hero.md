# Plan 036: Beneath the surface, interactive Three.js hero

Status: SHELVED AFTER LOCAL EXPERIMENT, not mounted on the homepage. Date: September 20, 2026.

## Outcome and authority

Create the approved compact three-layer product sculpture beside the homepage headline. Visitors reveal the interface, decisions, and system underneath it. This is an illustrative model of Louie's approach, not a factual architecture diagram for any client product.

Read AGENTS.md; spec sections 6-11, 25-29, 33, 39; current app/page.tsx, app/globals.css, content/profile.ts, motion-reveal.tsx, and home/listing tests. Current user-approved positioning and layout supersede older spec hero copy. Inspect Git state and preserve the existing uncommitted logo/card/hero refinements.

Visual reference: [approved concept](portfolio-strategy/references/beneath-the-surface-concept.png). Use the sculpture and its assembled/expanded relationship as direction. The generated screenshot is not authority for navigation, copy, project imagery, materials precision, or layout dimensions. Keep the real sidebar, identity, full supporting copy, Offboard-first cards, and Ask Louie placement.

## V2 art-direction revision - September 20, 2026

The first local implementation proved the interaction and fallback architecture, but its bordered container, explanatory footer, visible layer labels, and button made the sculpture read as an instructional product card. Louie approved a second direction in which the object belongs directly to the hero and the response is discovered rather than explained.

- Remove the card background, border, divider, visible labels, instructions, and visible CTA.
- Keep the headline, identity, supporting copy, and selected-work sequence unchanged.
- Give the layers different physical roles: a finished interface plate, an open decision framework, and an exposed system network.
- Rest in a subtly separated pose, then open farther on hover or explicit activation. Do not add a continuous idle loop, bloom stack, particles, orbit controls, or scroll-linked motion.
- Make the sculpture region the interaction target. Preserve a native keyboard control with visible focus, Enter/Space activation, Escape-to-close, touch toggle, a textual equivalent, and a static reduced-motion state.
- Frame the maximum expanded silhouette inside the WebGL canvas. DOM overflow alone does not prevent camera or canvas clipping.
- On mobile, use the compact local poster rather than loading WebGL. Keep the object clear of the Selected work heading and preserve the quick path to portfolio evidence.

## Recommended implementation models

Verified September 20, 2026.

- Primary: Codex **GPT-5.6 Sol, medium reasoning**, selected by Louie for implementation and available in the local host catalog. The completed implementation did not require escalation.
- Delegation: **GPT-5.6 Terra, medium reasoning** for repository exploration, browser-test coverage, and routine review.
- Escalation path: Astra Low or Medium only for an isolated blocker after attempting it with Sol. Astra High or xHigh remains reserved for a blocker that survives a Sol attempt, per Louie's implementation direction.
- Claude Code alternative: **Claude Opus 5**, if available in the user's Claude Code model selector. Official Anthropic documentation confirms the model; this session has not verified the user's Claude account access. Appropriate for the same integrated visual engineering task. No claim that it produces better 3D art than Astra.
- Sources: [OpenAI Astra model documentation](https://developers.openai.com/api/docs/models/gpt-6-astra), [Anthropic Opus 5 announcement](https://www.anthropic.com/news/claude-opus-5). The recommendation does not change model settings or authorize implementation/deployment.

## Scope and construction

Use `three` with `@react-three/fiber`; verify compatible releases against React 19 before installation, pin through pnpm's lockfile. Add `@types/three` if required. Use Three.js geometry/helpers directly; add individual Drei helpers only if they substantially simplify the implementation. No physics engine, downloaded models, external environment maps, postprocessing stack, or new animation framework in the initial version.

Build three low-complexity beveled rectangular slabs from reusable geometry. Orthographic camera, fixed isometric composition, restrained graphite materials, soft directional lighting, and an inexpensive grounding shadow. Use lavender seam geometry/emissive accents instead of full-screen bloom. Render simple original interface marks on the top slab, a branching decision diagram on the middle slab, and connected nodes on the bottom slab. These are abstract illustrations, with no invented metrics or product claims. No image generation at runtime.

All colors/motion/layout values belong in named tokens or a shared scene configuration, with colors derived from the site's CSS tokens. Respect both token palettes. No new typography system. Avoid transparent overlapping slabs and heavy transmission materials in V1; their visual and GPU costs are not needed for the reference.

## Phase 1: Layout and static composition

1. Capture baseline homepage screenshots at 1440x900, 1024x768, 768x1024, and 390x844; record first-card position and production loading metrics.
2. Reserve a fixed-aspect scene region. Use actual main-column/container width, not viewport width, to choose side-by-side versus compact stacked presentation because the sidebar consumes width.
3. Keep headline and supporting copy server-rendered and unchanged. On mobile use a compact scene with a single tap control. Compare against baseline; target no more than 120px extra displacement of the first work card. If this cannot be achieved, use a compact poster/control that opens the scene within its own region rather than expanding the hero indefinitely.
4. Build static assembled and exploded poses with readable layer markings and clean silhouette before adding interaction. Save screenshots to verify the object resembles a precision product model, not a stack of generic cards.

Deliverable: real browser-rendered geometry in both poses, integrated into the current homepage composition.

## Phase 2: Reversible interaction

Use one animation progress value from 0 (assembled) to 1 (expanded). Derive slab positions, tiny rotations, seam intensity, leaders, and label opacity from that value so rapid pointer changes reverse from the current pose without jumps. Use frame-rate-independent damping; do not set React state every frame.

- Initial: assembled, no autoplay orbit or endless bobbing.
- Fine-pointer hover within the stable scene wrapper: preview expanded. Use the wrapper rather than individual moving meshes so motion does not cause hover flicker.
- Pointer exit: return to assembled unless explicitly pinned by the button.
- Button `Explore the layers`: pin expanded. Change label to `Reassemble`, with `aria-expanded` reflecting the state. Reassemble clears hover-preview until the pointer leaves and re-enters, avoiding instant reopening.
- Keyboard: native button activated by Enter/Space. Escape returns to assembled and leaves focus on the control. Merely tabbing into the button should not produce an unexpected animation.
- Touch/coarse pointer: button toggle only, no simulated hover. Preserve vertical page scrolling.
- Add at most subtle, clamped pointer-responsive perspective to the whole object. No OrbitControls, drag capture, scroll hijacking, camera flight, or zoom.
- Starting art-direction targets: 650-900ms perceived expansion, 60-90ms layer offsets, minimal overshoot. Tune against the actual scene; centralize parameters rather than scattering timings.

## Phase 3: Leaders and accessible explanation

Anchor fine lines and crosshairs to real layer positions. Project into a DOM/SVG overlay within the scene wrapper so labels remain sharp and readable. Recompute on resize and active frames; clamp label placement to the region and use a compact arrangement at narrow widths. Fade leaders in after enough separation exists. No labels covering hero copy or clipping outside the canvas region.

Use these short descriptions as proposed illustrative copy:

- Interface: What people see and use.
- Decisions: The choices that shape the experience.
- System: How the pieces work together.

Expose the explanation as ordinary DOM text, not WebGL text alone. Treat the canvas as decorative where that DOM equivalent provides the meaning. Maintain visible focus and contrast. Labels need not become links; project navigation remains in the actual work cards.

## Phase 4: Loading, fallback, and performance

- Keep app/page.tsx a server component. Introduce a small client wrapper that owns a lazy scene import with SSR disabled inside the client boundary, following local Next 16 documentation.
- Show a lightweight locally owned SVG/static poster immediately in the reserved region. Load 3D after initial content is ready and the region is visible, or on explicit interaction. Queue early user intent so tapping during loading still expands when ready.
- Reduced-motion preference: static expanded illustration and descriptions, no parallax or animated interpolation. If changed mid-session, settle immediately. Avoid downloading WebGL for an initially reduced-motion visitor when the poster suffices.
- WebGL unavailable, import failure, or context loss: retain the poster and useful DOM explanation. Do not expose a dead toggle or replace the homepage with an error.
- Use demand rendering. Invalidate while progress/pointer pose is changing; stop frames once settled. Pause while offscreen or document hidden. Resume cleanly. Cap device pixel ratio initially at 1.5, lower if measurements require it.
- Reuse geometries/materials; dispose on unmount. Test navigation away/back for leaked contexts and listeners. Avoid loading the scene on other routes.
- Targets, not claims: under 50 draw calls and 50k triangles; no continuous idle render loop; smooth desktop interaction aiming at 60fps and usable mobile motion of at least 30fps on a named test device. Record actual results and limitations.
- Preserve spec performance goals: practical Lighthouse 90+, LCP <2.5s, CLS <0.1. Compare repeated production-build runs against baseline under the same conditions. If the visual causes regression, simplify shadows/materials/DPR/loading before adding effects.

## Suggested file boundaries

- `components/portfolio/hero-system/hero-system.tsx`: client state, lazy import, control, fallback, preferences.
- `components/portfolio/hero-system/scene.tsx`: Canvas, camera, lighting, slab groups, animation lifecycle.
- `components/portfolio/hero-system/layers.ts`: shared layer definitions, poses, descriptive content.
- `components/portfolio/hero-system/labels.tsx`: accessible labels and projected leader overlay.
- `components/portfolio/hero-system/poster.tsx`: static SVG equivalent.
- `app/page.tsx`: hero integration only.
- `app/globals.css`: named tokens and scoped layout styling as needed.
- `e2e/hero-system.spec.ts`: behavioral coverage; avoid brittle pixel equality across GPUs.

Names are suggestions; keep the implementation small rather than creating unnecessary abstractions.

## Phase 5: Verification and handoff

Run required `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`; run homepage, image-loading, accessibility, and new interaction browser tests on desktop and mobile projects. Use an isolated test port to preserve the owner's preview.

Verify native-button keyboard activation, rapid hover in/out reversal, pinned-open behavior, reassemble while hovered, touch scrolling, reduced motion, unavailable WebGL/import failure, viewport resize, route leave/return, loading intent, and no horizontal overflow. Unit-test a state transition helper only if one is introduced; do not add tests that merely mirror geometry constants.

Review actual screenshots plus a short recording of expand/reassemble; static screenshots cannot establish motion quality. Save evidence and measured performance details beside the plan. Check the three labels at all breakpoints, first-work visibility, and that Ask Louie and existing reveal animations still work. Verify the final material appearance in a real browser before declaring completion.

Update README with the intentional exception to the original deferred 3D-hero scope and document fallback behavior. Keep a simple rollback: remove hero-system integration and dependencies/assets used only by it. Prepare a local reviewable result; production deployment is a separate user instruction. This planning request does not start implementation.

## Suggested execution prompt

Implement plans/036-beneath-the-surface-threejs-hero.md with GPT-5.6 Sol at medium reasoning, delegating routine repository and test work to GPT-5.6 Terra. Preserve current uncommitted portfolio refinements. Use the saved concept for sculpture art direction, retain real site content, build and visually inspect both poses before polishing motion, then complete responsive, accessibility, fallback, and performance verification. Report measured results and remaining limitations. Do not deploy as part of this implementation.

## Local verification record

Completed September 20, 2026.

- The live desktop scene renders one orthographic, demand-driven canvas. The three-layer assembled pose and pinned expanded state were inspected in the browser.
- At 434x805, mobile uses the static poster and does not mount a canvas. Selected work begins at 553.8px versus the 442px baseline, an increase of 111.8px within the 120px budget.
- The focused production-browser suite passed 70 tests with 4 expected project-specific skips. Coverage includes keyboard and Escape behavior, rapid hover reversal, no-JavaScript and unavailable-WebGL fallbacks, reduced motion, accessibility, responsive overflow, image decoding, and the existing homepage flows.
- Typecheck, lint, 86 unit tests, evidence validation, and the production build pass.
- The dynamically split Three.js scene chunk is approximately 881KB uncompressed in the local production build. It is not mounted below 540px or for reduced-motion visitors. A formal production Lighthouse run and motion recording remain release checks; no Lighthouse score or frame-rate claim is made here.
