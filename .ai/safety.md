# Safety and permissions

## Automatically allowed

- Read and search this repository.
- `scripts/ai/status`, `scripts/ai/diff`.
- `scripts/ai/typecheck`, `scripts/ai/test`.
- `scripts/ai/check` and `scripts/ai/frontend-check` (typecheck, then unit tests).
- `scripts/ai/lint` (ESLint). It currently fails for a pre-existing config error. Do not "fix" that during another task.

## Human approval required

- `npm install`, adding or upgrading a dependency.
- Changing production environment variables or deploy config.
- `git push`, opening a PR.
- Running Playwright against a shared environment, or starting a dev server pointed at production API credentials.

## Never

- `git reset --hard`, `git clean -fd`, `git push --force`.
- Editing `components/ui/*` to finish a feature. Those are shadcn primitives.
- Installing a second component or CSS framework.
- Hard-coding colors or skipping `en.json` / `bn.json` for new copy.
- Sending `company_id` (or another tenant key) from the browser to read a different company.
- Running Artisan, SQL, or Pest from this repo. Backend commands stay in `isp-backend/scripts/ai/`.

## Git

Start with `scripts/ai/status`. If the tree is already dirty, do not revert those files and do not include them in the task. Finish with `scripts/ai/diff`. Commit only when the user asks.
