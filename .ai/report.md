## Summary

The staff form can assign and clear zones. The API stores them on the staff member and returns them for the edit form.

## Frontend

- Basic information section in `components/staffs/staff-form-schema.ts` has a multi-select `zone_ids`, loaded from `/dropdown-zones`, mapped from `zones`.
- `components/staffs/staff-type.ts` accepts `zones` on the staff row and `zone_ids` on the form. An empty selection submits `[]`.
- `staff.zones.label` and `staff.zones.placeholder` are in `public/lang/en.json` and `public/lang/bn.json`.
- The staff form component is unchanged. It already renders that schema.

## Checks

- `npx vitest run tests/unit/staffs/staff-form-schema.test.ts` passed (3 tests).

## Unrelated working tree

Left in place: untracked `app/api/favicon/`, `lib/favicon/`, and `tests/unit/favicon/`. The branch was already one commit ahead of `origin/master`.
