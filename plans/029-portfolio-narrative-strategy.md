# Plan 029: Portfolio positioning, sequence, and narrative strategy

**Status:** IMPLEMENTED (adopted 2026-09-19) 
**Priority:** P1 | **Effort:** S | **Depends on:** none  
**Read:** spec §§1-2, 10-15, 29, 38-39; Plans 011-015; [source review](portfolio-strategy/source-review.md).

## Recommendation

Position Louie as a **senior product designer and lead IC who shapes complex workflows and can carry AI products into production**. Building is evidence of execution and judgment. Team influence must be demonstrated with actual decisions and collaboration, not inferred from the ability to build alone.

The pasted interview diagnosis is a working hypothesis, not a verified hiring-funnel analysis. A roughly estimated screen conversion does not establish why later rounds stall. Improve the portfolio while tracking role fit and interview stage separately.

Proposed hero copy, for editorial review:

> Senior product designer. Complex workflows, clear decisions.
>
> I shape AI products around the decisions people need to make, from learning tools at CK-12 to building Offboard end to end.

Keep “Designing AI that people can question” as an optional section thesis or interview opener. It is distinctive, but too narrow to carry every dimension of senior product work. Explicit role language should precede it. Do not imply a new employment title.

## Portfolio sequence

| Placement | Story | The hiring question it answers |
|---|---|---|
| Featured 1 | CK-12 Foresights & Insights | Can he frame complex problems, work across disciplines, and evaluate whether people understand the result? |
| Featured 2 | Offboard, told through Job Packets and the plan-first correction | Can he set direction, prioritize, ship, and change course when the product teaches him something? |
| Secondary production work | CK-12 Flexi | Can he design conversational learning behavior and respond to research? |
| Featured exploration | Neuron Shift | Can he develop a testable product thesis and make difficult interactions work in code? |

Foresights & Insights is a new, separate case study. It is not an alternate name for Flexi. Keep both under the CK-12 employer association without making readers enter an employer landing page first. Keep one canonical Offboard article; Job Packets is its concrete spine, not a competing general case study. Retain links to focused sections for role-specific sharing.

Default order serves Senior/Lead Product Designer hiring. For AI product roles, share Offboard first. For design/product engineering, share Offboard's technical section and Neuron Shift, retaining the prototype disclosure. For learning/conversational roles, share Flexi first. Use direct links and tailored interview order; do not build a role-selector or duplicate portfolios.

Do not add another full CK-12 design-system case study yet. Current resume evidence supports experience, but a separate leadership story needs an actual standard, adoption example, governance decision, and attribution. Use those artifacts as an optional related note when available.

## Homepage layout

Proposed composition, using the existing visual language:

```text
Compact identity / navigation: Work | About | Resume | Contact
Role + short positioning statement + one sentence of career context
Selected work
  01 CK-12 Foresights & Insights: large real artifact + decision-led summary
  02 Offboard: large real artifact + decision-led summary
More work
  CK-12 Flexi: shorter card
Exploration
  Neuron Shift: prototype badge + workflow image + demo link
How I work: three evidence-linked statements, not another skills list
Contact / resume
Ask Louie: accessible on demand; closed initially
```

Use a vertical editorial sequence, not four equal tiles. Each anchor project gets a real interface image, short title, one sentence of scope, a concrete decision, and a visible case-study link. Start with a roughly balanced image/text row on wide screens and image-first stacking on narrow screens; fit to the content column, not viewport width alone. Put the first project's name and argument early enough to encounter quickly. Trim the hero instead of shrinking text to force an arbitrary fold.

Preserve the present dark palette, Roboto Slab/Outfit/mono roles, split accent, and reusable primitives. First remove the initially open Ask rail from the homepage and simplify the left rail; do not undertake an unrelated global navigation rewrite. A compact top navigation is a later alternative only if the simplified shell still obstructs reading.

The assistant can be distinctive without occupying roughly a quarter of the initial desktop viewport. Keep it reachable by keyboard and on mobile, with its existing dialog/composer behavior. Primary reading must be complete without opening it. Keep `/ai-systems` as a secondary evidence index, reachable from Work/About; remove it from primary navigation only when the replacement link exists. Keep Writing secondary until substantive writing exists.

## Shared story arc

Every case study should support three reading speeds:

1. **30-second skim:** user, stakes, role, central decision, product image, honest result/status.
2. **3-5-minute read:** two or three consequential decisions with evidence and tradeoffs.
3. **10-12-minute presentation:** those decisions plus collaboration, an alternative rejected, evaluation, and what changed next.

Use this sequence: situation and stakes → what I owned → decision and alternative → who shaped the choice → artifact → what changed → evidence and limitations → what I would do next.

