# Plan 009: Add voice mode to AI Louie (post-launch)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: Confirm the production site is live and stable
> (Plan 008 done) and the text-mode e2e suite is green. Spec §35 Phase 8:
> "Only begin when Phases 1 through 7 are stable." On mismatch, STOP.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: HIGH (realtime audio, browser permissions, new provider surface)
- **Depends on**: plans/008-experiments-polish-launch.md
- **Category**: direction (Phase 8 of the spec's build sequence; explicitly post-launch, spec §36)
- **Planned at**: post-008, 2026-08-21

## Why this matters

Voice is the spec's Phase 2 differentiator (§23): a recruiter speaks a
question, hears a grounded answer, and watches the portfolio surface evidence
simultaneously. It must reuse the exact tool layer text mode uses — same
allowlists, same evidence grounding — so voice inherits all the integrity
guarantees already tested.

## Current state

- Live production portfolio with text-mode AI Louie: `lib/ai/provider.ts`
  adapter, tool registry in `lib/ai/tools.ts` (allowlist-validated), evidence
  index, `voice-trigger.tsx` does not exist yet (named in spec §4),
  `voice_started` / `voice_question_completed` analytics events are no-op
  stubs (Plan 008).
- **Read spec §23 (voice phase, full requirements list), §16 (personality
  applies to speech), §26 (transcript + a11y), §30 (voice events) before
  starting.**
- Provider: the OpenAI Realtime API (WebRTC) is the default candidate since
  the stack already uses OpenAI — but this plan requires an up-front spike
  (Step 1) because realtime APIs change quickly; verify the current
  recommended browser transport + ephemeral-token flow in the provider docs
  at implementation time. assistant-ui may also ship a voice integration by
  then — prefer it if it exists and supports tool calls.
- Hard requirements from spec §23: explicit start/stop affordance; visible
  listening + speaking states; interruption support if the transport allows;
  captions/transcript always visible; keyboard equivalent; NEVER auto-start
  the microphone; permission requested only after explicit user action.

## Commands you will need

| Purpose    | Command          | Expected on success |
|------------|------------------|---------------------|
| All gates  | `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e` | all pass (keyless) |
| Dev        | `pnpm dev`       | localhost:3000 (voice needs HTTPS or localhost for mic) |

## Scope

**In scope**:
- `components/ai/voice-trigger.tsx`, voice session UI (listening/speaking
  states, transcript pane)
- Server route for ephemeral realtime session tokens (e.g.
  `app/api/voice-session/route.ts`) — the long-lived API key never reaches
  the client
- Wiring the EXISTING tools into the realtime session
- Activating the two voice analytics events
- Mobile testing pass

**Out of scope** (do NOT touch):
- Tool definitions/allowlists themselves (consume, don't fork — if voice
  needs a tool change, STOP and report)
- Text-mode thread internals beyond mounting the trigger
- Any always-listening / wake-word behavior (spec §23 forbids auto-start)

## Git workflow

- Branch `advisor/009-voice`; this ships as a reviewed PR against the live
  site — preview deploy testing is mandatory before merge.

## Steps

### Step 1: Transport spike (timeboxed)

Build a throwaway page (`app/voice-spike/page.tsx`, never committed to main —
or committed behind `NODE_ENV` gate) proving: ephemeral token minted
server-side → browser connects to the realtime provider → audio in/out works
→ ONE tool call (`search_portfolio`) round-trips. Record findings (transport,
package versions, quirks) in the PR description. Decision gate: if tool
calling is not supported over the chosen transport, STOP.

**Verify**: spike demo works on localhost; API key absent from all client
code (`grep -rn "OPENAI_API_KEY" components app --include='*.tsx'` → only
server files).

### Step 2: Session token route

`app/api/voice-session/route.ts`: POST mints a short-lived ephemeral
client token via the provider adapter; same rate limiter as chat; same
system prompt (spec §20 rules apply verbatim to speech) plus a brevity
addendum for spoken answers. 503 with spec §31 copy path when unconfigured.

**Verify**: unit test: keyless env → 503; rate limit applies. Curl returns a
token-shaped JSON (manual, with key).

### Step 3: Voice trigger + session UI

`voice-trigger.tsx`: explicit press-to-start button in the composer area
(keyboard-activatable, labeled "Start voice conversation"); mic permission
requested only on that press. Session UI states — idle / requesting-mic /
listening / thinking / speaking — each visually distinct (StatusDot + label,
not color alone) with a stop button always visible. Interruption: user speech
or stop press cancels playback if the transport supports it. Live transcript
of both sides renders into the SAME thread surface text mode uses (spec §23:
captions always visible; spec §26: transcript for voice interactions).

**Verify**: manual: full spoken exchange with visible state transitions;
denying mic permission shows a graceful message with text-mode fallback;
`pnpm test:e2e` still green (voice untested in CI beyond render/ARIA checks
of the trigger — add those).

### Step 4: Tool parity

Register the existing client tools (`navigate_portfolio`, `show_evidence`,
`set_context_panel`) and server `search_portfolio` on the realtime session.
The spec §23 example flow must work: ask about agent workflows aloud →
spoken answer + Offboard evidence card surfaces + "Open this section"
affordance. Same allowlist validation code paths — no duplicated validators.

**Verify**: manual script of 5 spoken questions (reuse Plan 006 smoke list);
each substantive answer surfaces evidence visually; navigation highlights
sections while audio continues.

### Step 5: Mobile + a11y pass, analytics, launch

Test iOS Safari + Android Chrome (spec §23 "mobile testing"): autoplay
policies, backgrounding, speaker routing. Activate `voice_started` /
`voice_question_completed` events (no transcript text attached — spec §30).
Preview deploy → operator approval → merge/prod.

**Verify**: all gates green; events visible in Vercel Analytics on preview;
operator sign-off recorded in PR.

## Test plan

- Unit: token route (keyless 503, rate limit), trigger ARIA states.
- E2E (CI, no audio): trigger renders, is keyboard-focusable, has correct
  labels; transcript region has `aria-live="polite"`.
- Manual matrix (documented in PR): Chrome/Safari/Firefox desktop; iOS
  Safari; Android Chrome — grant, deny, and revoke-mid-session mic cases.

## Done criteria

- [ ] Voice runs entirely on ephemeral tokens; long-lived key server-only
- [ ] All spec §23 requirements: start/stop, visible states, transcript,
      keyboard path, no auto-start mic
- [ ] Voice uses the identical tool/allowlist code as text mode (no forked validators — verified by review)
- [ ] Spec §23 example flow works end-to-end
- [ ] Mobile matrix documented with results
- [ ] Both voice analytics events live, no transcript text logged
- [ ] All gates green; operator approved the preview deploy
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The Step 1 spike shows tool calling unsupported/unstable on the current
  realtime transport (report alternatives: text-tool hybrid, different
  provider — operator decision, spec §3 keeps providers swappable).
- Voice would need its own copy of tool validation logic.
- Realtime usage pricing is materially different from what the operator
  expects (surface the numbers before shipping a public endpoint).
- Mic/permission handling requires any dark pattern (auto-prompting on page
  load, etc.) to feel smooth — the spec forbids it; keep the explicit press.

## Maintenance notes

- Realtime APIs move fast: pin package versions and note the API date/version
  in README. Expect this integration to need maintenance within months.
- The public voice endpoint is the most abuse-prone surface on the site —
  watch rate-limit metrics after launch; tighten if abused.
- If assistant-ui later ships first-class realtime voice, migrating to it
  should delete most custom session code — leave a README breadcrumb.
