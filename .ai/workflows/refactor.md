# Refactor workflow

Visible behavior, routes, query keys, and permission strings stay the same unless the task says otherwise.

1. Find every caller of the component or hook you want to move.
2. Run `scripts/ai/typecheck` and `scripts/ai/test` before the move when those commands already pass on your branch.
3. Do not split a feature into a file per small component. Keep the feature folder pattern in `.ai/architecture.md`.
4. Do not edit `components/ui/*` as a drive-by cleanup.
5. No new UI library, form library, or data client.
6. Run `scripts/ai/frontend-check` after the move.
7. Read the full `scripts/ai/diff` and drop unrelated formatting.
