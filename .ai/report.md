## Summary

The Reseller Settings dialog now sends the selected reseller UUID with the existing company settings request, and loads that reseller's own value for the termination-date switch.

## Files changed

- `components/resellers/reseller-settings-dialog.tsx`
- `tests/unit/resellers/reseller-settings.test.tsx`

## Request

`POST /company/settings`

```json
{
  "reseller_uuid": "<reseller uuid>",
  "settings": {
    "auto_inactive_reseller_client_termination_date": 1
  }
}
```

Opening the dialog loads `GET /company/settings?reseller_uuid=<uuid>`. The switch is not written into the shared company settings state.

## Tests

`npx vitest run tests/unit/resellers/reseller-settings.test.tsx`: 3 tests passed. `scripts/ai/typecheck` passed earlier in this change. ESLint was not run.
