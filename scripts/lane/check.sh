#!/usr/bin/env bash
# The Mac lane: runs the CI checks of .github/workflows/ci.yml on this Mac, then posts the result
# on GitHub as a `mac-lane/check` commit status and a report comment on the PR.
# Used while GitHub Actions is off for the account (see scripts/lane/README.md).
# Ported from the transfersight repo's lane.
#
# Usage (from any worktree, on the PR's branch, with everything committed):
#   pnpm lane:check                       # run, post status + PR comment
#   bash scripts/lane/check.sh --no-post  # run only; print the report
# Exit code 0 = green. Any red step = exit 1 and a failure status.
set -uo pipefail

POST=1
for arg in "$@"; do
  case "$arg" in
    --no-post) POST=0 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

ROOT="$(git rev-parse --show-toplevel)" || { echo "not in a git checkout" >&2; exit 2; }
cd "$ROOT"

if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes. Commit or stash them first: the lane checks the commit, not the files." >&2
  git status --short >&2
  exit 2
fi

SHA="$(git rev-parse HEAD)"
SHORT="$(git rev-parse --short HEAD)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)" || REPO=""
PR=""
if [ -n "$REPO" ]; then
  PR="$(gh pr view "$BRANCH" --json number -q .number 2>/dev/null)" || PR=""
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$HOME/.louie-portfolio-lane/$STAMP-$SHORT"
mkdir -p "$OUT/logs"
REPORT="$OUT/report.md"

git fetch -q origin main 2>/dev/null || true
BASE="$(git merge-base HEAD origin/main 2>/dev/null || echo "")"

ROWS=""
FAILED=0
STARTED_AT=$(date +%s)

# step <name> <command...>: runs the command, logs output, records a report row.
step() {
  local name="$1"; shift
  local log="$OUT/logs/$name.log"
  local t0 t1 status
  t0=$(date +%s)
  echo "-> $name"
  if ( "$@" ) >"$log" 2>&1; then status="green"; else status="RED"; FAILED=1; fi
  t1=$(date +%s)
  ROWS="$ROWS| $name | $status | $((t1 - t0)) s |"$'\n'
  if [ "$status" = "RED" ]; then
    echo "   RED. Last lines of $log:"
    tail -15 "$log" | sed 's/^/   /'
  fi
}

# ---- job: checks (ci.yml "Typecheck, lint, unit tests, build") ----
install() {
  if [ ! -d node_modules ] || [ pnpm-lock.yaml -nt node_modules ]; then
    pnpm install --frozen-lockfile
  else
    echo "node_modules is newer than pnpm-lock.yaml: install skipped"
  fi
}
step install install
step typecheck pnpm typecheck
step lint pnpm lint
step test pnpm test
step build pnpm build

# ---- job: e2e (ci.yml "Playwright"): desktop Chromium and mobile WebKit ----
step e2e pnpm test:e2e

# ---- secret scan over the commits this branch adds ----
secret_scan() {
  local range
  if [ -n "$BASE" ] && [ "$BASE" != "$SHA" ]; then range="$BASE..$SHA"; else range="-1"; fi
  echo "range: $range"
  if command -v gitleaks >/dev/null 2>&1; then
    gitleaks git --no-banner --redact --log-opts="$range" .
  else
    echo "gitleaks not installed: brew install gitleaks" >&2
    return 1
  fi
}
step secret-scan secret_scan

# The build and the typecheck can leave generated files behind; the lane must not dirty the tree.
git checkout -q -- . 2>/dev/null || true

ELAPSED=$(( $(date +%s) - STARTED_AT ))

if [ "$FAILED" -eq 0 ]; then STATE="success"; VERDICT="GREEN"; else STATE="failure"; VERDICT="RED"; fi

{
  echo "## Mac lane check: $VERDICT"
  echo
  echo "Commit \`$SHORT\` on \`$BRANCH\`, run $(date -u '+%Y-%m-%d %H:%M UTC') on Louie's Mac in ${ELAPSED} s."
  echo "Same steps as \`.github/workflows/ci.yml\` (GitHub Actions is off for the account). Logs: \`$OUT/logs\`."
  echo
  echo "| Step | Result | Time |"
  echo "| --- | --- | --- |"
  printf "%s" "$ROWS"
} >"$REPORT"

cat "$REPORT"

if [ "$POST" -eq 1 ] && [ -n "$REPO" ]; then
  gh api "repos/$REPO/statuses/$SHA" \
    -f state="$STATE" -f context="mac-lane/check" \
    -f description="Mac lane $VERDICT in ${ELAPSED}s" >/dev/null \
    && echo "Posted mac-lane/check = $STATE on $SHORT."
  if [ -n "$PR" ]; then
    gh pr comment "$PR" --body-file "$REPORT" >/dev/null && echo "Posted the report on PR #$PR."
  fi
fi

[ "$FAILED" -eq 0 ]
