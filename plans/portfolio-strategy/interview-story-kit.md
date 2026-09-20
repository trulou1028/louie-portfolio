# Interview story kit

September 19, 2026. Drafted from the implemented articles and [claim ledger](claim-ledger.md). Durations below are rehearsal targets, not measured speaking times. Louie still needs to rehearse aloud, confirm personal phrasing, and record the gaps/questions that arise. No external reviewer has evaluated this kit yet.

## Choose a route

| Interview lane | Lead | Second story | What to establish |
|---|---|---|---|
| Senior/Lead Product Designer | CK-12 analytics | Offboard | Interpretation, cross-functional scope, evaluation, strategic correction |
| AI Product Designer | Offboard | Flexi or analytics | Automation boundary, state/recovery, judgment, evidence |
| Design/Product Engineer | Offboard architecture | Neuron | Working implementation, tradeoffs, verification, prototype limits |
| Learning / conversational products | Flexi | Analytics | Student support versus teacher decisions; different evidence for each |

For a 30-minute slot, budget roughly ten minutes per flagship, one minute for introduction/transitions, and nine minutes for discussion. Ask the interviewer at the start how they would like to use the time. Do not force two stories if they want to explore one.

## CK-12 analytics: 90-second opener

“Teachers had predictions, but they still had to decide what those predictions meant for a student. Before an assignment, the question was who might need support. Afterward, it was what happened and what to do next.

I was the Lead Product Designer for the experience architecture, interaction model, prototypes, and visual language. I worked with educators, Product, Data Science, and Engineering. I’ll focus on the interface decisions I owned, and separately attribute the published evaluation.

The first choice was to keep prediction and diagnosis distinct. Foresights supports planning; Insights supports investigation. The second was to show a range rather than imply that one number could be a verdict. The third was to keep skill and engagement separate, so a teacher could move from a class pattern into the evidence for a student.

The later evaluations are what make this story useful to discuss. Teachers saw value, but half in each small demo-class study had difficulty with the central chart. That means making uncertainty visible was not enough to make it understandable.

My next iteration would lead with an explanation and test whether a teacher can interpret the uncertainty and choose a defensible next action. I’ll show you the two interfaces and where that changes the design.”

### Five-minute version

| Time | Show | Talk through |
|---|---|---|
| 0:00-0:45 | Header and Foresights image | Teacher's before/after questions; exact personal scope and partners. |
| 0:45-1:45 | Prediction/diagnosis section | Why one combined score would conceal the purpose of each moment. Name the tradeoff: a more explicit model asks the reader to understand more. |
| 1:45-2:45 | Insights scatterplot/detail | Keep skill and engagement separate; scan class pattern, inspect student, decide. Demonstration data is not outcome data. |
| 2:45-4:00 | Evaluation table | Ten teachers per study, demo class. Value versus comprehension; anticipated savings are not actual savings. |
| 4:00-5:00 | Next-iteration section | Explain-first hypothesis; ask how the team would evaluate comprehension in the role being discussed. Invite questions. |

### Ten-to-twelve-minute deep dive

1. **0:00-1:00, situation and ownership.** State the teacher decision before the platform. Separate your interface scope from modeling/research ownership.
2. **1:00-3:00, prediction versus diagnosis.** Show the two moments. Explain the rejected simplification of one score and the burden that separation adds.
3. **3:00-5:00, range interpretation.** Point to a range and insufficient-data state. Explain what a teacher may conclude and what remains unknown. Avoid implying the model was validated by the UI study.
4. **5:00-7:00, investigation.** Walk from pattern to student detail to a potential next action. State the concept/assignment evidence dependency. TODO(content): insert the real collaboration episode here when supplied; until then, state scope and constraint without invented dialogue.
5. **7:00-9:00, evaluation.** Attribute CK-12 reports, show the mixed findings, and distinguish demo comprehension from production impact.
6. **9:00-10:00, changed view.** “I would put interpretation before visualization.” Define a task where a teacher explains the signal and chooses an action.
7. **10:00-12:00, optional discussion.** Concept granularity, missing data, communicating uncertainty, and what additional evidence would change your recommendation.

### Questions to prepare

- **What did you own?** Experience architecture, interactions, prototypes, visual language. Do not expand this into model or study ownership.
- **Who changed your view?** TODO(content): identify an actual person/discipline, constraint, recommendation, and resulting choice. The public source does not establish an episode.
- **What shipped?** Use the supplied product interfaces. Feature launch dates and rollout coverage remain unconfirmed.
- **Did it save time?** Teachers anticipated savings; these studies did not measure saved classroom time.
- **What failed?** Interpretation remained difficult for half the participants on the key graph. Do not imply every teacher failed the entire tool.
- **Did you cause a platform change?** Explain the dependency; do not claim sole attribution for concept-per-assignment changes.

## Offboard: 90-second opener

“I built Offboard around a repeated problem in a career transition: the person keeps rebuilding the same context to research a role, tailor materials, prepare outreach, and track what happened. I founded, designed, and implemented the product, using AI development tools as part of that work.

Job Packets is one concrete workflow inside it. It coordinates research and editable application materials around an opportunity. Three decisions matter more than the amount of content it can generate.

First, assess the opportunity before tailoring materials, and pause when the person needs to reconsider. Second, keep authorship with the person: outputs stay editable and nothing sends itself to an employer. Internal filing can still happen automatically. Third, share the role and research context across tasks instead of restarting at each step.

