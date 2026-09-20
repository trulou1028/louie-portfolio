# Plan 035: Rehearse the stories and verify the portfolio release

**Status:** IMPLEMENTED LOCALLY (kit and QA complete; owner rehearsal/release pending) | **Priority:** P1 for flagship release; P2 for remaining stories | **Effort:** M  
**Depends on:** 032-033 for flagship release; 034 for the complete collection  
**Read:** spec §§25-32, 38-40; Plans 020-025 and 028; approved claim ledger.

## Interview kit

Create `plans/portfolio-strategy/interview-story-kit.md` from the approved articles. Keep one factual source per story, but different lengths and entry points. Do not memorize the web page or make an interviewer sit through a site tour.

Prepare a 90-second opener, a 5-minute version, and a 10-12-minute deep dive for each flagship. For a 30-minute portfolio slot, propose two roughly 10-minute stories plus transitions/questions; shorten if the interviewer specifies a different format. Start CK-12 first for general Senior/Lead design, Offboard for AI product, and Offboard technical plus Neuron for engineering-oriented roles.

Suggested 10-minute pattern: one minute situation/ownership; five minutes across two or three decisions with alternatives, collaboration and artifacts; two minutes evaluation/limits; one minute changed direction; one minute discussion. These are rehearsal budgets, not obligations to speak without interruption.

Draft openers to refine against the ledger:

- **CK-12 analytics:** “Teachers had predictions, but still had to decide what they meant for a student. I owned the experience and interaction model. I'll show how we separated prediction from diagnosis, exposed uncertainty, and what the later comprehension results say we still needed to improve.”
- **Offboard:** “I built Offboard to reduce repeated work during a career transition. Job Packets shows what I chose to automate and where people keep control. The more consequential lesson was deciding where that workflow belonged in the overall journey.”
- **Neuron:** “This is an independent prototype, not customer research or a production deployment. I used shift handoff to explore how an AI recommendation can preserve the reasoning of the person responsible for the decision.”

For every story prepare answers to: What did you personally own? What did someone else own? What alternative did you reject? Who disagreed or changed your view, if anyone? What shipped? What was measured? What failed? What would you test next? How did AI development tools contribute and how did you verify the result?

## Five leadership stories, with honest gaps

| Interview prompt | Candidate evidence | Completion rule |
|---|---|---|
| Set direction under ambiguity | Offboard entry point; Neuron thesis as exploration | Separate shipped strategy from hypothesis |
| Changed a product decision | Packet-first to plan-first | Name the observation and actual change |
| Created a system others used | CK-12 2.0 system / concept-level analytics dependency | Need artifact, adoption scope, and precise personal contribution |
| Improved another experienced designer's work | No concrete episode in reviewed material | Collect a real critique/mentoring example or leave a gap |
| Resolved Product/Engineering tension | CK-12 uncertainty/interpretation; Offboard resource and control choices | Establish actual collaborators; solo tradeoffs do not prove cross-team influence |

A portfolio cannot close a missing mentorship or native-mobile requirement through stronger adjectives. Keep the separate design and engineering hiring lanes from the pasted conversation; do not repeat its suggested application allocation as a data-backed prescription.

## Story evaluation

Ask a trusted design reviewer to skim for 60 seconds, then state role, project problem, Louie's decision, and evidence of the result. Rehearse aloud and record questions that require missing proof. Reviewers should be able to separate personal work from team or subsequent research. Success is comprehension, not merely liking the design.

Track interview stage locally: company/role, lane, material shown, screen/hiring-manager/portfolio/final/offer result, exact feedback versus inference, and next adjustment. Do not place this private log in the public site's content or bundle it into AI Louie's evidence. Small samples are directional; separate changed role mix from changed portfolio performance.

## Release QA

