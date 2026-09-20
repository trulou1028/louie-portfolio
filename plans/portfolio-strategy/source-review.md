# Portfolio source review

Reviewed 2026-09-19. This is the research basis for Plans 029-035, not a claim that the described product outcomes or personal contributions were independently audited. All five supplied sites were read live; browser layout inspection was at the available desktop viewport. Mobile, accessibility, performance, prototype execution, and production product behavior were not audited in this planning pass.

The first three supplied URLs could not be retrieved with the web extraction tool, but were accessible in the browser. Their page text and layout were inspected there. Current Next.js case-study content and implementation contracts were inspected in the supplied repository at `feedf6e`. The pasted conversation was read in full; its interview assessments are supplied context rather than independently verified interview records.

## Source inventory

| Source | Material inspected | What to take | What to avoid |
|---|---|---|---|
| [1. New portfolio](https://louie-portfolio-six.vercel.app/) | Live homepage; local homepage, Offboard/Flexi MDX and routes, evidence index, experiments, AI Systems, existing plans and spec | Working typed implementation, decision-based sections, stable citations, established design language | Treating a functioning shell as a finished portfolio; blank image frames, missing role metadata, unfinished results/research |
| [2. Neuron Shift](https://neuron-shift.vercel.app/case-study#premise) | Case-study text and layout, including premise, decisions, technical detail, deliberate limits, open question, build process | Specific user/moment, explicit alternatives, reversibility, inherited reasoning, honest uncertainty | Presenting simulation as live AI or production operations; letting the technical diary and speculative essay overwhelm the central demonstration |
| [3. New case studies](https://louie-sakoda-work.vercel.app/index.html) | Index, [CK-12 deck](https://louie-sakoda-work.vercel.app/ck12.html), [Job Packets deck](https://louie-sakoda-work.vercel.app/job-packets.html) | Strongest concrete teacher-analytics decisions; Offboard workflow and strategic revision; reusable diagrams/artifacts | Importing slide pacing into a long web article; leaving ownership and strategic learning late; treating numbered agents as the plot |
| [4. Derrick Choi](https://www.derrickchoi.com/) | Homepage, [career index](https://www.derrickchoi.com/career), and opened Amazon chapter | Present-day identity, selective index, chapter argument and artifact, specific choices, lesson that carries forward | Assuming executive narrative alone supplies design hiring proof, copying his identity, or claiming the site explains his hiring outcome |
| [5. Existing portfolio](https://www.louiesakoda.com) | Homepage, active Flexi case-study overlay, and extracted Offboard/legacy text | Useful Flexi research narrative and reflections; Offboard's broader motivation and ownership | Shopping-cart framing for this hiring goal; inaccessible-to-skimming modal depth; conflicting or inactive legacy drafts |

## What the current presentation communicates

The new site's hero says “I plan, design & ship AI products.” It names planning, but still foregrounds activities. At the inspected 1280-wide desktop view, a substantial left rail and open Ask panel flank the article column. The featured cards start below a long introduction and contain empty image areas. A hiring manager can infer fluency, but must work to see product craft and responsibility.

The new two-case-study site is more opinionated: it connects AI work through human judgment. Its stories contain better material than the main site's placeholders. Its 16-section CK-12 and 14-section Offboard presentation format is useful during an interview; a recruiter browsing alone needs shorter openings and direct access to the decisive artifacts.

The legacy site has a playful identity and more developed Flexi prose, but the active case studies live behind generic hash links. Web extraction also exposes older, apparently inactive content, including a misnamed Lumo section followed by another Flexi version with different team and metric claims. Those extracted blocks should not silently become canonical copy.

Neuron is unusually explicit about assumptions and what has not been built. Preserve that honesty. Its long open-question essay and detailed bug histories are optional depth, not prerequisites to understanding the design.

## Reference-site learning

Derrick's [homepage](https://www.derrickchoi.com/) states a present role, then offers a small index. His [career page](https://www.derrickchoi.com/career) gives each role a distinct argument and artifact. The [Amazon chapter](https://www.derrickchoi.com/career/amazon), opened from that index, uses challenge, contribution, selected product choices, and a carried-forward lesson. It explicitly limits what it shares from an internal document.

Adapt the editorial selectivity and scoped attribution. Keep actual interface work and evaluation more prominent for Louie's design audience. This observation does not establish that the portfolio caused Derrick's current appointment; no hiring-causality claim is used in the plans.

## Independently checked CK-12 evidence

The official [Foresights report](https://info.ck12.org/impact-team-studies/foresights-teacher-analysis) describes a ten-teacher demo-class review. It reports 70% perceived meaningful data, 90% anticipated time savings, mean comprehension of 75%, and graph difficulty for half the participants.

The official [Insights report](https://info.ck12.org/impact-team-studies/insights-study-analysis-bzcgn) also describes ten teachers using a demo class. It reports 90% perceived meaningful data, 100% anticipated time savings, mean comprehension of 73%, and graph difficulty for half the participants.

These reports support the deck's evaluation tension. They do not measure actual time saved, establish platform-wide adoption, prove learning gains, identify Louie's research role, or establish that both studies used different participants. The dates and connection to Louie's design versions still need reconciliation. Keep the limitations in the article.

The [CK-12 efficacy index](https://info.ck12.org/efficacy-studies) lists the LeanLab Spring 2025 evaluation and the dialogue/conversation-pattern work. Their existence was verified; their complete reports, all quotes, and causal interpretations were not checked here. Plan 030 requires that work before importing their detailed claims.

## Highest-priority unresolved claims

1. CK-12's 20M+ and 265M+ scale figures describe different or undefined populations/periods. Resolve scope before using either as a headline; neither establishes Flexi feature adoption.
2. The CK-12 deck's concept-per-assignment change has a plausible systems connection but needs a direct release source and accurate attribution.
3. The active legacy Flexi story and current spec name uncertainty and teacher controls without sufficient concrete product artifacts in this repository. Verify what actually shipped and when.
4. Offboard's new deck includes an important plan-first correction, but its usage basis, dates, and subsequent effect were not independently measured here.
5. Offboard's automatically filed application record conflicts with an overly broad reading of the older “everything is previewed and confirmed” story. Explain control at the actual boundary.
6. Neuron's limits are explicit: simulation, no live model, no operator interviews, no affiliation. Keep them attached to both the article and AI evidence.
7. Concrete senior-designer mentorship and design-system adoption episodes are not established by this source set. Do not infer them from a Lead title.

## Implementation observations

- `content/work/projects.ts` currently types only `offboard` and `flexi` and has null image values.
- Homepage selection currently maps the entire work-project array, so adding projects without a featured distinction would turn every entry into a headline case study.
- Existing Offboard/Flexi anchors are public contracts used by the TOC and AI evidence. Preserve them when reorganizing.
- `content/evidence/evidence.ts` and `lib/ai/schemas.ts` both constrain project identities. Add analytics consistently.
- `scripts/validate-evidence.ts` checks the route/anchor registry, not whether the MDX actually renders each target. Browser checks remain necessary.
- The experiment detail page renders only a summary or placeholder. Neuron needs a small real content path, not just an extra list item.
- `app/sitemap.ts` combines the fixed route list with experiment pages. Registering Neuron for AI navigation requires duplicate-URL handling there.
- `app/work/page.tsx` and `/ai-systems` currently contain two-project assumptions.
- The existing content punch list has stale items; refresh it from actual files during execution rather than treating every unchecked box as missing.

## Scope of this delivery

Plans and this source review only. No application implementation, source-site modification, publishing, AI requests using private materials, or domain migration was performed. Application builds and responsive QA belong to the implementation milestones; documentation consistency and link checks validate this planning delivery.
