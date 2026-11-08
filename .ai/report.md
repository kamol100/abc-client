## Summary

Company subscription rows open the plan feature inspector in read-only mode. Feature membership, expiry rules, and route permissions cannot be changed from that dialog.

## Frontend

- `PlanFeatureMatrix` accepts `readOnly`. Checkboxes and the expiry rule are disabled, and Save, add, move, and remove are hidden even when the user can edit the feature catalog.
- Each company subscription action row shows that inspector for its plan.

## Backend

- The company subscription list loads `plan.features` and returns each feature id, key, name, and expired mode so the inspector matches the assigned plan.

## Checks

- `npx vitest run tests/unit/subscription/plan-feature-matrix.test.tsx`: 9 passed.
- `scripts/ai/backend-test tests/Feature/CompanySubscriptionControllerTest.php --filter="lists company subscription"`: 2 passed.
- Pint and PHPStan on the changed PHP files: passed.
- Browser: `http://app.isp.test/company-subscriptions`. Plan features opens with the assigned features checked and disabled. The dialog has no Save, add, move, or remove actions.
