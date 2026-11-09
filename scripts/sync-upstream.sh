#!/usr/bin/env bash
# Merge the original repository's main branch into this fork's main branch.
#
# Safe by design:
#   - never force-pushes, never rebases, never resets or discards commits;
#   - fork commits are kept: upstream is merged in (fast-forward when the fork
#     has nothing of its own, otherwise a normal merge commit);
#   - on conflict the merge is aborted, the working tree is left clean and the
#     conflicting files are reported instead.
#
# This script only prepares the merge locally. Pushing is a separate step so
# the workflow can build the result first.
#
# Environment:
#   UPSTREAM_URL     clone URL of the original repository (may embed a token)
#   UPSTREAM_BRANCH  branch to follow upstream            (default: main)
#   TARGET_BRANCH    branch in this fork to keep updated  (default: main)
#   GITHUB_OUTPUT    optional; results are appended here for GitHub Actions
#
# Exit codes: 0 = up to date or merged, 2 = conflict, 1 = other failure.
set -euo pipefail

UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
TARGET_BRANCH="${TARGET_BRANCH:-main}"
OUT="${GITHUB_OUTPUT:-/dev/null}"

out() { echo "$1=$2" >> "$OUT"; echo "  $1: $2"; }

if [ -z "${UPSTREAM_URL:-}" ]; then
  echo "UPSTREAM_URL is not set." >&2
  out status error
  exit 1
fi

git config user.name  >/dev/null 2>&1 || git config user.name  "msp-upstream-sync[bot]"
git config user.email >/dev/null 2>&1 || git config user.email "msp-upstream-sync@users.noreply.github.com"

git checkout -q "$TARGET_BRANCH"

if git remote get-url upstream >/dev/null 2>&1; then
  git remote set-url upstream "$UPSTREAM_URL"
else
  git remote add upstream "$UPSTREAM_URL"
fi

if ! git fetch --quiet upstream "$UPSTREAM_BRANCH"; then
  echo "Could not fetch upstream $UPSTREAM_BRANCH. Check UPSTREAM_REPO_TOKEN has read access." >&2
  out status fetch-failed
  exit 1
fi

UPSTREAM_SHA="$(git rev-parse "upstream/$UPSTREAM_BRANCH")"
BEFORE_SHA="$(git rev-parse HEAD)"
out upstream_sha "$UPSTREAM_SHA"
out before_sha "$BEFORE_SHA"

if git merge-base --is-ancestor "$UPSTREAM_SHA" HEAD; then
  echo "Fork already contains upstream $UPSTREAM_BRANCH (${UPSTREAM_SHA:0:7})."
  out status up-to-date
  exit 0
fi

NEW_COMMITS="$(git rev-list --count "HEAD..$UPSTREAM_SHA")"
out new_upstream_commits "$NEW_COMMITS"

if git merge-base --is-ancestor HEAD "$UPSTREAM_SHA"; then
  git merge --ff-only --quiet "$UPSTREAM_SHA"
  echo "Fast-forwarded $TARGET_BRANCH by $NEW_COMMITS upstream commit(s)."
  out status fast-forwarded
  out after_sha "$(git rev-parse HEAD)"
  exit 0
fi

if git merge --no-ff --no-edit \
     -m "Merge upstream ${UPSTREAM_BRANCH} (${UPSTREAM_SHA:0:7}) into ${TARGET_BRANCH}" \
     "$UPSTREAM_SHA" >/tmp/sync-merge.log 2>&1; then
  echo "Merged $NEW_COMMITS upstream commit(s); fork commits preserved."
  out status merged
  out after_sha "$(git rev-parse HEAD)"
  exit 0
fi

CONFLICTS="$(git diff --name-only --diff-filter=U | sort -u)"
git merge --abort || true
echo "Merge conflict with upstream. Nothing was changed. Conflicting files:"
echo "$CONFLICTS" | sed 's/^/  - /'
{
  echo "status=conflict"
  echo "conflicts<<EOF_CONFLICTS"
  echo "$CONFLICTS"
  echo "EOF_CONFLICTS"
} >> "$OUT"
exit 2