For each decision, answer: what was uncertain, what did I choose, what did I give up, who did I work with, and how do we know what happened? “Worked with engineering” is not enough; identify the constraint or disagreement and resulting change if the record supports it. Do not invent disagreement, mentoring, or causal impact.

Suggested editorial limits, not measured reading times: flagship articles about 900-1,400 words excluding optional technical detail; Flexi about 700-1,000; Neuron about 500-800 plus demo. Prefer three useful artifacts to a long gallery. Each caption should explain the decision the image proves.

## Consolidation decisions

| Current material | Action |
|---|---|
| Main Next.js site | Keep as the implementation and canonical publishing destination |
| Separate CK-12 and Job Packets decks | Use as interview source material; adapt into web articles rather than importing full-height slides |
| General Offboard + Job Packets + legacy Offboard | Merge into one story with focused anchors and optional technical depth |
| Flexi in current and legacy sites | Reconcile into one source-backed article; retain its existing route |
| Neuron's long technical/debugging narrative | Keep three product decisions in the main article; put implementation specifics in optional detail/source |
| Neuron's long cross-industry automation essay | Remove from the case-study path; retain as private notes or later sourced writing |
| Repeated trust principles, tool badges, philosophy quotes | State once, then prove with different examples |
| Empty experiment category cards | Stop promoting; preserve existing URLs until an explicit retirement mapping exists |
| Legacy shopping-cart metaphor | Leave out of this hiring-focused revision |
| Empty frames and public editorial TODOs | Resolve with supplied assets, omit nonessential blocks, or keep the case study unfeatured |

## Derrick Choi: what transfers

The current site separates a clear present-day role from a small career index. Each chapter carries a specific argument, an artifact, and a lesson. The Amazon chapter pairs a research question with choices about product direction and makes confidentiality limits explicit. Adapt that economy: one promise per project, selective depth, and a coherent career throughline. [Homepage](https://www.derrickchoi.com/) · [career index](https://www.derrickchoi.com/career) · [Amazon chapter](https://www.derrickchoi.com/career/amazon).

Do not copy an executive's amount of evidence as a minimum for design hiring. Louie still needs interface craft, personal scope, research attribution, and product consequences. Do not infer that the portfolio caused Derrick's appointment or that Louie should position himself as a people manager.

## Adoption and completion

Deliver an approved one-page positioning brief, final project ordering, and proposed copy with claim references. Resolve only meaningful preference decisions with Louie; no need to ask him to reconfirm existing fonts or stack. This plan proposes changes to spec §§10-11 and the owner decisions behind Plans 011-015. Once adopted, record the changes in README before implementing them.

Next: Plan 030 supplies the factual contract. Plans 031-035 carry the content and implementation. No application code changes belong in this planning phase.

## Recommended implementation models (2026-09-19)

- Codex: GPT-6 Astra (`gpt-6-astra`), high.
- Claude Code: Claude Opus 5 (`claude-opus-5`).
- Rationale: Cross-source editorial judgment and attribution are the main risks. Use stronger reasoning for reconciliation; routine copy insertion does not need the same cost.
- Escalation: use GPT-6 Astra at xhigh or Claude Opus 5 when unresolved evidence or cross-surface behavior requires deeper review; a model cannot resolve missing autobiographical facts.

Availability checked 2026-09-19 against the local Codex host catalog (`models_cache.json` and this task's host tool catalog) and [official Claude Code model documentation](https://code.claude.com/docs/en/model-config). Claude account/provider access must be checked at execution; documentation availability is not proof of account entitlement. These recommendations do not change settings or dispatch agents.

## Execution contract

Louie authorized implementation of Plans 029-035 on 2026-09-19. Publishing and production/domain changes remain separate. Baseline: `feedf6e`, inspected 2026-09-19; the working tree was clean before this planning pass. Recheck Git status and these files before execution; preserve unrelated edits. Read AGENTS.md, the named spec sections, and the current README deviations ledger. The adopted changes are recorded in the README deviations ledger; other spec requirements remain authoritative. Record adopted deviations in README; do not silently rewrite the spec or erase earlier decisions.

Keep the existing stack, tokens, typography, wrapped components, and static browsing. No new database, CMS, auth, vector search, or model migration. Before code changes, read relevant installed Next.js guides under `node_modules/next/dist/docs/`. Missing facts remain labeled TODO(content)/TODO(asset) in editorial drafts. Omit unsupported public claims rather than filling gaps. Stop only the affected claim or deliverable when evidence is missing; continue independent work.

For a code milestone run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, plus relevant production Playwright tests using `pnpm exec playwright test <file>` after the build. Inspect affected pages at mobile and desktop widths, with keyboard and reduced motion. Run the full mobile/WebKit project locally at final release. Report blocked checks accurately. Documentation-only phases need link, scope, consistency, and whitespace checks, not an application rebuild.
