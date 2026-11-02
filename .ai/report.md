## Summary

On a phone, the client list can show one search field instead of the filter sheet. The choice comes from the existing account setting `settings.mobile_search`. Other tables, and the reseller client report, keep the bottom sheet. Desktop filters are unchanged. No backend changes.

## Frontend

- `DataTable` accepts `simpleSearch` (default `false`) and passes it to the toolbar.
- Only `ClientTable` sets it, and only for `variant === "default"` (`/clients`).
- Simple search turns on when the viewport is mobile, `simpleSearch` is true, and the loaded `["staff-account"]` setting has `mode: "simple"`. While that request is loading or if it fails, the bottom sheet stays. The setting is parsed with `MobileSearchSettingSchema`.
- The field is the existing `any` filter (`client.any_search.placeholder`), through `FormFilter` / `useFilterForm`, so the query string and 400ms debounce are the same. Network, zone, and status are not shown.
- It sits full width under the toolbar row and above the table. With `always_open` off, the filter button shows and hides it and does not clear `any`. With `always_open` on, the field stays visible and that button is disabled.
- The filter button’s accessible name uses the existing `common.filter` label. No new translation keys.

## Checks

- `npx vitest run tests/unit/data-table/mobile-simple-search.test.tsx tests/unit/clients/reseller-client-table.test.tsx` passed (9 tests).
- `scripts/ai/typecheck` passed.

## Browser

Signed in at `http://vp.isp.test` as vp. On a 390px-wide clients page the search field was hidden until Filter was tapped, then it sat full width above the table. Typing Farhana left only vp0006. Closing the field kept that result and the text. Clearing the field restored all 7 clients. Desktop still opens search plus network, zone, and status. Payments on the phone still opens the Filter sheet with Apply Filter.

## Security

The toolbar reads `staff-account` with the existing session query. It does not send `company_id` or `reseller_id`.
