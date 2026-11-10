## Summary

Communication log statuses now render as soft badges with an icon for each outcome.

## Frontend

- Sent uses the success badge (check).
- Failed uses the error badge (alert).
- Test uses the info badge with a flask icon.
- Any other value uses the pending badge and the unknown label.

## Checks

- The status cell file has no linter errors.
- The logs page redirects to login, so the badge was not seen in a signed-in table.

## Notes

- Existing status labels in English and Bangla were reused.
