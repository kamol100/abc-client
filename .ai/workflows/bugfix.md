# Bug-fix workflow

```text
Reproduce → Find root cause → Add regression test → Fix → Run that test → Run related checks → Review diff
```

1. Reproduce in the UI or with a failing Vitest. If the bug is a wrong API payload, confirm it in `isp-backend` before changing the client to compensate.
2. State the cause (stale query key, wrong envelope path, missing permission, translation key, theme token). Do not keep editing until the symptom disappears.
3. Add a unit test when the logic is a function or a component that already has a test harness. A one-line copy fix does not need a new framework.
4. Run `scripts/ai/test` for that file, then `scripts/ai/typecheck` and `scripts/ai/lint` when types or JSX changed.
5. Review `scripts/ai/diff`. Leave unrelated dirty files alone.
6. Report the cause and the commands you ran.
