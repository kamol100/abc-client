## Summary

Client row actions now include Add Map for users with `clients.map.add`. The dialog reads the browser's high-accuracy location, shows a marker, and saves only those coordinates.

## Frontend

- The menu item sits immediately after Client Lock and uses `MapPin`.
- It is shown only when `hasPermission("clients.map.add")` is true.
- Opening the dialog calls `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`, `maximumAge: 0`, and a 15 second timeout. A denied, unavailable, timed-out, insecure, or unsupported lookup shows the existing location error text and does not fill coordinates.
- After a fix, the dialog shows the Leaflet marker already used by the client maps, plus latitude and longitude. Save stays disabled until that fix exists.
- Save posts to `POST /clients/{id}/add-client-map` through `useApiMutation` (`addClientMapUrl`). Success closes the dialog, toasts, and refreshes `clients`, `reseller-clients`, and `client-maps`. Failure leaves the dialog open and toasts the API error.
- Cancel closes the dialog and does not call the API.
- Client Lock is unchanged. `getCurrentGeolocation` still falls back to a low-accuracy fix for the client form. Add Map does not use that fallback.
- English and Bangla strings were added under `client.actions.add_map` and `client.map`.

## Checks

- `npx vitest run tests/unit/lib/high-accuracy-geolocation.test.ts tests/unit/clients/client-add-map-dialog.test.tsx` passed (6 tests).
- `scripts/ai/typecheck` passed.
- `public/lang/en.json` and `public/lang/bn.json` both parse.

## Browser

`http://vp.isp.test/clients` redirects to `/admin` when there is no session. The Add Map click, GPS prompt, preview, and save were not exercised in a signed-in browser. The dialog behavior is covered by the unit tests above.

## Unrelated

The working tree was clean before this change. No unrelated files were left modified.
