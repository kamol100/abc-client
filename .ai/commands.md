# Commands

Scripts in `scripts/ai/` `cd` to this repo. They use the scripts already in `package.json` plus `tsc`.

| Script | Runs | Mutates? |
|---|---|---|
| `status` | `git status` | No |
| `diff` | unstaged and staged diffs | No |
| `typecheck` | `node_modules/.bin/tsc --noEmit` | No |
| `test` | `npm test` (`vitest run`) | No |
| `check`, `frontend-check` | typecheck, then unit tests | No |
| `lint` | `node_modules/.bin/eslint` | No |

`npm run lint` runs `next lint`. Next 16 has no `lint` command, so that script does not lint. `eslint.config.mjs` loads `next/core-web-vitals` through `FlatCompat` and ESLint 9 exits with `Converting circular structure to JSON`. `scripts/ai/lint` runs ESLint and prints that context. It is not part of `frontend-check`. Do not rewrite the ESLint config unless the task is to fix lint.

Playwright is `npm run test:e2e`. It is not part of `check`. Run it only when the task changes a flow that already has an e2e spec, and only with local credentials.

```bash
scripts/ai/status
scripts/ai/test
scripts/ai/frontend-check
```

`check` does not talk to the Laravel database. Backend tests are `isp-backend/scripts/ai/backend-test`.