1. Run `pnpm validate:evidence`, milestone checks, and production e2e. The current validator verifies the registry, not actual DOM section existence; exercise real routes and anchors in the browser too.
2. Verify old Offboard and Flexi deep links; new analytics and Neuron routes; unique sitemap URLs; page titles, canonicals, Open Graph, and structured data. Reconcile Work's old “two products” copy and AI Systems' two-project assumptions.
3. Test AI retrieval with: “Show teacher analytics”; “What did Louie own?”; “Did he manage designers?”; “Did Offboard improve conversion?”; “Was Neuron built for a real customer?”; “What are Flexi's measured results?” Expected answers must preserve omissions, research ownership, and prototype limits. Do not infer mentoring or promote provisional metrics.
4. Inspect mobile/Desktop, keyboard focus, image alt text, meaningful headings, reduced motion, empty/failed assistant state, and article reading with JavaScript disabled. Primary evidence must remain readable without chat. Run the full mobile/WebKit suite locally.
5. No blank framed assets or editorial TODO boxes on newly featured articles. Keep unresolved content in the ledger and remove it from promotion; don't replace missing proof with decorative illustrations.
6. Preserve existing privacy-conscious analytics and ensure new project IDs are tracked. Use project opens and section engagement as navigation signals, not evidence that the portfolio caused interviews. Do not log questions, job descriptions, resumes, or recruiter identities.
7. Produce a preview review packet with changed pages, source-backed claims, screenshots, test results, and known gaps. Document approved spec deviations in README. Preview approval and production/domain cutover are separate steps; no automatic domain switch in this plan.
8. After deployment is explicitly authorized, verify the production commit, page responses, links, and metadata. Keep existing public versions available until redirects/canonicals and shared interview links are intentionally reconciled. One canonical site does not require deleting useful presentation decks.

## Release sequence and done criteria

Ship a complete CK-12 analytics + Offboard pair first when adopted and verified. Flexi/Neuron may follow without delaying the pair; do not launch empty new cards. Full collection completion requires Plan 034 and the same integrity/route checks. The interview kit is complete only after a timed rehearsal and a documented gap list. Report code/preview/production status separately.

## Recommended implementation models (2026-09-19)

- Codex: GPT-5.6 Sol (`gpt-5.6-sol`), high.
- Claude Code: Claude Sonnet 5 (`claude-sonnet-5`).
- Rationale: Most checks and rehearsal outputs are bounded. Use a workhorse for verification and writing variants; escalate attribution disputes rather than increasing model cost for routine test execution.
- Escalation: use GPT-6 Astra at xhigh or Claude Opus 5 when unresolved evidence or cross-surface behavior requires deeper review; a model cannot resolve missing autobiographical facts.

Availability checked 2026-09-19 against the local Codex host catalog (`models_cache.json` and this task's host tool catalog) and [official Claude Code model documentation](https://code.claude.com/docs/en/model-config). Claude account/provider access must be checked at execution; documentation availability is not proof of account entitlement. These recommendations do not change settings or dispatch agents.

## Execution contract

Louie authorized implementation of Plans 029-035 on 2026-09-19. Publishing and production/domain changes remain separate. Baseline: `feedf6e`, inspected 2026-09-19; the working tree was clean before this planning pass. Recheck Git status and these files before execution; preserve unrelated edits. Read AGENTS.md, the named spec sections, and the current README deviations ledger. The adopted changes are recorded in the README deviations ledger; other spec requirements remain authoritative. Record adopted deviations in README; do not silently rewrite the spec or erase earlier decisions.

Keep the existing stack, tokens, typography, wrapped components, and static browsing. No new database, CMS, auth, vector search, or model migration. Before code changes, read relevant installed Next.js guides under `node_modules/next/dist/docs/`. Missing facts remain labeled TODO(content)/TODO(asset) in editorial drafts. Omit unsupported public claims rather than filling gaps. Stop only the affected claim or deliverable when evidence is missing; continue independent work.

For a code milestone run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, plus relevant production Playwright tests using `pnpm exec playwright test <file>` after the build. Inspect affected pages at mobile and desktop widths, with keyboard and reduced motion. Run the full mobile/WebKit project locally at final release. Report blocked checks accurately. Documentation-only phases need link, scope, consistency, and whitespace checks, not an application rebuild.
