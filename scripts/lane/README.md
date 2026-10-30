# The Mac lane: CI checks without GitHub Actions

Added 2026-10-30, ported from the transfersight repo. GitHub Actions is off for the whole GitHub account (billing lock; runs end with "The job was not started because your account is locked due to a billing issue"). The same lane runs in the transfersight and lumo-plan-builder repos.

`scripts/lane/check.sh` runs the steps of `.github/workflows/ci.yml` on Louie's Mac, in the same order, and fails closed:

1. `install`: `pnpm install --frozen-lockfile` when the lock file is newer than `node_modules`.
2. `typecheck`, `lint`, `test`, `build`: the "Typecheck, lint, unit tests, build" job.
3. `e2e`: `pnpm test:e2e`, the "Playwright" job. It runs both projects, desktop Chromium and mobile WebKit, against a fresh production build on port 3100.
4. `secret-scan`: gitleaks over the commits the branch adds to `origin/main`.

## How to run it

On the PR's branch, in its worktree, with everything committed:

```
pnpm lane:check
```

It writes a report and logs to `~/.louie-portfolio-lane/<time>-<commit>/`, posts a `mac-lane/check` commit status (the green or red mark on the PR), and posts the report as a PR comment. `bash scripts/lane/check.sh --no-post` runs without posting.

## Rules

- A red lane is a red CI run: no merge.
- Merge only when the PR's latest commit has a green `mac-lane/check`. A new commit needs a new run.
- Deploys are unchanged: Vercel builds every push and deploys `main`.
- Secrets never pass through the lane. It needs none.

## When Actions comes back

Stop using the lane. The workflow file stays as it is, so CI resumes on the next push.

## What the Mac needs

Node (see `.nvmrc`), pnpm, Playwright's Chromium and WebKit (`pnpm exec playwright install chromium webkit`), `gitleaks` (`brew install gitleaks`), and `gh` signed in.
