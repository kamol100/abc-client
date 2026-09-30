# Migration workflow

Use this for Next.js upgrades, dependency upgrades, i18n moves, and screen ports. API and database migrations belong in `isp-backend/.ai/workflows/migration.md`.

1. Read the current page, feature components, and both language files. Search the repo for the old import path, route, and translation key.
2. List what must keep working: URLs, query keys, permission strings, form payloads.
3. Change one surface at a time. After each surface, run `scripts/ai/typecheck`.
4. Keep `en.json` and `bn.json` in the same shape.
5. Do not upgrade Next, React, or ESLint unless the task is that upgrade. `npm install` needs human approval.
6. When the payload to the API changes, confirm the Laravel FormRequest still accepts it. Do not silently rename JSON fields.
7. Finish with `scripts/ai/frontend-check` and `scripts/ai/diff`.
