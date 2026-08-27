#!/bin/bash
#
# SessionStart hook — prepares a Claude Code on the web container to actually
# run this repo's checks.
#
# Without it a fresh remote session starts with no `node_modules` (so
# `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` all fail) and
# with a Playwright that cannot find a browser (so the e2e suite — the
# repo's main quality gate — cannot run at all).
#
# Local machines are left alone: they have their own setup.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

echo "SessionStart: installing dependencies…"
pnpm install --prefer-offline

# --- Playwright browsers ---------------------------------------------------
#
# The container ships its own Chromium under PLAYWRIGHT_BROWSERS_PATH, but at
# whatever revision the image was built with — not necessarily the one this
# repo's @playwright/test pins. Playwright addresses browsers by exact
# revision, so a mismatch reads as "Executable doesn't exist" and every e2e
# test fails at launch.
#
# Downloading the right revision is not an option here: the egress policy
# blocks cdn.playwright.dev and playwright.download.prss.microsoft.com
# (403, "no rule or allowlist entry allows host"). So point the revision the
# repo expects at the one the image actually has.
#
# This is a workaround for the sandbox, not a preference. If the environment
# ever ships matching revisions — or the policy allows the CDN — every branch
# below no-ops, because the expected directories will already exist.
BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"

installed_revision_of() {
  # Newest installed revision for a browser family, e.g. chromium -> 1194.
  find "$BROWSERS_PATH" -maxdepth 1 -type d -name "$1-*" 2>/dev/null |
    sort -V | tail -1
}

echo "SessionStart: reconciling Playwright browser revisions…"
expected_dirs=$(pnpm exec playwright install --dry-run 2>/dev/null |
  awk '/Install location:/ { print $3 }' || true)

for expected in $expected_dirs; do
  name=$(basename "$expected")
  family=${name%-*}

  # Already present, or a browser this repo does not use — nothing to do.
  [ -e "$expected" ] && continue

  have=$(installed_revision_of "$family")
  if [ -z "$have" ]; then
    # firefox and webkit are simply absent from the image and cannot be
    # fetched. Say so once rather than failing: the desktop suite still runs,
    # and `playwright test --project=<webkit project>` will report it itself.
    echo "  $family: not in this image and not downloadable — skipping"
    continue
  fi

  if [ "$family" = "chromium_headless_shell" ]; then
    # The headless shell moved house between revisions: older images keep the
    # binary at chrome-linux/headless_shell, newer Playwright looks for
    # chrome-headless-shell-linux64/chrome-headless-shell. Link the contents,
    # renaming just the executable.
    target="$expected/chrome-headless-shell-linux64"
    mkdir -p "$target"
    for f in "$have"/chrome-linux/*; do
      ln -sfn "$f" "$target/$(basename "$f")"
    done
    ln -sfn "$have/chrome-linux/headless_shell" "$target/chrome-headless-shell"
    touch "$expected/INSTALLATION_COMPLETE" "$expected/DEPENDENCIES_VALIDATED"
  else
    ln -sfn "$have" "$expected"
  fi

  echo "  $name -> $(basename "$have")"
done

echo "SessionStart: ready."
