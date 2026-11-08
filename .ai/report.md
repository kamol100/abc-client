## Summary

Saving plan features now asks for confirmation when the save removes a feature. The warning shows how many companies, staff, and resellers lose it, and that adding it back later restores only the company Admin role.

## Frontend

- The save button in `plan-feature-matrix.tsx` calls `POST /subscription-plans/{id}/features/impact` first.
- No removed features: the existing PUT runs immediately.
- One or more removed features: a warning dialog lists each feature with its company, staff, and reseller counts, plus the restore note. Confirm runs the same PUT. Cancel leaves the selection as it is and does not save.
- A failed impact request shows an error and does not save.
- Copy is in `public/lang/en.json` and `public/lang/bn.json`.

## Checks

- Typecheck: `scripts/ai/typecheck` passed.
- Vitest: `tests/unit/subscription/plan-feature-matrix.test.tsx` — 6 passed.
- Browser on `http://app.isp.test/subscription-plans`: unchecking Clients and choosing Save opened “Remove features from this plan?” with “Clients: 2 companies will lose this feature. 2 staff and 0 resellers who have it now will lose it.” Cancel closed the warning. Clients was checked again and the dialog was closed. Nothing was saved.

## Security

The screen still only explains the API result. No `company_id` is sent.
