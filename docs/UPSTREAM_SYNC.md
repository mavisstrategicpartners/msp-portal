# Keeping this fork in sync with upstream

| | Repository | Branch |
|---|---|---|
| Upstream (source of truth) | `Ririesphe/msp-portal` (private) | `main` |
| This fork (development + production) | `mavisstrategicpartners/msp-portal` | `main` |

`.github/workflows/sync-upstream.yml` runs every 15 minutes, on demand
(Actions → *Sync from upstream* → *Run workflow*), or instantly when upstream
sends a `repository_dispatch` event of type `upstream-updated`.

Each run:

1. Fetches upstream `main` with `UPSTREAM_REPO_TOKEN`.
2. Does nothing if the fork already contains it.
3. Otherwise fast-forwards (fork has no commits of its own) or creates a merge
   commit (fork has its own commits). Fork commits are never rewritten.
4. Runs `npm ci`, `npm run build` and `npm run test:roles` on the result.
5. Pushes to `main` with a normal push (never `--force`). Vercel deploys that push.
6. Writes a run summary and keeps one issue labelled `upstream-sync` open while
   anything needs a person. The issue closes itself after the next successful run.

On a merge conflict the merge is aborted, nothing is pushed, and the issue lists
the conflicting files with the commands to resolve them locally. Once your
resolution is pushed, the next run sees upstream is contained and closes the issue.

## One-time setup

1. **Read token for the private upstream.** Create a fine-grained personal access
   token on GitHub (Settings → Developer settings → Fine-grained tokens) for an
   account that can read `Ririesphe/msp-portal`. Give it access to *only* that
   repository with **Contents: Read-only**. Then add it to this repository under
   Settings → Secrets and variables → Actions → *New repository secret*, named
   `UPSTREAM_REPO_TOKEN`.
2. **Vercel.** In the `msp-portal-airo` project, go to Settings → Git and connect
   `mavisstrategicpartners/msp-portal`, with production branch `main`. This
   requires the Vercel GitHub app to be installed on the `mavisstrategicpartners`
   account. Environment variables are project settings and are not affected.

Optional overrides (Settings → Variables): `UPSTREAM_REPOSITORY`,
`UPSTREAM_BRANCH`, `TARGET_BRANCH`.

## Optional: instant sync

Polling means a delay of up to about 15 minutes. For an immediate sync, upstream can
notify this fork on every push with a workflow in `Ririesphe/msp-portal`. The
`FORK_DISPATCH_TOKEN` secret it uses needs Actions: write (or Contents: write)
on `mavisstrategicpartners/msp-portal`:

```yaml
name: Notify fork
on: { push: { branches: [main] } }
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -X POST \
            -H "Authorization: Bearer ${{ secrets.FORK_DISPATCH_TOKEN }}" \
            -H "Accept: application/vnd.github+json" \
            https://api.github.com/repos/mavisstrategicpartners/msp-portal/dispatches \
            -d '{"event_type":"upstream-updated"}'
```