The bigger correction was where this workflow belonged. A packet assumes someone has already chosen a role. A person starting a career transition may need direction first. I moved the product story toward a plan-first journey and a first useful action, with packets later.

I can show the built product and the reasoning behind that change. I’m not presenting a measured conversion lift. The next evaluation is whether the first action matches the person's starting situation and helps them move forward.”

### Five-minute version

| Time | Show | Talk through |
|---|---|---|
| 0:00-0:45 | Dashboard / header | Repeated work and end-to-end scope. Clarify Offboard is a career-transition product. |
| 0:45-1:45 | Opportunity model + risk flow | Why evaluate before writing. Assessment can be wrong; the person chooses whether to proceed. |
| 1:45-2:45 | Draft/review/control flow | Editable materials; missing-resume partial result; automatic filing versus human external representation. |
| 2:45-4:00 | Entry-point correction | A packet is useful only after someone has a role to pursue. Plan-first direction; no measured lift claimed. |
| 4:00-5:00 | Architecture or next test | Choose technical depth for engineering roles; choose readiness/activation questions for design roles. |

### Ten-to-twelve-minute deep dive

1. **0:00-1:00, situation and scope.** Identify the person and repeated task. State founder/design/implementation ownership without turning a solo build into a team-management claim.
2. **1:00-2:30, organizing model.** Explain what belongs to an opportunity and why the context persists. Keep LUMO and Job Packets inside the same product story.
3. **2:30-4:00, evaluation before generation.** Walk the risk gate. Explain its uncertainty and the user's choice. TODO(asset): replace conceptual diagram with a real gate/review sequence when available.
4. **4:00-5:30, control and partial success.** Show what happens when a resume is missing; distinguish useful partial work from fabricated personal content. Explicitly separate filing from sending.
5. **5:30-7:00, reusable context.** Explain why tasks share research and the risk of stale context. Do not assert current agent counts, fixed timing, or cost savings.
6. **7:00-8:30, direction correction.** Packet-first to plan-first. TODO(content): add the dated observation behind the change. Describe what changed without assigning an unmeasured result.
7. **8:30-10:00, built system and evaluation.** Show the architecture only to explain a product consequence. End with first useful action, then repeat use; no adoption/revenue figures without a source.
8. **10:00-12:00, optional discussion.** State recovery, cache freshness, data boundaries, or where AI-assisted development required human verification.

### Questions to prepare

- **Why not automate sending?** The materials represent a person. Their inspection and decision remain outside automatic generation.
- **Does every action require approval?** No. Tracker filing can be automatic. Explain the meaningful boundary.
- **What prompted the correction?** Current source: founder narrative about readiness. TODO(content): supply the actual observation and date rather than improvising a research session.
- **What improved?** Built capability and changed direction are supported. Conversion, retention, revenue, and volume improvements are not established here.
- **How did AI tools contribute?** Say which tools helped with implementation, then describe a concrete verification episode you personally performed. TODO(content): choose an actual example; do not borrow this portfolio's test run as an Offboard incident.
- **Who did you influence?** This is strong execution and product direction evidence. Use a CK-12 example for cross-team influence when available.

## Short supporting stories

**Flexi opener:** “A student can receive an answer and still be stuck. I worked on the interactions around the answer: ways to simplify, ask for an analogy, inspect a source, or take a challenge. I’ll show those controls, then separate what the interface demonstrates from what later classroom research can tell us. I would evaluate whether students can carry the understanding into another task, rather than equating more messages with learning.”

Five-minute path: student tension (45s), follow-up choices (90s), source/recovery view (60s), attributed classroom research (60s), next task-based test (45s). Do not demonstrate unverified teacher controls or call observational research a causal result.

**Neuron opener:** “This is an independent prototype I built for interview preparation, using simulated operational data. There is no live model and I did not interview operators. The question is whether an incoming operator can inherit the reasoning behind a decision, including why someone deferred it and what should trigger another look. I’ll show one record, the asset context, and the resulting decision. Then I’ll explain what a real operator would need to validate.”

Five-minute path: disclosure/problem (45s), inherited item and graph (60s), decision/revisit reason (90s), simplified implementation (45s), untested assumption and next research (60s). Keep the live demo optional in case connectivity fails; use the still and walkthrough as backup.

## Leadership evidence gaps

| Prompt | Current evidence | What is still needed |
|---|---|---|
| Direction under ambiguity | Offboard plan-first correction | Dated observation; alternative and consequence |
| Changed a product decision | Same correction; analytics interpretation | One real team decision with collaborators |
| Created a system others used | Resume's CK-12 2.0 system | Standard/artifact, adoption scope, governance example |
| Improved another senior designer's work | No concrete episode | A real critique/mentoring story and its result |
| Resolved Product/Engineering tension | Broad CK-12 collaboration scope | Constraint, disagreement if real, recommendation, outcome |

## Rehearsal and feedback record

Run the 90-second opener, then a five-minute version, then one deep dive aloud. Record actual duration and where explanation required unsupported detail. Ask a reviewer for a 60-second skim and have them name the problem, role, one decision, and result. Do not prompt them with the desired answers.

| Date / story | Target / actual | Reviewer understood | Question or missing proof | Change |
|---|---|---|---|---|
| Pending Louie rehearsal | Not timed | Not reviewed | See ledger | Pending |

Keep company-specific interview tracking in a private, untracked location. Suggested fields: company/role, hiring lane, stage reached, material shown, exact feedback, inferred explanation, next adjustment. No candidate/recruiter details belong in the runtime evidence index.
