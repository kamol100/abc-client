## Reseller settings: "Client Auto Inactive Time" dropdown — 2026-11-27

Branch `feat/reseller-auto-inactive-time` (from `master`), committed there, not merged. Backend part: `isp-backend/.ai/report.md`, same date.

- `components/resellers/reseller-settings-dialog.tsx`: a second row with the hour dropdown (00–23), under the termination-date switch. It reuses the settings page's `SettingControl` and option list, saves on change through `POST /company/settings` with `reseller_uuid` and `auto_inactive_client_time`, and shows 12 when nothing is saved.
- The dropdown is always rendered, so the dialog keeps its height; it is disabled while the termination-date switch is off, because the hour only applies then.
- No new translation keys: it uses the existing `settings.fields.auto_inactive_client_time.*` in `en.json` and `bn.json`.
- Tests: 2 new in `tests/unit/resellers/reseller-settings.test.tsx`.

Checks: `scripts/ai/typecheck` passed. `tests/unit/resellers` and `tests/unit/settings`: 163 passed, 1 failed (`invoice-print-settings.test.tsx`, amount in words; not touched by this change). Browser (Chromium, tenant `cp`, 1440 px and 390 px): the dialog opens with both rows, no horizontal scroll, and the same size before and after the settings load. Not checked in the browser: choosing an hour, because both local resellers have the switch off and turning it on would let the local scheduler deactivate their clients.
## Invoice print: the receipt is about the newest payment — 2026-11-28

Branch `fix/invoice-print-last-payment` (from `master`), committed there, not merged. Backend part: `isp-backend/.ai/report.md`, same branch name.

- `components/invoices/invoice-receipt.tsx`: an invoice with several part payments printed the whole bill and everything paid so far (bill 900, paid 400, due 500). It now prints what was to pay before the newest payment, that payment, and what is left: bill 700, paid 200, due 500. After one more payment of 300: bill 500, paid 300, due 200.
  - Basic: Total Bill, Paid & Discount, Total Due as above. The discount counts with the first payment only.
  - Advanced: the items and Sub Total stay the full bill; a "Previous Paid" row shows what was paid before (only when there is any); Total is the bill less that; Paid is the newest payment.
  - Amount in words, both modes: always the "paid and discount" figure. Before it was the total bill (basic) or the total (advanced).
  - A bill that used the client's advance: with no cash payment yet it prints as before (full bill, advance as paid); once cash is paid the advance counts as a previous payment.
- Needs `last_payment_amount` from the API (backend branch). Without it, everything paid counts as one payment.
- `InvoiceRowSchema.last_payment_amount`; translation `invoice.receipt.previous_paid` in `en.json` and `bn.json`.
- Tests: new `tests/unit/invoices/invoice-receipt-last-payment.test.tsx` (8). `invoice-receipt.test.tsx`: the amount-in-words expectations follow the new rule ("Five Hundred Fifty" = paid 500 + discount 50, was the bill or total).
- Not changed: the on-screen invoice view still shows the whole bill and everything paid.

Checks: `tsc --noEmit` passed; `tests/unit/invoices`: 95 passed. Full suite not rerun. Not checked in a browser or on a printer. Worked in a separate git worktree because the main checkout had other uncommitted work.
## Income statement checks, reseller wallet income, small UI fixes — 2026-11-27

Branch `fix/income-integrity`. Uncommitted. Backend part: `isp-backend/.ai/report.md`, same date ("Income flow review fixes").

- Income statement: two new warning lines, for an expense or salary taken from the fund more than once and for one approved but never taken (`checks.expense_duplicates`, `checks.expense_without_debit`). A reseller sees a note with the amount of client bills settled from its wallet (`settled_from_reseller_wallet`). The "matches" line now says it covers expenses too. An API without the new fields still parses.
- Payments list: the wallet label also shows for `source = reseller_wallet`.
- Settings → General → Books: "Not set" stays on one line (it wrapped one letter per line next to the long description). The description says the latest day that can be closed is yesterday.
- Pay dialog: an empty fund shows "Payment method is required" instead of "Expected number, received nan".
- Translations in `en.json` and `bn.json`: `income_expense.checks.{ok,expense_duplicates,expense_without_debit,settled_from_reseller_wallet}`, `settings.fields.books_closed_until.description`.
- Tests: 3 new in `tests/unit/reports/income-statement.test.tsx`.

Checks: `scripts/ai/frontend-check`: typecheck passed; unit 1,500 passed, 13 failed in 8 files, the same count as before this change (none in a file this change touches). Browser (Chromium, tenant `cp`, 1440 px and 390 px): statement page renders with no horizontal scroll, the Books row shows "Not set" on one line, the pay dialog shows the fund message. Not checked in the browser: the two new warning lines with real data, a reseller login, Bengali, dark theme.

## Income statement page and "books closed until" setting — 2026-11-27

Branch `master`. Uncommitted. Backend part (needed first): `isp-backend/.ai/report.md`, same date, branch `fix/income-integrity`.

- `/reports/income-expense` now reads one endpoint, `reports/income-statement` (cash basis), instead of `invoice-type` + `expense-type`. Before, the two halves used different default periods (month vs year), counted subscription bills as income, listed "paid from wallet" as an income row, and left salaries out. Same cards and two section tables; income/expense lines use the API's names (translated when a key exists). New check panel under the totals: "matches the cash book" or a warning per problem (payments without a fund deposit, amount or date different from the deposit), plus the amount of bills paid from wallets. The panel keeps one height in every state and the previous figures stay while a new period loads (`keepPreviousData`).
- The page needs the new permission `reports.income-statement` (company Admin roles get it from `update:permission`); other staff see the existing "failed to load" card until it is granted.
- Settings → General → Books: `books_closed_until` (text, YYYY-MM-DD; the API validates it and refuses a future date).
- Translations in `en.json` and `bn.json`: `income_expense.checks.*`, `income_expense.types.*`, `settings.groups.books`, `settings.fields.books_closed_until.*`.
- Tests: new `tests/unit/reports/income-statement.test.tsx` (4); settings fixture and section lists updated for the new key.

Checks: `scripts/ai/frontend-check`: typecheck passed; unit 1,497 passed, 13 failed in 8 files — the same 8 files fail on a clean `master` (field-markup snapshots, menu items, pay page, client map, column visibility, reseller client table/filter, client dashboard info). Not checked in a browser (no running app or login here), so the layout-stability rule in `UI-update.mdc` is not yet verified at mobile/desktop widths.

## Income flow audit (invoice → payment → fund) — 2026-11-27

Read-only audit. No code changed in either repo. Full report: `isp-backend/docs/audits/income-flow-audit-2026-11-27.md` (new, untracked).

- Critical: expense and salary delete wipe every transaction in the fund; reseller-wallet bill payments are counted as income twice and deleting them does not refund the wallet; deleting a reseller recharge receipt leaves a due invoice and the wallet balance; bulk pay is not atomic or locked, so a double submit doubles income.
- High: a payment can be written without a fund; `(int)` casts drop paisa from `amount_paid`; paid invoices can be edited without a status recompute; manual client-wallet transactions skip invoice, payment and fund; expense fund jobs repeat on every update.
- Decision asked: cash basis or accrual basis for the statement. Proposed fix order is in the report, waiting for approval.

Checks: none run (no code change). Not checked in a browser.

## Pay Invoices dialog: partial amount above the total due is refused at once — 2026-11-28

Branch `master`. Uncommitted.

- `components/invoices/bulk-invoice-pay-dialog.tsx`: with "partial" chosen, a partial amount greater than the total due of the selected invoices shows "Amount cannot be greater than total due" under the field as the user types, and the submit button is disabled. An amount equal to the due is allowed. Switching back to full payment, lowering the amount, or changing the selection re-checks it.
- Translation `invoice.bulk_pay.partial_amount.errors.max` in `en.json` and `bn.json`.
- New test `tests/unit/invoices/bulk-invoice-pay-partial.test.tsx` (4).

Checks: `scripts/ai/typecheck` passed; `tests/unit/invoices`: 87 passed. Full suite not rerun. Not checked in a browser. Backend not changed.

## Fund transaction delete: any payment goes with it, with the OK confirmation — 2026-11-28

Branch `master`. Uncommitted. Backend part: `isp-backend/.ai/report.md`, same date.

- The linked delete confirmation (entries with ticked checkboxes, type `OK`) now shows for every fund transaction that was written for a payment, not only the deposit of an advance. For a bill payment it lists the payment and the fund transaction, and says the amount becomes due on the invoice again.
- `chainDeleteEntries` (`components/wallets/chain-delete.ts`): the fund transaction entry shows whenever the payment has a fund; the wallet transaction entry only when the API says a wallet is involved (`linked.wallet`). `LinkedPaymentChainSchema.wallet` added.
- Wallet transactions: unchanged. A transaction of a payment, or the advance taken for a bill, already gets this confirmation; a hand-made one keeps the plain confirmation.
- `wallet.chain_delete.invoice_due_again` reworded in `en.json` and `bn.json`. One more case in `tests/unit/wallets/chain-delete.test.ts`.

Checks: `scripts/ai/typecheck` passed; `tests/unit/wallets` and `tests/unit/fund-transactions`: 45 passed. Full suite not rerun. Not checked in a browser.

## Invoice view: full bill for an advance-adjusted invoice, and "Advance in Hand" — 2026-11-28

Branch `master`. Uncommitted. The same rule as the invoice print (entries below).

- `components/invoices/invoice-view-model.ts`: for an invoice with `advance_amount`, Sub Total, Total and Paid include the advance, and the minus line "Advance payment adjusted" is left out of the items. New `advanceInHand` from `wallet_balance`.
- `components/invoices/invoice-view-document.tsx`: an "Advance in Hand" row after the due row when the client's wallet holds more than 0. The due row still shows only above 0, as before.
- Tests: 3 new cases in `tests/unit/invoices/invoice-view-model.test.ts`.

Checks: `scripts/ai/typecheck` passed; `tests/unit/invoices`: 83 passed. Full suite not rerun. Not checked in a browser.

## Invoice print: "Advance in Hand" was missing when printing from the list — 2026-11-28

Branch `master`. Uncommitted. Fix for the entry below.

- Cause: printing from an invoice row uses the list row as it is (no detail request), and the list API did not send `wallet_balance`; only the invoice detail did. The earlier test covered the receipt component only, not this path.
- Fix is in the backend (the list and the client portal list now send `wallet_balance`). Here `wallet_balance` moved from `InvoiceDetailSchema` to `InvoiceRowSchema`.

Checks: `scripts/ai/typecheck` passed; `tests/unit/invoices`: 80 passed. Not checked in a browser.

## Invoice print: full bill for an advance-adjusted invoice, and "Advance in Hand" — 2026-11-28

Branch `master`. Uncommitted. Backend part: `isp-backend/.ai/report.md`, same date.

- `components/invoices/invoice-receipt.tsx`, both print versions. A bill that used the client's advance printed 0 everywhere (its saved amounts have the advance taken off). It now prints the usual way: the full bill, with the advance counted as paid.
  - Basic: Total Bill 1,400, Paid & Discount 1,400, Total Due 0.
  - Advanced: Sub Total 1,400, Total 1,400, Paid 1,400; the minus line "Advance payment adjusted" is not printed as an item.
- New row "Advance in Hand" after the due row, in both versions, whenever the client's wallet holds more than 0 (any invoice, not only an adjusted one). It is the balance at the time of printing; a client with several invoices on one receipt is counted once.
- `InvoiceDetailSchema.wallet_balance`; translation `invoice.receipt.advance_in_hand` in `en.json` and `bn.json`.
- Not changed: the on-screen invoice view still shows the saved amounts and the minus line.
- New test `tests/unit/invoices/invoice-receipt-advance.test.tsx` (5).

Checks: `scripts/ai/typecheck` passed. `npx vitest run`: 1484 passed, 13 failed, the same 13 as in the entry below. Not checked in a browser or on a printer.

## Bills adjusted with the client's advance: tag and tooltip in the invoice lists — 2026-11-28

Branch `master`. Uncommitted. Backend part: `isp-backend/.ai/report.md`, same date. **Needs the new backend migration.** This replaces the two entries below about invoice totals: the "bills only" totals and the extra chips are gone.

- A bill made while the client has an advance now carries the advance as a minus line (backend). Its amount in the list is what is left to pay (0 when fully covered).
- New `components/invoices/invoice-advance-tag.tsx`: a small "Advance paid" tag next to the amount, in the invoice list and in one client's invoice list. Hover or focus shows the sum: Total bill, − Advance paid, To pay. Shown only when `advance_amount > 0`.
- `InvoiceRowSchema`: `advance_amount`, `bill_amount`.
- `InvoiceReports` is back to its four chips and original layout (no "Paid From Wallet", no "Advance Payment", no `showAdvance`). `invoice-reports.tsx`, `invoice-table.tsx` and `client-invoice-table.tsx` have no diff against HEAD.
- Linked delete confirmation: the advance deduction of a bill has no payment, so it lists only the wallet transaction and says the invoice's full amount becomes due again.
- The Payments page still has the "Paid From Wallet" chip. Nothing new feeds it; it only shows bills paid from a wallet the older way (earlier the same day).
- Translations: `invoice.advance.*` added; `invoice.reports.paid_from_wallet` and `invoice.reports.advance` removed; `wallet.chain_delete.invoice_due_again` reworded.
- Tests: new `tests/unit/invoices/invoice-advance-tag.test.tsx` (5); one more case in `chain-delete.test.ts`; `invoice-reports-wallet.test.tsx` removed.

Checks: `scripts/ai/typecheck` passed. `npx vitest run`: 1479 passed, 13 failed: the same 9 as before, plus the 4 snapshot tests in `field-markup.test.tsx` that come from the unrelated uncommitted change in `components/controls/select-styles.ts`. Not checked in a browser (tag wrapping in a narrow amount column, tooltip look, the minus line in the invoice view and print).

## Invoice list totals: advance payments no longer counted twice — 2026-11-28

Branch `master`. Uncommitted. Backend part: `isp-backend/.ai/report.md`, same date.

- The invoice totals (Sub Total, Discount, Total, Paid) now count bills only; the API leaves wallet recharge receipts out. Example: a 2,000 advance and a 1,400 bill paid from the wallet showed Paid 3,400; it now shows Total 1,400 and Paid 1,400.
- Two new chips in `components/invoices/invoice-reports.tsx`: "Paid From Wallet" (`reports.paid_from_wallet`, the part of Paid that came out of wallets) and "Advance Payment" (`reports.advance_amount`, the recharge receipts in the list). Always rendered, 0 when absent. Recharge invoices stay visible in the list. Follow-up the same day: the "Advance Payment" chip shows only for one client's invoices (`showAdvance`: the client view and `/invoices/client/[id]`); the invoice page and the invoice report show five chips, without it.
- Layout: six chips instead of four. In the toolbar they are a 3-wide grid from `sm` and one row only from 1800px (was 1440px). **Needs a browser look**: between 1440px and 1800px the toolbar is now two chip rows tall.
- Translations `invoice.reports.paid_from_wallet`, `invoice.reports.advance` in `en.json` and `bn.json`. New test `tests/unit/invoices/invoice-reports-wallet.test.tsx` (3).

Checks: `scripts/ai/typecheck` passed. `npx vitest run`: 1476 passed, 13 failed: the same 9 as before, plus 4 snapshot tests in `tests/unit/form/builder/field-markup.test.tsx`. Those 4 come from an uncommitted change in `components/controls/select-styles.ts` (placeholder kept on one line) that is not part of this work and was left alone. Not checked in a browser.

## Advance payment follow-up: fund rules, client details, linked delete, dialogs closing by themselves — 2026-11-28

Branch `master`. Uncommitted. Backend part: `isp-backend/.ai/report.md`, same date.

- **Fund field** (`ClientWalletRechargeDialog`): no longer shows `0`; it is empty with the "Select fund" placeholder, or preselects the staff member's own fund. It follows the invoice payment rules through `paymentFundAccess`: no permission = locked to the own fund; `invoices.bkash-fund-access` = own fund or bKash; `invoices.change-fund` = any fund. Staff with no fund and no permission see the "no fund assigned" warning and cannot save. `ClientWalletRechargeFormSchema.fund_id` treats empty as "required".
- **Client details** at the top of the dialog: name, phone and client ID (PPPoE username). The dialog prop `clientName` is replaced by `client`; both callers updated.
- **Linked delete confirmation**: new `components/wallets/chain-delete-modal.tsx` and `chain-delete.ts`. For a wallet or fund transaction that belongs to a payment (the API sends `linked`), the confirmation lists every entry that goes with it (invoice, payment, fund transaction, wallet transaction, each with a ticked read-only checkbox and the balance effect) and Delete stays disabled until the user types `OK`. A bill paid from the wallet lists the payment and wallet transaction and says the invoice becomes due again.
  - Fund transactions list uses it for the deposit of an advance payment.
  - Client wallet transactions (the list opened from Client Wallets) had no delete action; it now has one, shown with `wallet-transactions.delete`. Unlinked rows use the plain `DeleteModal`. The user's own wallet page gets no delete action.
- **Dialogs closing by themselves**: `components/data-table/data-table.tsx` mounted each column's `cell` function as a component, so a page that builds its columns while rendering (clients list and others) rebuilt every cell on each re-render, and a dialog opened from a row lost its state and closed. Cells are now drawn by a stable `CellContent`, keyed by the cell function's code. Reproduced and covered by `tests/unit/data-table/cell-state-survives-rerender.test.tsx`. Not confirmed in a browser as the cause the user saw.
- Translations: `wallet.chain_delete.*`, `wallet.transaction_delete_confirmation` in `en.json` and `bn.json`.
- Tests: `tests/unit/wallets/chain-delete.test.ts` (5), one more case in `advance-payment-form.test.ts`, `cell-state-survives-rerender.test.tsx` (2).

Checks: `scripts/ai/typecheck` passed. `npx vitest run`: 1477 passed, 9 failed, the same 9 as before; the 4 of them that render `DataTable` fail the same way with the old `data-table.tsx`. Not checked in a browser.

## Advance payment dialog: fund, SMS choice and note — 2026-11-28

Branch `master`. Uncommitted. Backend part: `isp-backend/.ai/report.md`, same date. **The backend migration must be run first.**

- Client row menu: "Recharge Client" is now "Advance Payment" (`client.actions.advance_payment`; the old key `recharge_client` is removed).
- `ClientWalletRechargeDialog` (`components/wallets/wallet-transaction.tsx`): title "Advance Payment"; fields are amount, fund (required, `/dropdown-funds?scope=invoice-payment`), "Send Confirmation SMS" yes/no, and note. The fund dropdown is loaded with a skeleton of its own size, so the dialog does not jump. On success it refreshes clients, client wallets, invoices, payments, wallet transactions and funds.
- `ClientWalletRechargeFormSchema`: adds `fund_id` (required) and `confirmation_sms` (default 0).
- Payments list: a second chip "Paid From Wallet" (`reports.wallet_paid_amount`), always shown; "Total Paid" no longer includes bills settled from a wallet. The fund column shows "Wallet" for such a payment.
- SMS templates: new type `wallet_recharge` and token `{{wallet_balance}}`.
- Translations added to `public/lang/en.json` and `public/lang/bn.json`.
- New test `tests/unit/wallets/advance-payment-form.test.ts` (6).

Checks: `scripts/ai/typecheck` passed. `scripts/ai/test`: 1469 passed, 9 failed, the same 9 as before (client dashboard info, reseller client filter and table, column visibility, client map rows, menu order, public pay page). Not checked in a browser.

## Filter position setting: help text removed — 2026-11-26

Branch `master`. Uncommitted.

- The line "Where the filter opens on a computer when you press the filter button." no longer shows under "Filter position" in any list page's filter settings. `components/settings/registry/fields.ts` drops the `description` from the per-page filter position select.
- The now-unused key `settings.fields.filter_position.description` is removed from `public/lang/en.json` and `public/lang/bn.json`, and from the key list in `tests/unit/data-table/list-pages.test.ts`.

Checks: `scripts/ai/typecheck` passed. `scripts/ai/test`: 1463 passed, 9 failed, the same 9 as on the tree without this change. Not checked in a browser.

## Client view modal / drawer: closing animation — 2026-11-27

Branch `master`. Uncommitted (together with the eye-icon spinner entry below).

- The overlay used to be removed as soon as `view_client` left the URL, so closing had no animation. `client-view-overlay-host.tsx` now keeps the shown client for the length of the exit animation and passes `open={false}`; `client-view-overlay.tsx` reports the end with `onExited` after `OVERLAY_EXIT_MS` (220 ms, a timer so it also ends with reduced motion).
- Drawer: slides out to the right (the reverse of how it enters). Modal: fades and shrinks out. The backdrop fades. Same for every way of closing: X, backdrop, Esc, browser Back, and "Open full page".
- Opening another client during the exit animation shows that client, open.
- Tests: two host cases (kept while closing, reopened during closing) and one overlay case (`onExited` only when closing).

Checks: `scripts/ai/typecheck` passed. `scripts/ai/test`: 1463 passed, 9 failed, the same 9 as before. Not checked in a browser; the animation itself can only be judged there.

## Client list: eye icon shows a spinner while the modal / drawer opens — 2026-11-27

Branch `master`. Uncommitted.

- `view-mode/client-view-overlay-history.ts`: an "opening client" value with subscribe / get / set. `ClientViewLink` sets it on a plain click in modal and drawer modes; `ClientViewOverlay` clears it once it is on screen; a 10 s timeout clears it if the overlay never appears.
- New hook `view-mode/use-client-view-opening.ts`. `client-row-actions.tsx` uses it to show `Loader2` (same 16 px size, so nothing moves) instead of the eye until the view is shown. The spinner also shows when the same client was opened from its Client ID link or the menu's "View".
- `ClientViewLink` sets `aria-busy` on itself while opening.
- Same page and New tab modes: no spinner (the browser shows its own loading).
- Tests: opening state per mode and per client in `client-view-link.test.tsx`; cleared by the overlay in `client-view-overlay.test.tsx`.

Checks: `scripts/ai/typecheck` passed. `scripts/ai/test`: 1460 passed, 9 failed, the same 9 as before. Not checked in a browser.

## Client view modal / drawer: Pay dialog freeze, instant open, loading line — 2026-11-27

Branch `master`. Uncommitted. Fixes from testing the modal / drawer on production.

- **Pay dialog on top of the modal / drawer could not be clicked.**
  - Cause: `bulk-invoice-pay-dialog.tsx` and `invoice-pay-dialog.tsx` load the fund dropdown with `dynamic(() => import(...))` and no options. In this Next version that form has no Suspense boundary of its own, so while the dropdown's code downloaded (noticeable on production) React suspended a boundary above the dialog. The dialog then lost its place as the top Radix layer: the modal / drawer underneath stayed the active layer and the Pay dialog got `pointer-events: none`.
  - Fix 1: both Pay dialogs give the dropdown a `loading` placeholder (label line + box), which also gives it its own boundary.
  - Fix 2: `components/my-dialog.tsx` wraps the dialog body in a `Suspense` boundary with a small placeholder, so no lazy content in any `MyDialog` can do this again. Side effect on normal pages: such loading now shows inside the dialog instead of flashing the page behind it.
  - Fix 3: the view inside the overlay is `LazyClientView` (`view-mode/client-view-lazy.tsx`), with its own boundary, so nothing in the view can hide the overlay.
  - Regression test: `tests/unit/clients/client-view-overlay-suspense.test.tsx`. It failed before the `MyDialog` change (dialog `pointer-events: none`) and passes now.
- **Slow to open.** The overlay frame was itself lazy-loaded, so nothing showed until its code (including the whole client view) had downloaded. Now the frame is imported directly by `client-view-overlay-host.tsx` and opens at once with the view skeleton; only the view is lazy, and `ClientViewLink` starts loading its code on hover / focus in modal and drawer modes (`preloadClientView`).
- **Loading line.** `client-view-overlay.tsx` shows an indeterminate line on the title bar's bottom border while the client detail is fetching: first open, Previous / Next, and refreshes after an action. It is positioned over the border, so nothing moves. New Tailwind animation `progress-slide` in `tailwind.config.ts`; reduced-motion users get a pulsing full-width line.
- Tests: loading line shown and removed; hover / focus preload per mode; the regression test above.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1455 passed, 9 failed, the same 9 as before.
- Not checked in a browser. The freeze was reproduced and fixed in a unit test, not on production; please confirm there: open a client in the modal and the drawer, click Pay straight away, and use the fund dropdown, date and Pay button.

## Client view opens in a modal, a drawer, the same page or a new tab — 2026-11-27

Branch `feat/client-view-open-mode`. Backend part: `isp-backend/.ai/report.md`, same date (needs `migrate`).

- **Setting.** The "Client view open on new tab" switch is replaced by the dropdown **"Open client view in"**: Modal, Drawer, Same page, New tab (`client_view_open_mode`, default Same page). It is in the same place (client settings). Until the API migration has run, a company with the old switch on still gets New tab (`clientViewModeFromSettings` falls back to it).
- **One link for every "view client" link:** `components/clients/view-mode/client-view-link.tsx`. The href is always `/clients/view/{id}`, so copy link, Ctrl/Cmd-click and middle-click work as before. A plain click: same page, new tab (`rel="noopener noreferrer"`), or for modal / drawer it adds `?view_client={id}` with `history.pushState` (no server round trip; Back closes it). Hover prefetch is built in (off for New tab). Used by: client table menu "View", eye icon and Client ID; the invoice, payment and history client columns; the ONU column; the OLT attention list; the OLT clients table; the map pop-up. No component reads the old key any more.
- **Overlay.** `client-view-overlay-host.tsx` is mounted once in `app/(dashboard)/layout.tsx` (in `Suspense`) and lazy-loads `client-view-overlay.tsx` on first use.
  - One Radix dialog for both looks: a centered modal (up to 1240 px) or a right drawer (up to 1060 px); full screen under `md`. The list underneath stays mounted (filters, page, scroll kept).
  - Top bar: name, Client ID, "2 of 8 on this page", Previous / Next (the cached list page it was opened from; hidden when opened from elsewhere; uses replaceState so Back still closes; hover prefetches), Open full page, Close. Esc, the scrim and Close close it: Back when it was opened by a click in this tab, otherwise the parameter is removed.
  - With the setting on Same page or New tab, a pasted `?view_client=` URL opens the full page instead.
  - The view inside is the same `ClientView` with `variant="overlay"` (no back arrow). Its lazy tables measure against the overlay's scroll area (`useInView` got a `root` option).
- **Existing features:** the view's dialogs (Pay, Edit link, switch, reset, package, map, ticket, invoice, SMS, lock, ping) are unchanged; a test opens a real `MyDialog` inside the modal and the drawer and checks it stacks on top and that Esc closes only it. The full page and the list's own menus are unchanged.
- **Refactor (first commit):** `useClientDetail` (shared detail query with the list-row placeholder), `findClientListContext`, `ClientView`/`ClientViewSkeleton` `variant` and `scrollRoot`, `useInView` `root`. No behaviour change.
- Translations: `settings.fields.client_view_open_mode.label`, `settings.options.client_view_open_mode_*`, `client.view_overlay.*` in `en.json` and `bn.json`. The old label key is removed.
- Tests: new `client-view-mode`, `client-view-link`, `client-view-overlay`, `client-view-overlay-host` tests and list-context / overlay-variant cases; the invoice, payment, history and name-cell tests got a router mock and query wrapper, and now expect no `target` for same-tab links (was `_self`). Settings snapshot fixture: the old key's entry is replaced by the new one.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1449 passed, 9 failed. The 9 are the ones that failed before this change (client dashboard info, reseller client filter and table, column visibility, client map rows, menu order, public pay page).
- Not checked in a browser (needs a login). Check in all four modes: open from the client list, an invoice and the map; Previous / Next; Back, Esc and a click outside; Pay, SMS, Lock, Change package and Create invoice from inside the modal and the drawer; a form on a phone-width screen inside the overlay; the list keeps its filters and scroll after closing; Ctrl/Cmd-click opens a new tab.

## Client view: prefetch the detail on hover — 2026-11-26

Branch `master`. Builds on the two entries below.

- **New `components/clients/client-detail-query.ts`:** `clientDetailQueryKey`, `fetchClientDetail` (same URL and error handling as the view's `useApiQuery`), and `useClientDetailPrefetch(clientId, enabled)`. It returns pointer and focus handlers for a view link. Resting on the link for 150 ms, or focusing it, prefetches the detail into the view's cache entry. Leaving sooner cancels it. A detail loaded in the last 30 s is not requested again, and a failed response is not cached.
- **Wired to:** the eye icon and the "View" menu item in `client-row-actions.tsx`, and the client ID link in `client-name-phone-cell.tsx`. `client-view.tsx` uses `clientDetailQueryKey`.
- **Off when "open client view in new tab" is on.** A new tab has its own cache, so the request would be wasted. The router info and usage calls (live MikroTik) are never prefetched.
- **Tests:** new `tests/unit/clients/client-detail-prefetch.test.tsx` (5 tests). `client-name-phone-cell.test.tsx` now renders the cell in a `QueryClientProvider`, as the app does; its assertions are unchanged. `vitest.setup.ts`: if a test does not mock `@/app/actions`, `apiGet` returns a failed response instead of failing to import next-auth.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1396 passed, 9 failed, the same 9 as before today's changes.
- Not checked in a browser. Check: with the new-tab setting off, rest on the eye icon (Network tab: one `/api/proxy/v1/clients/{id}`), then click; the view should render fully at once. Moving the pointer quickly down the table should send no requests.

## Default staleTime, and the client view starts from the list row — 2026-11-26

Branch `master`. Builds on the read proxy entry below.

- **`context/tanstack-provider.tsx`:** queries default to `staleTime: 30_000`. Remounting a page, or opening one whose data was just loaded, reuses the data instead of fetching it again. Mutations still refetch through `invalidateQueries`, and queries that set their own `staleTime` (online status, router info, invoice print settings `0`, …) keep it. I checked the direct `useFetch` writes: each one refreshes its own data, or (themes) has its own `staleTime`.
- **New `components/clients/client-list-cache.ts`:** `findClientInListCache` finds a client row on any cached page of `["clients", …]` or `["reseller-clients", …]`.
- **`components/clients/client-view.tsx`:** that row is the `placeholderData` of the detail query. Opened from the list, the header and info cards show at once, and router info, usage and SMS status start loading straight away. The full record is still fetched and replaces the row. While the row is shown, the header action buttons are in a disabled `fieldset`, because the row lacks fields the dialogs read, such as the reseller. With no list in the cache (a new tab or a direct link) the page shows the skeleton as before.
- **`components/clients/basic-view.tsx`:** new `summaryOnly` prop. Password, balance, invoice day and discount show a one-line skeleton instead of "—" or ৳0 until the full record arrives, so the rows keep their height. The copy button (it copies the password) is disabled until then.
- Tests: `tests/unit/clients/client-list-cache.test.ts`, `tests/unit/clients/client-view-list-placeholder.test.tsx` (5 tests).

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1391 passed, 9 failed, the same 9 as before these changes.
- Not checked in a browser. Check: open a client from the list; name, phone and package should show at once, and the buttons enable when the full record arrives. The ONU section can still appear under the cards after the full record loads, as it did before this change.

## Reads go through a Route Handler, so pages load their queries in parallel — 2026-11-26

Branch `master`.

- **Why.** `useApiQuery` fetched through the `useFetch` Server Action. Next runs Server Actions one at a time per tab, so a page with many queries (the client view: details, router info, usage, SMS status, then each table) loaded them in a queue.
- **New `app/api/proxy/[...path]/route.ts`** (GET only). It reads the token with `auth()` as `useFetch` does and passes the request to `{NEXTAPI_URL}/api/{version}/…`, returning the API status and body unchanged. No session gives 401 without calling the API. The path must start with a version like `v1`, and `.`, `..` or empty segments give 404 (`lib/api/api-proxy-url.ts`).
- **New `lib/api/api-get.ts`.** Calls the proxy from the browser and returns the same envelope as `useFetch`, including `{ success: false, status: 500 }` when the network fails or the body is not JSON.
- **`hooks/use-api-query.ts`** uses `apiGet` instead of `useFetch`. Query keys, retries, error handling and the subscription check are unchanged.
- **Not changed:** `useApiMutation` and the other direct `useFetch` callers (32 files) still use the Server Action. Writes are rare per page; reads were the queue.
- **Tests.** `vitest.setup.ts` points `apiGet` at the (mocked) `useFetch`, so the existing tests that mock `@/app/actions` keep working. New: `tests/unit/lib/api-proxy.test.ts`, `tests/unit/lib/api-proxy-route.test.ts` (14 tests).

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1386 passed, 9 failed. The 9 are the same ones that fail before this change (client dashboard info, reseller client filter and table, column visibility, client map rows, menu order, public pay page).
- Dev server (`localhost:3000`): `/api/proxy/v1/clients` without a session returns the 401 JSON. A logged-in request was not tested; check the client view page in a browser (Network tab: `/api/proxy/v1/...` requests should overlap instead of running one after another).

## Invoice form: empty Invoice type and Client show the placeholder — 2026-11-26

Branch `master`.

- `components/invoices/invoice-form.tsx`: the create defaults for `invoice_type_id` and `client_id` were `0`, which the dropdown drew as "0". They are now `null`, so the placeholder shows.
- Validation is unchanged: an empty value still gives the "required" error for both fields (`null` is read as 0 by the schema).
- `scripts/ai/typecheck`: passes. Invoice unit tests (`tests/unit/invoices`, `tests/unit/form/builder/invoice-form.test.tsx`): 76 passed. Full unit suite not rerun.
- Not checked in a browser.

## Invoices: bill a reseller, and "My bills" for resellers — 2026-11-26

Branch `refactor-form-builder`. Backend part: `isp-backend/.ai/report.md`, same date.

- **Invoice form** (`/invoices/create`): new "Bill to" select, Client or Reseller. Reseller swaps the client field for a reseller dropdown (`/dropdown-resellers`) in the same grid cell and hides the confirmation SMS without moving the note. A client invoice sends the same payload as before; the payer fields are only sent for a reseller. The client dialog on the client page is unchanged. On edit the payer cannot be changed.
- **Invoice list, view and print**: a reseller invoice shows the reseller's name (marked "Reseller") in the client column and as the customer.
- **Pay button**: no longer throws when the due-invoice lookup returns nothing.
- **My bills** (`/my-bills`, `components/reseller-bills/`): the invoices billed to the signed-in reseller, with totals, a view, and "Pay from wallet" (full or part). The menu link is under Invoice, for reseller accounts with `reseller-invoices.access`; pay needs `reseller-invoices.pay`.
- `InvoiceViewDialog` has `fetchDetail` (default true) so a bill can be shown from its row.
- New keys in `en.json` and `bn.json`: `invoice.bill_to.*`, `menu.invoice.my_bills.title`, `reseller_bill.*`.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1350 passed, 9 failed. 12 new tests pass (`tests/unit/invoices/invoice-bill-to.test.ts`, `tests/unit/menu/menu-my-bills.test.ts`). The 9 failures are in client dashboard info, reseller client filter and table, column visibility, client map rows, menu order (`/referrals` position) and the public pay page; none is in a file this change touched except the menu config, where the failing assertion is the top-level order.
- Not checked in a browser, so the layout rules in `UI-update.mdc` are not verified. Playwright not run.

Unrelated changes already in the working tree (not mine, left alone): about 260 files under `tests/`, `AGENTS.md`, `.cursor/rules/test-naming.mdc`, one placeholder in each language file, `playwright/.auth/user.json`.

## Form builder refactor, phase 8: cleanup, one home, standalone controls, docs — 2026-11-25

Branch `refactor-form-builder`.

- **Dead code deleted** (no importer in app, components, hooks, lib or tests): `components/input-field.tsx`, `components/calendar-date-picker.tsx`, `components/sms/sms-send-form.tsx` and `sms-send-type.ts`, the second `BkashWalletForm` in `wallets/reseller-recharge.tsx`, and the `input_filter` branch of the table toolbar.
- **One home.** `form-builder.tsx`, `form-wrapper.tsx`, `accordion-form-builder.tsx`, `form-filter.tsx` and the types (`types.ts`) moved into `components/form-builder/`. The files in `components/form-wrapper/` are one-line re-exports, so no caller changed.
- **`SelectInput`** (`components/controls/select-input.tsx`): the dropdown with its label and options, for use outside a form.
- **Four screens no longer create a form to host one field:** the change-package dialog, the switch-reseller dialog, the referral status filter (all `SelectInput` + `useState`), and the queue restore options (`DateInput`). `tests/unit/clients/client-switch-dialog.test.tsx` now mocks `SelectInput`.
- **Docs.** New `components/form-builder/README.md`, a guide for someone new to the builder. `.cursor/skills/agent/SKILL.md`, `.ai/architecture.md` and `.cursor/rules/project-structure.mdc` updated.

Deliberately not done:
- **The six small hand-written forms with "no real blocker"** (two ticket reply forms, MikroTik sync and command, the platform SMS source, client wallet recharge) stay as they are. Each is under 100 lines and works; on the builder its footer would look different (border, sticky bar, Cancel button), and that needs a browser to judge. Convert them when they are next touched.
- **Four more "form to host a field" cases** stay: `plan-feature-matrix.tsx`, `feature-permission-editor.tsx`, the fund-transaction receiver picker and the SMS send filter. Their tests mock the form field, or the field takes part in validation.
- **A generic file field** (see phase 7).

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1338 passed, the same 9 unrelated failures as before.
- Not checked in a browser. Playwright not run.

Whole branch against `master`: 116 files changed. Before merging: a browser pass over a dialog form, a full-page form, the invoice and both stock forms and one table filter, and the Playwright suites (clients, invoices, expenses, staffs, resellers, networks, products), which need a renewed login.

## Form builder refactor, phase 7 (part 2): the stock forms moved, remaining dynamic features — 2026-11-25

Branch `refactor-form-builder`.

New in the builder, all optional:

| Feature | What it is |
| --- | --- |
| `FieldArrayConfig.render` | Draw the rows yourself, for a layout cards and `table` cannot give. Fields still come from `itemFields` through `row.field("name")`, with their rules, value handling and errors. |
| `onChange: { set: {...} }` | When the user changes a field, write values into other fields (row-scoped; `/name` for top level). It does not fire when the form is filled on open or when an edit record arrives. |
| `{ all: [...] }` / `{ any: [...] }` | `visibleWhen` and `disabledWhen` on more than one field. |
| `dependsOn.isSet` | Says when the parent counts as chosen, for a parent that uses 0 for "none". |
| `step`, `reserveErrorSpace` | On text and number fields. |
| `display` on a computed field | Draw the value yourself (e.g. as money) in place of the read-only input. |

Stock forms:
- `product-out-lines-editor.tsx` (333 lines) and `product-in-lines-editor.tsx` (424 lines) are deleted.
- `product-out-lines.tsx` and `product-in-lines.tsx` declare the lines as a `fieldArray` and hold the row layout. `use-product-line-detail.ts` is the product lookup both shared as a copy before.
- `product-out-form-schema.ts` and `product-in-form-schema.ts` include the lines; the forms place them with `field("product")`.
- No hand-written `useFieldArray` is left outside the form builder.

How the move was checked: `tests/unit/form/builder/product-forms.test.tsx` (10 tests, 5 snapshots) was recorded on the old editors first: serial product, lot dependency and price fill, serial limit, product change clearing, fibre metres, serial inputs per unit, expense amount, add and remove, and the saved payload of each form. After the move:
- Every behaviour test passes unchanged.
- Both payload snapshots are identical.
- Markup differs only by `type="button"` on the Add and remove buttons (they were submit buttons) and, in stock in, a plain `<div>` around each of the three fibre fields.

Because the lines are now in the form schema, a server error for a line field shows under that field.

Left out on purpose:
- **File upload.** The five existing file inputs upload through their own endpoints, apart from the form's save. A generic file field needs a decision on that flow, so it belongs with the screens that would use it (phase 8).
- **Rows inside rows as a config option.** The one case (a serial input per unit) is 20 lines inside the stock-in row layout; a general nested array was not needed.
- **A declarative per-row fetch.** The product lookup is a small hook used by both stock forms.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1338 passed, the same 9 unrelated failures as before.
- Not checked in a browser. Playwright not run; `products/products.spec.ts` (FT051) and `invoices/forms.spec.ts` cover these forms and should run before merge.

## Form builder refactor, phase 7 (part 1): dynamic features, invoice lines moved — 2026-11-25

Branch `refactor-form-builder`.

New in the builder, all optional, so existing forms are unchanged:

| Feature | What it is |
| --- | --- |
| `type: "computed"` | A read-only value worked out from the row (or the form), e.g. `amount * quantity`. Kept in form state, so Zod and the payload see it. |
| `type: "custom"` | Your own component in a field's place, with the usual wrapper (`className`, `permission`, `visibleWhen`) and its form path. Replaces most reasons to use `slot` or the `children` function. |
| `disabledWhen` | Disables a field while a rule on another field passes. Row-scoped like `visibleWhen`. |
| `FieldArrayConfig.table` | Rows as a table: heading with the Add button, a header row of column names, column widths out of 12, and a stacked phone layout with "Item N". Remove is disabled (not hidden) at `minItems`. |
| `FieldArrayConfig.reserveErrorSpace` | Keeps a line free under every row field. |
| `errorEllipsis` | One-line error text for narrow columns. |
| `FormBuilder validate` | A check against live data after Zod; return `{ field: message }` to stop the save. |
| `FormBuilder onSubmit` | The caller saves in place of the request to `api`; the same success and failure steps follow. |

Invoice lines:
- `components/invoices/invoice-lines-editor.tsx` (172 lines) is deleted. The lines are a `fieldArray` in `invoice-form-schema.ts`, and `invoice-form.tsx` places it with `field("lines")`.
- Guard tests in `tests/unit/form/builder/invoice-form.test.tsx` were recorded on the old editor first. After the move the lines markup differs only by `type="button"` on the Add and four remove buttons (they were submit buttons), and the edit payload snapshot is identical.
- Because the lines are now in the form schema, a server error for `lines.0.amount` shows under that field.

Not done yet in phase 7: file upload, rows inside rows, a per-row fetch, clear-siblings-on-change, conditions on more than one field, and moving the product out and product in line editors, which need those.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1314 passed, the same 9 unrelated failures as before.
- Not checked in a browser. Playwright not run; `invoices/forms.spec.ts` (IV-F02 to IV-F11) covers these lines and should run before merge.

## Form builder refactor, phase 6 (second batch): the remaining fixes — 2026-11-25

Branch `refactor-form-builder`. One commit per item, each with tests. The payload snapshots for the 10 real forms did not change.

| Commit | What changed |
| --- | --- |
| S7 | A dependent dropdown keeps its value when the loaded edit record fills its parent. It is still cleared when the user changes the parent, also away and back. |
| S4 | A saved dropdown value that has no option is shown as the value itself once the options have loaded, so it no longer looks unset. A multi dropdown shows values in saved order. |
| S10 | While the dropdown code loads, the label and a box of the control's height hold its place. |
| Field options | Opt-in `idPrefix` (FormBuilder and FormFilter) and `reserveErrorSpace` (FormBuilder). Off unless set. |
| Filters | A `tel` field can be used in a filter. The list of typed-text types comes from the field definitions (`isTextInput`). |
| Row `valueKey` | The salary names left the shared row cleanup. `salary-form-schema.ts` and `staff-form-schema.ts` declare `valueKey: "label"` / `"value"` on their row fields. |
| Date helper | `lib/validations/date-fields.ts` (`optionalDateOnly`, `nullableDateOnly`) replaces the copies in the staff, salary and company-subscription schemas. |
| Props | `method` and `mode` are optional on `FormBuilder`. |

Decided not to change, with the reason:
- **Server-side dropdown search.** The 30 `dropdownList` endpoints in `isp-backend` return the whole list and take no search or limit parameter. This needs the API first. The frontend seam is ready: only `components/controls/use-select-options.ts` loads options.
- **Number inputs and radios storing text.** Every Zod schema already coerces, and some fields that use a number input are validated as text (client `discount`). Changing the stored type would break those schemas for no gain.
- **The client schema's own date helper.** It also treats the text "undefined" as empty, so it is not the same rule.
- **Expense and reseller sending day-month-year.** That is what those endpoints are written for; changing it is an API change.
- **`idPrefix` and `reserveErrorSpace` are not switched on anywhere.** Turning them on changes ids (e2e selectors) or spacing, so each screen should opt in with a look in the browser.
- **The switch still shows no error text.** Its label and control sit in a row; an error line needs a layout decision.

Behaviour changes a caller could notice:
- A dropdown whose saved value has no option now shows that raw value (for example an id) instead of the placeholder.
- The first dropdown drawn after page load shows a grey box for a moment where it used to show nothing.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1282 passed, the same 9 unrelated failures as before.
- Markup snapshot change: a `tel` input now appears in the filter snapshots. Nothing else.
- Not checked in a browser. Playwright not run.

## Form builder refactor, phase 6 (first batch): bug fixes — 2026-11-25

Branch `refactor-form-builder`. Each fix is its own commit and changed or added the tests that describe it. Unlike phases 2 to 5, these change behaviour on purpose. The payload snapshots for the 10 real forms did not change.

| Commit | What changed for the user |
| --- | --- |
| B1 | The Add button of repeating rows no longer submits the form. |
| B2 | An edit form keeps what was typed when its parent re-renders. It refills only when the API returns a record. |
| B5 | A server validation message shows under a field inside a row (`items.0.qty`) and under latitude and longitude, not only as a toast. |
| B6 | An edit form with a location field no longer refetches a record it already has. |
| B7 | A dropdown or radio default on a row field fills the rows, not a stray top-level value. |
| B8 | `visibleWhen` and `dependsOn` work inside rows, per row. `/name` refers to a top-level field. Row fields get their `className`. |
| Save on change | The hidden submit input is gone; a switch with `saveOnChange` asks the form through `useFormActions()`. Enter no longer saves a form with `actionButton={false}`, and is ignored while a save is in flight. |
| B3 | `rules` and date `required` are removed from the field config. They never ran under the Zod resolver. Invoice note and new-client report keep the same checks in Zod. |
| B4 | A date-only API value is read as that local day by the builder too, like the calendar. |
| Dropdown | `valueMapping.labelKey` and `isSearchable` are honoured; a failed options request says so and retries on open; "No options" and "Loading" are translated; a dependent dropdown subscribes only to its parent. The date picker's default placeholder is `common.pick_date`. |
| Fields | Clicking a switch label toggles it. A single checkbox translates its label. |

New translation keys in `en.json` and `bn.json`: `common.no_options`, `common.pick_date`.

Behaviour changes a caller could notice:
- `isSearchable: false` now takes effect in `company-wallet-form-schema.ts`, `agent-transaction-form-schema.ts`, `sms-template-form-schema.ts` and two filter schemas. They asked for it but used to get a searchable dropdown.
- `mikrotik-sync-import-form.tsx` hides its buttons with `actionButton={canImport}`. Enter used to submit it anyway through the hidden input; it no longer does.
- An options endpoint that answers `success: false` now counts as a failure, not an empty list.

Not done yet in phase 6: server-side search for long dropdowns, showing a saved value that is not in the options, clearing a child dropdown on parent change during edit load (S7; no clean rule found yet), a placeholder while the dropdown code loads, number and radio values stored as text, duplicate ids when two forms share a field name, reserved error space, `tel` in filters, the salary names in shared row cleanup, and the per-form Zod date helpers (three copies, two formats). A custom submit handler and file upload are new features and belong to phase 7.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1272 passed, the same 9 unrelated failures as before.
- Markup snapshot changes, each checked line by line: `type="button"` on Add; the hidden submit input removed; `common.pick_date` in place of "Pick a date"; the switch label's `for`.
- Not checked in a browser. Playwright not run.

## Form builder refactor, phase 5: form-free dropdown and date controls — 2026-11-25

Branch `refactor-form-builder`. Structure only. The markup snapshots and the payload snapshots are unchanged; react-select and its `select__*` class names stay.

New `components/controls/`. Nothing in it uses React Hook Form:
- `select-box.tsx`: `SelectBox`, the dropdown as `value` + `onChange`.
- `select-styles.ts`: the react-select style objects and theme, built once (they were rebuilt on every render inside the component).
- `use-select-options.ts`: loads options from a `/dropdown-...` endpoint, or uses the static list.
- `date-input.tsx`: `DateInput`, one date, with the optional time row.
- `date-range-input.tsx`: `DateRangeInput`, the two-click range with hover preview and Apply.
- `date-popover.tsx`: the button, clear button and popover both date controls share.
- `date-format.ts`: pure helpers for parsing and showing picker values.

The form fields are now thin bindings:
- `components/select-dropdown.tsx` (407 to 146 lines): `SelectBox` + React Hook Form + `dependsOn` + `populate`.
- `components/form/DatePicker.tsx` (474 to 126 lines): picks `DateInput` or `DateRangeInput` by `mode`. It still exports `formatDatePickerDisplay`, `hasSelectedDateRange` and the value types.

Different from the plan: two date controls and a shared popover, not three controls. Date + time is the `showTime` option of `DateInput`, because it shares all of its code with the single date.

New `tests/unit/form/builder/controls.test.tsx` (7 tests): the three controls work with no form around them.

Kept as they are, for phase 6: the dropdown still loads the whole list, still labels options by `name` only, still uses raw `useQuery` with `retry: 0`, still watches its parent with `watch()`, and `SelectDropdown` itself still needs a form around it. The date picker keeps its English default placeholder and `MM/dd/yyyy`.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1259 passed, the same 9 unrelated failures as before. No snapshot file changed, which includes the generated react-select style classes.
- Not checked in a browser. Playwright not run: the saved login expired on 19 Nov. This phase is the one the plan wanted the e2e suites for (expenses, invoices, staffs, resellers, networks), so they should run before this branch is merged.

## Form builder refactor, phase 4: field registry and shared field shell — 2026-11-25

Branch `refactor-form-builder`. Structure only. The markup snapshots (every field type in a form and in a filter, empty, filled and with errors) and the payload snapshots for the 10 real forms are unchanged.

- First, as its own commit: `tests/unit/form/builder/field-markup.test.tsx` (7 snapshots), recorded on the code before this phase.
- New `components/form-builder/fields/`:
  - `define-field.ts`: what a field type is. `render` (form), `readValue` (API record to form value), `renderFilter` and `toFilterParam` (table filter).
  - One definition file per type: `text.tsx` (text, email, number, tel), `password.tsx`, `textarea.tsx`, `dropdown.tsx`, `radio.tsx`, `switch.tsx`, `checkbox.tsx`, `date.tsx` (date, dateRange), `geolocation.tsx`.
  - `registry.ts`: the list of types, with the three steps to add one written at the top.
  - `field-array.tsx`: the repeating-rows renderer, moved as it was.
  - `field-shell.tsx`: `FieldShell` (label, control, error) and `useFieldControl`.
- `components/form-builder/layout/visible-field.tsx`: `VisibleFormField`, moved. `form-builder.tsx` still exports it, so the 7 files that import it from there are untouched.
- `components/form-builder/core/dates.ts`: the two date parsers.
- `form-builder.tsx` (454 to 173 lines): the `switch` on field type is gone; it asks the registry.
- `form-filter.tsx` (324 to 233 lines): its own second renderer is gone; it asks the registry for `renderFilter`.
- `hooks/use-filter-form.ts`: date serialising moved into the date definitions (`toFilterParam`).
- `core/values.ts`: per-type conversion moved into the definitions (`readValue`).
- `components/form/input-field.tsx`, `textarea-field.tsx`, `radio-field.tsx`, `checkbox-field.tsx`, `switch.tsx`, `DatePicker.tsx` and `components/select-dropdown.tsx` now draw label and error through `FieldShell`. Their props and markup are the same.

Kept as they are, on purpose: `tel` still has no filter version, the switch still shows no error, a single checkbox still does not translate its label, and the text-type list in `use-filter-form.ts` is still its own list. Those are behaviour changes and belong to phase 6.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1252 passed, the same 9 unrelated failures as before. No snapshot file changed.
- Not checked in a browser. jsdom proves the HTML is the same, not that it looks the same, so a look at two or three forms and one table filter is still worth doing. Playwright not run.

## Form builder refactor, phase 3: `form-wrapper.tsx` split into hooks — 2026-11-25

Branch `refactor-form-builder`. Structure only; the payload snapshots for the 10 real forms are unchanged.

- `form-wrapper.tsx` (372 to 194 lines, about 100 of them the props type) now only composes:
  - `core/use-entity-form.ts`: creates the form with the Zod resolver.
  - `core/use-entity-load.ts`: edit mode, decides whether to fetch `GET {api}/{id}`, fills the form, toasts a failure.
  - `core/use-entity-submit.ts`: payload, request, success and failure handling. The submit-hold timer is its own small hook inside this file.
  - `core/request.ts`: pure helpers for the load URL and the save URL and method.
  - `layout/form-footer.tsx`: Cancel and Save buttons.
  - `layout/form-load-state.tsx`: skeleton, load failure with retry, or the fields.
- Props, defaults and the default export of `FormWrapper` are the same.

One thing that is not purely structural: the two `console.log` calls in the wrapper are gone (audit item B9). One printed the loaded record on every render, the other printed validation errors. Nothing reads them.

Kept as they are, for later phases: the hidden submit input and the `saveOnChange` effect (unused), the edit-load effect that depends on `transformToFormValues` (B2), top-level-only server errors (B5).

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1245 passed, the same 9 unrelated failures as before.
- Not checked in a browser. Playwright not run.

## Form builder refactor, phase 2: pure data logic moved to `components/form-builder/core/` — 2026-11-25

Structure only. No behaviour change intended, and the payload snapshots for the 10 real forms are unchanged.

- New `components/form-builder/core/`, pure functions with no React:
  - `form-schema.ts`: read a field config (`flattenFormSchema`, `flattenFieldConfigs`, `shownFields`, `topLevelFieldNames`). Replaces two copies of the same flatten function.
  - `values.ts`: API record to form values (`toFormValues`), defaults (`applyFormFieldDefaults`), row cleanup (`normalizeFieldArrayItems`), `isDataComplete`.
  - `payload.ts`: form values to request body (`buildPayload`, `toFormData`).
  - `conditions.ts`: `visibleWhen` rules (`isFieldVisible`, `hiddenFieldValue`, `hasFilledValue`).
- `form-builder.tsx` (569 to 454 lines) and `form-wrapper.tsx` (417 to 372 lines) now call these.
- `form-wrapper/form-field-defaults.ts` only re-exports the old names, so existing imports still work.
- New `tests/unit/form/builder/core.test.ts` (13 tests) for the pure functions.

Not done on purpose: the salary field names in `FIELD_ARRAY_ALIASES` moved as they are (marked as debt), and no bug was fixed. Bug fixes are phase 6.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test` after the move, before adding `core.test.ts`: 1233 passed, the same 9 unrelated failures as before. Then the form, client-schema, expense and reseller suites with `core.test.ts`: 276 passed.
- Not checked in a browser. Playwright not run.

## Form builder refactor, phases 0 and 1: tests that lock current behaviour — 2026-11-25

Tests only. No file under `components/`, `hooks/`, `lib/` or `app/` changed.

Phase 0:
- `tests/unit/form/date-picker-range.test.tsx`, `date-picker-clear.test.tsx`, `filter-date-range-close.test.tsx`: the calendar opens on the current month, and these tests click days in October 2026. They now hold `Date` in October 2026 (`vi.useFakeTimers({ toFake: ["Date"] })`). All 11 pass again.

Phase 1, new folder `tests/unit/form/builder/` (177 tests):
- `harness.tsx`: shared helpers. The real builder, wrapper, fields, `useApiQuery` and `useApiMutation` run; only `useFetch` is faked, so a test sees the exact URL, method and payload.
- `form-builder-submit.test.tsx` (33): request URL and method per mode, payload step order, success sequence, toasts, invalidation, dialog close, 422 errors, footer, repeat submits, `submitHoldMs`.
- `form-builder-fields.test.tsx` (36): what each field type draws and stores, ids, layout, the `children` function, dropdown options from the API.
- `form-builder-values.test.tsx` (25): how `data` becomes form values in edit and create, defaults, field-array rows.
- `form-builder-hydration.test.tsx` (18): when the record is fetched, skeleton, failure and retry.
- `form-builder-conditions.test.tsx` (17): `visibleWhen`, `dependsOn`, `populate`.
- `form-builder-field-array.test.tsx` (20): rows, add, remove, reorder, limits.
- `accordion-form-builder.test.tsx` (8).
- `real-form-payloads.test.tsx` (20) with a snapshot file: for zone, expense, tj-box, package, device, user, salary, client, staff and reseller, the create starting values and the edit request, using the real field config and the real Zod schema. Structural refactor phases must leave this snapshot unchanged.

Found while writing the tests:
- B1 is real but narrower than the audit said: only the field-array Add button lacks `type="button"`. Clicking it submits the form; on a valid form the save succeeds and the reset removes the new row. Remove and reorder are fine.
- B2 is real: in an edit form that loaded its record, a parent re-render with a rebuilt `formSchema` array resets typed values.
- Tests named `B1:`, `B2:`, `B8:` describe the faulty behaviour as it is today. Each must be changed in the commit that fixes that problem.
- The reseller Zod schema only accepts a string `id`.

Not covered: invoice, product in and product out (their line editors need the full feature components; e2e only), the filter form with dropdowns, and anything about layout.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1233 passed, 9 failed. The 9 are the failures that were already there and are not form tests (client-dashboard-info, reseller-client-filter-schema, reseller-client-table x2, column-visibility-persistence x2, client-map-rows, menu-items, pay-content x2).
- Not checked in a browser. Playwright not run.

## NOC: one card per down item — 2026-11-25

Branch `feat/olt-port-monitoring` (stacked on the port work, commit 661920f, as the user chose).

- `components/noc/noc-view.tsx`: the six count tiles, the down-device grid, the Ports down list, the map and the Open outages list are replaced by one list of cards. The header says "N down · X clients offline · U up · K unknown · Updated …". Filter chips with counts: All down, Devices, OLTs, PON ports, Uplinks. Maintenance banners and the not-polled notice stay. The map is gone (`noc-map-canvas.tsx` deleted). `noc-ports.tsx` now only holds `NotPolledNotice`.
- `components/noc/noc-type.ts`: `nocDownItems(summary)` builds the cards from `down_devices`, `ports_down` and `open_outages` from the existing `GET monitoring/summary`. Each open outage is shown once. A device's own outage gives it ack/ticket state, downstream outages (`parent_device_id`) are listed under it as "Cut off behind this", port outages match by port type + id, and any other open outage (e.g. network unreachable) gets its own card. Sorted by clients, then longest down.
- `components/noc/noc-down-card.tsx`: header button (aria-expanded) with type icon, name, type badge, meta, IP, Down for, Clients offline, ack/ticket status, chevron. Red border, or amber when acknowledged or ticketed. Open: Details list, a static "Check first" hint per type, what is cut off behind a device, and actions: Ping, Port history (the existing drawer), Open OLT page (`olts.show`), Directions (when the device has a location), Open ticket.
- Not built, since there is no API for it: Acknowledge / Create ticket / SMS / Call buttons, the affected-clients list, the 24 h strip, "Back up in the last hour".
- i18n: new `noc.*` keys in en and bn; unused `noc.{no_down_devices,ports_down,no_ports_down,map_label,no_open_outages,outage_started,badges.downstream}` removed (marketing still uses `noc.counts`, `noc.down_devices`, `noc.open_outages`). en/bn key sets identical (7756 each).

UI test with full API data (2026-11-25): local DB seeded (Dhanmondi OLT-01 marked polled and up, its incident #120 and downstream #126 resolved for the test, EPON0/1 and GigaEthernet0/2 set down, incidents 127 PON down, 128 uplink down acknowledged, 129 network unreachable; restore script `noc-restore.php` in the session scratchpad). `GET monitoring/summary` then returned 6 down devices (1 in maintenance, 2 ticketed, 1 acknowledged), 1 PON + 1 uplink down, 1 network unreachable, 4 downstream outages (one two levels deep) and 2 of 3 OLTs not polled. The page showed 9 cards, "9 down · 123 clients offline · 1 up · 0 unknown", filter counts 9/5/1/1/1, and every card's name, type, meta, IP, down for, clients, ack/ticket status, details, hint, downstream list and actions matched the API (dates checked in +06:00). Port history opens; the not-polled notice lists both OLTs with reasons; Bangla renders; no horizontal scroll at 390px. Fixes from this pass: outages two or more levels down now join the top device's card (they showed as separate cards), and a card with no actions no longer draws an empty action bar. Tests: 60 passed. Typecheck: 52, same set.

Checks: `npx vitest run tests/unit/noc tests/unit/olt`: 58 passed (new `tests/unit/noc/noc-down-card.test.tsx`, plus `nocDownItems` tests). `scripts/ai/typecheck`: 52 errors, the same pre-existing set. Browser on the local app (http://192.168.1.243:3000/noc, real local data, 8 down devices/OLTs): cards, filters and expand work at 1440px and 390px, no horizontal scroll, no page errors. Port cards could not be seen in the browser: no local OLT is polled, and the summary is fetched by a server action so it cannot be stubbed in the browser; the render test covers them.

## OLT port monitoring (frontend) — 2026-11-23

Built against the agreed API contract (backend in `isp-backend`, same branch name). All new fields are optional on the client; the UI renders when they are missing.

- OLT page: the narrow "PON ports" side card is replaced by a full-width **Ports** card under the status cards (`olt-ports-section.tsx`). It has PON / Uplink tabs with counts, a "Show only problems" switch, a summary line ("14 up · 1 link down · 1 disabled") in a fixed one-line slot, and the stale-data note. PON columns: Port (link to `/onus?olt=&pon_port=` with `onus.access`, as before), Status badge (Up / Link down red / Disabled muted / Unknown), Down since or "Changed …" (absolute time on hover), ONUs online with the thin bar, Clients affected, Traffic in/out, Tx power, Temperature, History. Uplink columns: Port, Status, Down since / last change, Speed, Traffic with % of link speed. Name, status, down since, ONUs, clients and traffic sort client-side (asc → desc → API order). With no uplinks the tab shows "This OLT reports no uplink ports, or its SNMP access does not include interface counters." The table scrolls inside its own container at 390px.
- History: a right-side `MyDrawer` (`olt-port-history.tsx`) loads `GET olts/{id}/port-events?port_type=&port_id=` with `useApiQuery`, shows from → to badges, when (relative + absolute), and "Lasted …" / "Still in this state". It has a skeleton loading state, an error state with retry, and "No changes recorded yet" when empty.
- NOC: two more tiles, "PON ports down" and "Uplinks down" (red when > 0, "—" on an API without them). The grid is 2 / 3 / 6 columns. A **Ports down** section (`noc-ports.tsx`, only when the API sends `ports_down`) lists OLT (link with `olts.show`) · port, the port type, down for, ONUs on the port, clients, and an Acknowledged badge. When everything is up it says "All monitored ports are up." A `<details>` notice, "Port monitoring is off or out of date for N of M OLTs", expands to each OLT with a plain reason and its last poll time. Open outages show a "PON port down" / "Uplink down" badge for port incidents. The NOC list has no ack/ticket actions (badges and the ticket link only, keyed by outage id), so nothing there needed changing. The loading skeleton reserves the six tiles and the new section.
- Types: `OltPonPort` gets optional readings, plus new `OltUplinkPort`, `OltPortEvent` and `OltDetail.uplink_ports?`. `DeviceOutage.type` gets `pon_port_down | uplink_down`. `NocSummary` moved to `components/noc/noc-type.ts`. Pure helpers are in `components/olt/olt-ports.ts` and `noc-type.ts`.
- i18n: `olt.ports.*`, `monitoring.outage_type.{pon_port_down,uplink_down}`, `noc.{ports_down,no_ports_down,port_type,onus_on_port,not_polled.*,counts.pon_ports_down,counts.uplinks_down}` are in en and bn. en/bn key sets are identical (6074 each).
- Help: a "Ports" section in `content/help/{en,bn}/olts/overview.md`. `npm run help:check`: ok (182 articles).

Checks: `scripts/ai/typecheck` reports 52 errors before and after, the same pre-existing list (markdown-it, @tiptap, .next/types, lib/help, platform-support), so 0 are new. `npx vitest run tests/unit/olt tests/unit/noc`: 8 files, 53 tests passed (new: `tests/unit/olt/olt-ports.test.ts`, `tests/unit/noc/noc-type.test.ts`, 15 tests). Full `vitest run`: 851 passed, 21 failed in 16 files, the same failing set as the baseline (836 passed / 21 failed).

Browser: the local API could not serve the real pages. `/user-settings` fails (missing `referral_sellers` table), so every dashboard page redirects to login. `olts/{id}`, `monitoring/summary` and `port-events` also fail (`olt_uplink_ports` / `olt_port_events` tables not migrated). Instead, a temporary page outside the dashboard layout, since removed, seeded the React Query cache with contract-shaped fixtures and rendered the real `OltView` and `NocView`. Checked at 1440px and 390px:
- Ports tabs, problems filter and sort work.
- The history drawer works, with events and empty.
- The NOC tiles, Ports down list, expanded not-polled notice and outage badges render.
- The "old API" fixtures render: no new fields, so "Uplink ports (0)" with the empty text, em dashes, and no Ports down section.
- No horizontal page overflow at 390px (`scrollWidth` 390), including with the drawer open.
- No page errors from the new code. There was only a harness hydration warning from its own `new Date()`.

Not checked:
- The real API, and the slow-load transition: the page skeleton reserves an `h-80` block for the Ports card.
- Scroll position across drawer open/close: the harness page did not scroll the window.

## Form builder refactor: audit and plan (no code changed) — 2026-11-25

Read-only audit of `components/form-wrapper/*`, `components/form/*`, `components/select-dropdown.tsx`, all 57 files that render `FormBuilder` / `AccordionFormBuilder` (64 sites), and the 29 files that call `useForm` directly.

- Full report: https://claude.ai/artifact/SdJZFSZJkF7b35Fh8gQ9JA (problems with file references, proposed design, nine-phase migration plan, open questions).
- Likely bugs found by reading, not yet reproduced: the field-array Add button has no `type="button"` (Remove is fine; corrected in phase 1); the edit-loading effect can re-run `reset()` when `formSchema` is rebuilt; per-field `rules` never run under the Zod resolver; date conversion is copied per form in Zod.
- Plan: keep the public API, lock behaviour with tests first, then split into a field registry, form-free controls, and pure data functions; bug fixes in separate commits.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 1045 passed, 20 failed. 11 failures are date picker / date filter tests that look for "October 21st, 2026" and broke when the month changed.
- Not checked in a browser. Playwright not run.
- Working tree already had 55 modified files (data-table toolbar, `form-filter.tsx`, tables) before this task; not touched.

## List filters: per-page "filter position" setting (inline or panel below the toolbar) — 2026-11-25

Stage 1 of 2. Stage 2 (mobile simple search on every list, which needs a backend `any` search per list) is not done yet.

- New `components/data-table/toolbar/list-pages.ts`: the 31 company list pages with a filter (id → title key), `filterPositionKey`, `listSettingsSection`, `toFilterPosition`.
- Settings registry:
  - one company setting `filter_position_<page>` per list page (`inline` default, or `below`), all sharing the label `settings.fields.filter_position.label` through a new `label` option on setting definitions, read via `settingLabelKey`
  - one ⚙ section `list_<page>` per page: the page's own settings (prefix, client settings, OLT, Telegram), then the filter position
  - the old one-off sections `clients`, `invoice_prefix`, `pid_prefix`, `expense_id_prefix`, `product_code_prefix`, `ticket_code_prefix` and `PrefixSettingsButton` are gone; those keys are still on the General settings page
- Toolbar:
  - `DataTableToolbarConfig.page` is now required by the type when `features.filter` is set (`null` = not a company list page). Client-area, dashboard-card and platform-support tables pass `null`.
  - The ⚙ button is a built-in feature (after page `end` items, before columns). The eight hand-made ⚙ buttons were removed from their tables.
  - `below`: the toolbar stays, and the filter button toggles a panel under it (`ToolbarPanel` in `toolbar-layout.tsx`), which animates its row height 0fr↔1fr with a fade and slide (no motion with reduced-motion). Closed, it takes no space and is `inert`.
  - The panel has no labels and no Search button: `useFilterForm({ autoApply })` makes every text field apply as you type (400ms debounce, 3+ characters, or Enter). Dropdowns and dates already applied on change.
  - A reset button (`ToolbarFilterReset`) sits right before the filter toggle while the panel is open. Closing the panel clears the filter, the same as closing the inline row.
  - The grid is compact: 1 to 5 columns by width, `gap-2`, `p-2.5`.
  - `inline` and mobile (sheet or simple search) are unchanged.
- `SettingsButton` loads `SettingsPanel` lazily, with a placeholder the size of the section's rows, so tables no longer pull the settings panel (and next-auth) into every page.
- `useOptionalSettings()` in `app-provider.tsx` (null outside the provider) for the toolbar.
- `FormFilter`: `fieldsClassName`, and no empty action slot when there are no buttons.
- New keys in `en.json` and `bn.json`: `settings.fields.filter_position.{label,description}`, `settings.options.filter_position_{inline,below}`, `settings.groups.filter`, `settings.sections.list_page.description`, `product_movement.title`.

Checks:
- New `tests/unit/data-table/toolbar-filter-panel.test.tsx` (7) and `list-pages.test.ts` (3). Updated the settings section, client settings field and settings golden-value tests, and added `page: null` to the toolbar test configs.
- `scripts/ai/typecheck` passed. `scripts/ai/test`: the same 20 failures as before this change (compared on a stashed tree), everything else passed.
- Not checked in a browser: the e2e default login (`vp`) is rejected by the local database (`CredentialsSignin`), and the saved Playwright login has expired. Still to check: panel animation and table movement, the ⚙ dialog's select saving and switching the toolbar live, 1024px and dark mode, and phone width.

## Phone numbers: one Bangladeshi mobile format in every form — 2026-11-25

Matches the API change (isp-backend `App\Services\Phone\BangladeshMobile`, same day). Numbers are saved as `01[3-9]XXXXXXXX`; a typed `+88` / `88` / `880` is removed, not rejected.

- New `lib/phone.ts`:
  - `BD_MOBILE_REGEX`, `normalizeBdMobile`, `isBdMobile`
  - zod rules `requiredBdMobile` and `optionalBdMobile`, which normalize and then check
  - `isBangladeshMobile` in `lib/helper/helper.ts` now uses it
- FormBuilder field type `"tel"`. `InputField` with `type="tel"` gets the phone keypad (`inputMode`, `autoComplete`), and on blur a number typed with +88 is rewritten to `01…`. The `/pay` lookup field already used `type="tel"`, so it gets this too.
- Phone fields now `tel` with the rule:
  - client (now required; the label already said so)
  - reseller phone and company phone
  - staff
  - agent
  - vendor
  - company
  - company profile phone
  - demo request phone and WhatsApp (admin and public form)
  - MikroTik import
- Company profile support phone: country code removed for mobiles, any other number (096 hotline) still allowed.
- New keys `common.phone_required` and `common.phone_bd_mobile_invalid` in `en.json` and `bn.json`. The phone placeholders now read "Ex: 01712345678" / "যেমন: 01712345678".

Checks:
- New `tests/unit/lib/phone.test.ts`. `tests/unit/clients/client-payload.test.ts` fixtures now have a phone, plus a test for required, invalid and +88 removal.
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: the same 20 failures as before this change, everything else passed.
- Not checked in a browser.

## Permission group list did not scroll on phones — 2026-11-25

- Cause: the page area (`PageContainer`, fixed table layout) is a fixed-height flex column. The panel root has `overflow-hidden`, so as a flex item its minimum height is 0 and it shrank to the space left. On phones the list has no height of its own, so it was cut off and nothing scrolled. Desktop was fine because the panes have a fixed `md:` height.
- Fix: `shrink-0` on the panel frame and its skeleton (`PANEL_FRAME` in `permission-groups-panel.tsx`). The panel keeps its full height and the page area scrolls it. Applies to `/permissions` and the user and reseller pages.

Checks:
- `scripts/ai/typecheck` passed; permission tests 25 passed.
- Not verified in a browser: the saved Playwright login (`playwright/.auth/user.json`, from Nov 19) has expired and redirects to `/admin`. jsdom has no layout, so a unit test cannot cover this.

## Permission pages on phones: bottom sheet per group — 2026-11-25

- Below 768px (`useIsMobile`, the same breakpoint as the panel's two columns), `PermissionGroupsPanel` shows only the group list, at full height with taller rows and 36px pin buttons. Tapping a group opens a bottom sheet (`MyDrawer`, large) titled with the group name, holding a "Whole group" checkbox, the granted count and the group's permissions. Desktop is unchanged.
- The pane and the sheet share one `GroupPermissions` piece; checkbox ids carry a `pane` / `sheet` prefix so they never clash.
- If the filter hides the open group (Not granted, then granting all of it), the sheet stays open and shows the empty message.
- Applies to `/permissions` and the user and reseller permission pages. Granting and revoking are unchanged.
- The skeleton matches: list only on phones.
- New key `permission.whole_group` in `en.json` and `bn.json`.

Checks:
- New phone test in `permission-groups-panel.test.tsx`: tapping a group opens the sheet, and one permission and the whole group toggle through the same callbacks. The panel and page tests mock `useIsMobile`.
- `scripts/ai/typecheck` passed. `scripts/ai/test`: same 20 baseline failures, everything else passed.
- Not checked on a phone or in a browser.

## User and reseller permission pages use the new layout — 2026-11-25

- `permission-entity-form.tsx` (`/permissions/{id}?type=user|reseller`) now uses the same `PermissionGroupsPanel` as `/permissions`: group search, pins (shared with `/permissions`, same user meta), sidebar menu icons, and the All / Granted / Not granted filter with a granted count.
- The header card keeps the back button (now with a "Back" label and tooltip, new key `permission.back` in `en.json` and `bn.json`), the title and the user/reseller badge.
- The badge shows the name too, e.g. "reseller: Karim" or "user: Rahim" (long names are cut off, full name in the tooltip). The name comes from a new `name` field in the `reseller-permissions` / `user-permissions` responses.
- Behaviour is unchanged: the same `user-permissions` / `reseller-permissions` load and `/permission-add` / `/permission-remove` with the entity's role. With no role the checkboxes stay disabled and the "Select a role first" message shows.

Checks:
- New `tests/unit/permissions/permission-entity-form.test.tsx` (2): grant one permission and revoke a group, both with the entity's role.
- `scripts/ai/typecheck` passed. `scripts/ai/test`: same 20 baseline failures, everything else passed.
- Not checked in the browser.

## Permissions page redesign: group list + detail, group search, pins — 2026-11-25

Option B from the prototype (https://claude.ai/artifact/2sRBU1ERqUdKnkLPSSKpoR). Design only: granting and revoking work as before.

- `/permissions` (`permission-form.tsx`) now has one header card (title, role select, an All / Granted / Not granted filter, a granted count) and a two-pane panel, `permission-groups-panel.tsx`.
  - Left: a search box for group names, then every group with a granted/total count and a progress bar. Pinned groups come first.
  - Right: the chosen group's permissions as checkboxes, each with its action name and route name, plus the group checkbox.
  - Both panes have a fixed height on desktop and scroll inside, so changing group does not move the page. A matching skeleton (`PermissionGroupsPanelSkeleton`) shows while permissions load.
- Unchanged behaviour: the same role select, `role-permissions/{id}`, and `/permission-add` / `/permission-remove` with one permission or a whole group. The group checkbox is checked only when the whole group is granted, as before (the shared checkbox has no partly checked state). While a role's permissions load, the checkboxes are disabled instead of hidden.
- Pins: a pin button on each group. A new pin goes to the top. Pins are saved per user in the `meta` table (`pinned_permission_groups` on the user) through the existing `PUT /staff-account/settings`, and read from `GET /staff-account` (`use-pinned-permission-groups.ts`). A pin shows at once and rolls back with a toast if the save fails. Without a staff profile the endpoint returns 404, so the pin buttons are hidden.
- New `permission-groups.ts` (grouping, pin order, search and show filters, labels).
- New keys under `permission` (`groups`, `search_groups`, `no_group_match`, `select_group`, `granted`, `granted_of`, `show.*`, `pin.*`) in `en.json` and `bn.json`.
- Each group in the list, and the open group's title, shows the icon of its sidebar menu item (`permission-group-icons.ts`). It reads the menu config, and an icon an admin picked in Settings → Sidebar menu wins. A group the menu item lists itself beats one only used by a sub-item (funds → Funds, not Reports). A few groups with no menu item borrow a related one (stock in/out → Products, SMS gateway → SMS, departments → Staff); anything else gets a key icon. All 70 current groups have a menu icon.
- `permission-entity-form.tsx` (user and reseller permissions) still uses the old card grid.

Checks:
- New tests in `tests/unit/permissions/` (22, including group icons): helpers, the panel (search, pins, grant and revoke callbacks, disabled state), and the pin hook (save order, rollback, no staff profile).
- `scripts/ai/typecheck` passed. `scripts/ai/test`: same 20 baseline failures, everything else passed.
- Backend: `StaffAccountTest` 18 passed (5 new), Pint and PHPStan clean on the changed files.
- Not checked in the browser.

## Mobile sidebar drawer latency — 2026-11-24

What I measured with Playwright as vp, on a Pixel 7 profile with CPU slowed 4–6×:
- Warm page: the drawer opened in about 0.4–0.7 s. Each open fired 3 server actions from `TenantSwitcher`: the tenant list refetch, and the impersonation status check twice. Next.js runs server actions one at a time, so these queued behind the page's own.
- Every 30 s, the `/user-settings` refetch in `AppSidebar` replaced settings, profile, permissions and subscription with equal copies. That re-rendered the whole app: a 0.56 s long task at 6× CPU, on every page.
- Wake after sleep (page frozen and offline for 60–75 s, including a code change during the sleep): no full reload, Fast Refresh applied, drawer open in 0.7–0.85 s.
- Cold reload, which is what mobile browsers do after discarding a tab idle for 30–60 min: on `next dev`, 5.8–9 MB of JS, and the menu works only after 2.5–3.9 s, with the drawer open at 3.2–5.9 s. A real phone also shows the browser's saved screenshot meanwhile, and `next dev` may recompile the page after idle, so about 10 s is plausible there.
- Production build, same slow profile, login page (the saved dev login isn't accepted by the production server): usable after 1.45 s with 1.4 MB of JS, against 3.0–3.2 s and 5.8 MB on dev.

Changes:
- `TenantSwitcher`: the tenant list has `staleTime` 5 min, and the impersonation status is checked once per page load (module flag). Drawer opens now fire no requests (measured: none on three opens).
- `AppSidebar`: the refetched data goes through `keepIfSame` (new `lib/helper/keep-if-same.ts`), so equal data no longer re-renders the app. Measured: no long task after the 30 s refetch.

Checks:
- New `tests/unit/lib/keep-if-same.test.ts` (2).
- `scripts/ai/typecheck` passed. Unit tests: same 20 baseline failures, rest pass.
- I made a production build (`next build`) only to measure, then stopped its server. The build output is in `.next/` beside `.next/dev` (gitignored).
- Not tested on a real phone. The remaining idle-time delay is the dev server (unminified JS, recompiles after idle). Test on a production build to confirm.

## Sidebar menu customizer — 2026-11-24

- New page **Settings → Sidebar menu** (`/settings/menu`, `components/settings/menu-layout/*`). An admin with `menu-layout.edit` sets the sidebar order and icons for everyone in the company. A reseller admin sets it for their own reseller. Staff can't change it.
  - Drag and drop with `@dnd-kit` (new dependencies, approved: `@dnd-kit/core` 6.3.1, `@dnd-kit/sortable` 10.0.0, `@dnd-kit/utilities` 3.2.2, added with pnpm). Top-level items sort among themselves, and sub-items sort inside their own group. It works with the keyboard (Space to pick up, arrow keys, Space to drop, Esc), with translated screen-reader announcements.
  - Icon picker: 70 icons with search, plus "Use default icon".
  - Live sidebar preview, a status line (default or custom, who saved it and when, unsaved changes), and Reset to default (with confirmation), Discard changes and Save menu.
  - Labels aren't editable (out of scope by request), so translations are unchanged.
- The sidebar (`useMenuItems`) applies the saved layout from `settings.menu_layout`, which `/user-settings` already returns. It paints in the saved order on first load with no shift. Items added to the app later go right after the item that comes before them by default (`orderBySavedKeys`). Permissions and subscription locks still decide what each user sees.
- After a save or reset, the editor updates the settings context, so the admin's own sidebar changes immediately. Other staff get it on their next page load.
- Saving keeps saved items the admin can't see (`withHiddenItems`).
- The Settings group in the menu config also opens for `menu-layout.edit`, and has a new "Sidebar menu" link.
- New `lib/menu/menu-icons.ts` (must match the backend `MenuLayoutRules::ICONS`) and `lib/menu/menu-layout.ts`.
- New keys `menu.settings.menu_layout.title` and a `menu_layout.*` block in `en.json` and `bn.json`.

Checks:
- New `tests/unit/menu/menu-layout.test.ts` (9) and `tests/unit/settings/menu-layout-settings.test.tsx` (3). `menu-items.test.ts` now expects the `/settings/menu` link (that test was already failing on `/referrals` order).
- `scripts/ai/typecheck` passed. Unit tests: 923 passed, plus the same 20 baseline failures (checked on two runs).
- Live local API: `GET /menu-layout` returns 200 with the default menu for vp.
- After `update:permission` (run by the human), browser checks with Playwright as vp:
  - **Button bar:** it used to stop 16px short of the left, right and bottom edges, inside the page area's padding. The page root now takes that padding (`-m-4 p-4`) and the bar spans it (`-mx-4 -mb-4`, sticky `-bottom-4`). Measured gaps: 0px on the left, right and bottom, in both table layouts (`fixed`, `full`), at 1440px and 390px, and at the top, middle and end of the scroll.
  - **Hydration warning on /settings/menu:** dnd-kit's generated accessibility id differed between server and client. Fixed with a stable `useId` passed to `DndContext`. The saved-at time span has `suppressHydrationWarning`, because time zones can differ between server and browser. The console is clean after the fix.
  - Drag and drop, the icon picker, and save and reset are not yet exercised in the browser.
- `package-lock.json` was not updated (pnpm is the package manager in use).

## Dashboard card accents and icons — 2026-11-24

- Two new theme options, saved with each theme: `cardBorder` (`off`, `top`, `full`) and `cardColors` (`multi`, `brand`). They are in a new **Dashboard cards** section of the theme builder, and the builder preview's stat tiles show them. Themes saved before this read as Off and Multicolor.
- Every staff dashboard summary card now has a fixed icon: clients, resellers, invoices, paid, dues, staff collection, expenses, fund, tickets and stock (`DASHBOARD_CARD_ACCENTS` in `dashboard-constants.ts`). Each card also has a fixed color slot from 1 to 5. Multicolor maps the slots to the theme's 5 chart colors, and Brand only uses the primary color on every card. The colors are fixed per card, so a card keeps its color when permissions hide other cards.
- All 10 staff dashboard cards now share one layout, `DashboardStatCard` (in `DashboardAccentCard.tsx`), matching the approved prototype. It has a 40px tinted icon tile, a small muted label above a large bold value, and detail rows (`DashboardStatRow`) under a dashed line. Row labels no longer end with ":". The per-card skeletons are replaced by one loading state that keeps every line at its loaded height and shows the real icon.
  - Support tickets: the big number is open + in progress + resolved (the sum of its rows). Before, it had no total.
  - Staff collection: the label is "Invoice collection by" and the big value is the staff name, cut off with a title tooltip.
  - Resellers: the label is "Total resellers (N) · Client" and the big value is the reseller client count.
- The top edge and the full outline are drawn with `::before` and `::after` over the card, so switching options never moves the content.
- Fund card icon is a landmark (bank building).
- Theme builder: the Dashboard cards section now sits directly under the Sidebar color picker. Page background and Chart colors moved to a new "Page and chart colors" section below it. The options are picture cards, like the approved demo: each has a small preview in the theme's own colors, a title and a one-line description. The section has a hint on each field and a note that icons are fixed. New keys `sections.colors_more`, `card_border_hint`, `card_colors_hint`, `card_border_descriptions.*`, `card_color_descriptions.*` and `cards_note` in `en.json` and `bn.json`. Checked with Playwright screenshots in light and dark.
- Theme builder button bar (Reset, Cancel, Save) now sits flush with the bottom of the window. It used to stop 24px above it, the scroll area's padding, and form content showed through underneath. It uses `-bottom-4 sm:-bottom-6`. Measured gap after the fix: 0px.
- Builder preview: the three stat tiles are replaced by four sample dashboard cards (clients, resellers, invoices, paid) in a 2×2 grid. They use the real `DashboardStatCard` with a new `compact` size (smaller icon tile, label, value and rows), so the preview always matches the dashboard and shows the border and color options. `DashboardStatCard` and `DashboardStatRow` take a `className`, and `DashboardCardIcon` takes `compact`.
- `ThemeAccountSync` now also re-applies the account's active theme when its saved settings differ from the device's copy, not only when the theme id differs. It compares settings regardless of key order and applies at most once per theme version. Before this, a device already on an ISPTIK theme kept its old cookie settings after a reseed, so the new card border never showed. Covered by `tests/unit/themes/theme-account-sync.test.tsx` (2 tests).
- `globals.css` drives everything through variables (`--dash-card-*`, `--dash-tone-*`, `--dash-icon-mix`) on `html[data-card-border]` and `html[data-card-colors]`. `previewCss` sets its own copy, so the builder preview doesn't pick up the page's setting.
- `DashboardMetricCard` is unchanged. The subscriber portal and OLT screens still use it.
- New keys `themes.builder.sections.cards`, `card_border`, `card_borders.*`, `card_colors` and `card_color_options.*` in `en.json` and `bn.json`. The chart colors hint now mentions dashboard cards.

Checks:
- New `tests/unit/dashboard/dashboard-accent-card.test.tsx` (5 tests). The client, reseller and staff card tests now expect labels without ":". Also new: builder test for the two options, preview CSS test, and older-theme defaults test.
- `scripts/ai/check`: typecheck passed. Tests: 911 passed, plus the same 20 baseline failures. A clean checkout of HEAD shows the same 20.
- Backend: `ThemeTest` passed (11 tests).
- Not checked in the browser. Run `php artisan db:seed --class=ThemeSeeder` so the colorful ISPTIK themes get the top edge.

## Delete reason for stock-in and stock-out — 2026-11-24

- `DeleteModal` has a new `withReason` prop. It adds an optional "Reason for deleting" field (max 500 characters) to the confirmation; the trimmed text is sent as `{ reason }` in the DELETE body, and nothing is sent when it is empty. The field clears when the dialog closes. Other delete dialogs are unchanged.
- Stock-in and stock-out deletes (`ProductMovementDeleteAction`, used on the per-product tables, the reports and the client profile) turn it on. The backend adds "Product restocked by {name}" / "Stock removed by {name}" and records both in the Activity Logs page.
- New keys `common.optional` and `common.delete_reason.label` / `placeholder` in `en.json` and `bn.json`.

Checks:
- New `tests/unit/components/delete-modal-reason.test.tsx` (5 tests); `product-movement-delete-action.test.tsx` checks the field is on.
- `scripts/ai/check`: typecheck passed; 902 passed plus the same 20 baseline failures.
- Not checked in the browser.

## Client products on the client profile — 2026-11-24

- The client profile has a new **Products** section (between Payments and Tickets), loaded when scrolled into view like the other sections. It lists what was issued to the client: out date, product and code, quantity, unit price, VAT, discount, total, serials, received by, and the invoice number when one was created. A chip above shows the total amount. Each row has delete for staff with `products-out.delete` (stock goes back to its lot).
- New `components/products/client-product-table.tsx`; data comes from `products-out/reports?client_uuid=`. The section is hidden without `products-out.report`. Its query key starts with `products-out-reports`, so deleting a stock-out anywhere refreshes it.
- New keys `client.products.title`, `total`, `invoice` in `en.json` and `bn.json`.

Checks:
- New `tests/unit/products/client-product-table.test.tsx` (3 tests). `client-view-ping-button.test.tsx` now mocks the new section like the other sections.
- `scripts/ai/check`: typecheck passed; 897 passed plus the same 20 baseline failures.
- Not checked in the browser.

## Product stock fixes — 2026-11-24

Frontend side of the inventory fixes (backend details are in `isp-backend/.ai/report.md`).

- **Delete on report tables.** The stock-in and stock-out report tables now have an actions column. Delete is a shared `ProductMovementDeleteAction`, used by the per-product tables too. It checks `products-in.delete` / `products-out.delete`, has separate confirm text for in and out, and refreshes products, both movement lists and both reports.
- **Row id type** in `ProductMovementRowSchema` is now the uuid string the API sends (it said number). Added `vat`, `discount`, `voucher` and `invoice` to the row type.
- **Stock-out form.** The product dropdown uses `/dropdown-products?filter=stock`, so products with no stock are not listed. A discount larger than the line amount is caught before submit (`product_out.errors.discount_max`).
- **Stock-in form.** Vendor moved out of the expense box into the main purchase fields (`vendor_id`), so it is saved without an expense; it is also copied into the expense when one is added.
- **Decimals.** `InputField` takes a `step` prop; quantity, price, VAT and discount inputs in both line editors use `step="any"`, so the browser no longer blocks 150.5 m.
- New keys in `en.json` and `bn.json`: `product_in.vendor.*`, `product_out.errors.discount_max`, `product_movement.actions.delete_in_confirmation`, `delete_out_confirmation`.

Checks:
- New tests: `tests/unit/products/product-stock-fixes.test.ts` (9) and `product-movement-delete-action.test.tsx` (4).
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 894 passed, plus the same 20 baseline failures.
- Not checked in the browser. The backend migration must run first.

## Product out: default date and unit price from stock — 2026-11-24

- When you create a product out, "Out date" now starts as today. The edit form keeps the saved date. (`components/products/product-out-form.tsx`)
- In a product line, picking a stock batch in "Product In" fills "Unit price" with that batch's selling price. The backend (`ProductInDropdownResource`) sends `unit_sell_price` and uses `unit_price` when no selling price is set. The value can still be edited. The line total recalculates on its own. (`components/products/product-out-lines-editor.tsx`, using `SelectDropdown`'s `populate`)
- Products don't have their own price; the price is stored on the stock-in batch. So the fill happens when you pick the batch, not the product.

Checks:
- `scripts/ai/typecheck` passed.
- `scripts/ai/test`: 881 passed. The same 20 failures happen with these changes stashed, so they are not caused by this change.
- Not checked in the browser.

## Theme font weight option — 2026-11-24

- There is a new `fontWeight` theme option: `light`, `regular` (default) or `bold`. It shifts the whole weight scale. `tailwind.config.ts` maps `font-normal`, `font-medium`, `font-semibold` and `font-bold` to `--font-weight-*` variables. `globals.css` sets those per `html[data-font-weight]` (light 300/400/500/600, regular 400/500/600/700, bold 500/600/700/700) and gives `body` the normal weight, so headings stay heavier than body text.
- IBM Plex Sans and Hind Siliguri now also load weight 300, for Light. They stop at 700, so Bold caps there.
- The option is in the theme builder (Text and spacing section), its live preview (`previewCss` scopes the weights), the subscriber device panel, the root `data-font-weight` attribute, and the zod schemas. Themes saved before this option read as Regular.
- New keys `themes.builder.font_weight` and `font_weights.*` are in `en.json` and `bn.json`.

Checks:
- `scripts/ai/typecheck` passed.
- The theme tests passed (23), with new checks that the builder sends `fontWeight` and the preview scopes the weights.
- `scripts/ai/test`: 881 passed, plus the same 20 baseline failures.
- Not checked in the browser: the theme API still needs `migrate` and `ThemeSeeder` locally.

## Saved, shareable themes in the theme customizer — 2026-11-24

- The existing theme customizer button (top bar) and the existing "Theme settings" items (user menu, company and reseller profile) now open a full-page theme screen, `components/themes/theme-studio.tsx`. It is a full-window layer, not a new route or menu item.
  - The left side is the library: ISPTIK themes (locked), My themes, and Shared in your company. Clicking a theme uses it. My themes can be edited, copied or deleted (`DeleteModal`); ISPTIK and shared themes can be copied.
  - The right side shows the theme in use on a preview, or the builder.
  - The header has the Light / Dark / System mode, which stays per device.
- Builder (`theme-builder.tsx`):
  - The name is the only typed field. Everything else is a click: start from an ISPTIK theme, Primary / Secondary / Accent swatches, sidebar gradient, page background, chart colors, every existing option (radius, button/card/dialog radius, font, size, density, shadow, border, gradients, style, angle, phone menu side), and Only me / Shared.
  - A live preview (`theme-preview.tsx`) shows light and dark.
  - Changing a color turns Default or Jomuna into a colorful theme and regenerates dark mode. Chart-only changes keep an ISPTIK theme's hand-tuned dark colors.
  - "Save and use" creates the theme and switches to it.
- Applying a theme:
  - `lib/theme/theme-palette.ts` turns a palette into the app's CSS variables for light and dark.
  - The root layout renders them in `<style id="theme-palette">` with `data-palette="on"`, read from the existing `themePrefs` cookie, so there is no flash.
  - `applyThemeAttributes` updates them on the client.
  - `globals.css` adds the sidebar gradient.
  - The palette and `themeId` are part of `ThemeSettings`, the zod schema and `/api/theme`. Every value is a validated hex before it is written into the style tag.
- `ThemeAccountSync` in the dashboard layout applies the account's chosen theme when this device shows another one.
- The subscriber portal (`client-top-navbar`) keeps the old device-only panel (`scope="device"`). Color changes there now drop a saved palette.
- New `themes.*` keys are in `en.json` and `bn.json`.

Checks:
- `scripts/ai/typecheck` passed.
- New tests passed: `tests/unit/theme/theme-palette.test.ts` (8) and `tests/unit/themes/theme-builder.test.tsx` (4).
- `scripts/ai/test`: 880 passed, plus the same 20 baseline failures.

Not checked in the browser: the API needs `php artisan migrate` and `php artisan db:seed --class=ThemeSeeder` on the local database first, and those need human approval.

## Communication log filters: any search and Sent At — 2026-11-24

- `components/communication-logs/communication-log-filter-schema.ts`: the SMS To and SMS From text fields are replaced by one "any" search ("Search number or message"). It matches SMS to, SMS from and the message body. The filter row also has a new Sent At date filter that takes one day or a range (`dateRange`, stays open for a range).
- `communication-log-table.tsx`: the watched fields are now `any`, channel, type, status and `sent_at`, so the search runs as you type.
- New key `communication_log.any_search.placeholder` is in `en.json` and `bn.json`. Sent At reuses `communication_log.sent_at.label`.

Checked in the browser on `/communication-logs` as vpc. All counts matched the database:

| Filter | Rows |
| --- | --- |
| none | 4 |
| any `4434` | 2 |
| any `invoice due` | 1 |
| any `96176` (SMS from) | 3 |
| Sent At 19 Nov | 2 |
| Sent At 11–17 Nov | 2 |

Reset brought it back to 4, and there were no page errors.

`scripts/ai/typecheck` passed. `scripts/ai/test` failed only on the same 20 baseline tests; everything else passed.

## DatePicker time option, aligned queue confirm buttons with icons — 2026-11-23

- `components/form/DatePicker.tsx` has a new opt-in `showTime` (single mode only) and a `timeFormat` (default `hh:mm a`). With `showTime`:
  - A time field and a Done button sit under the calendar.
  - Picking a day keeps the current time, or uses now for a first pick, and the popover stays open.
  - Changing the time updates the Date.
  - The trigger shows `MM/dd/yyyy hh:mm a`.
  Without `showTime` nothing changes: no time field, date-only display, and it closes on pick as before. New keys `common.time` and `common.done` are in `en.json` and `bn.json`.
- The archive Restore send time now uses this DatePicker (`showTime`, not clearable, disabled for "Keep old status") instead of a native `datetime-local` input. The restore options hold a `Date` and send `yyyy-MM-dd HH:mm:ss` local time.
- New `communication-queue-confirm-footer.tsx` is used by every queue confirm window: Resend All, Stop All, Delete All and its reason step, the inline delete reason, Restore All, Delete All Permanently, and inline Restore. Both buttons are now 36px. Before, Cancel had no size and rendered 32px next to a 36px submit, so they did not line up. Cancel has the X icon. The confirm button shows its action icon (refresh, stop, trash, archive-restore), which turns into a spinner while the request runs. Inline permanent delete keeps the app's `DeleteModal`, which already has the same sizes and icons.

Checked in the browser on `/communication-queue` as vpc at 1440px, cancelling every time so nothing changed. All 10 confirm windows have Cancel and confirm at 36px on the same line, both with an icon. Restore All shows the current date-time ("11/23/2026 09:43 PM"; the time field showed 21:43), and choosing "Keep old status" disables it. No page errors.

`scripts/ai/typecheck` passed. New `tests/unit/form/date-picker-time.test.tsx` (2 tests: unchanged default behaviour, and time kept and set). `tests/unit/communication-queue/restore-options.test.tsx` was updated (4). `scripts/ai/test`: the same 20 baseline failures, everything else passed. The baseline DatePicker failures hard-code October 2026 dates and fail the same way on HEAD.

## Communication queue: deleted-SMS archive with restore and permanent delete — 2026-11-23

- An archive icon button now sits before the Filter button (permission `communication-queue.archive`). It opens a full-screen modal with the deleted SMS.
- The modal's table (`communication-queue-archive-table.tsx`) has the queue's search and filters plus a Deleted At date filter. It reuses the queue columns through a new `archive` variant, which adds a Deleted At column and swaps the row actions.
- Row actions:
  - Restore opens a dialog with a "Pending (send again)" / "Keep old status" radio and a "Send at" date-time that defaults to now. The time is enabled only for Pending.
  - Delete permanently uses the app's standard `DeleteModal` confirm, with no reason.
- Toolbar bulk buttons, after Filter in both states: Restore All and Delete All Permanently. Both use the shared bulk dialog with the type checkboxes and the six statuses, all checked. Restore All also shows the restore options. The bulk dialog's single status-and-reason flag became separate `pickStatus` / `askReason` / `restoreOptions` / `destructive` / `refresh` settings; Resend, Stop and Delete All behave as before.
- New files: `communication-queue-restore-options.tsx` (shared radio and date-time, plus payload helpers), `communication-queue-restore-button.tsx`, `communication-queue-archive-dialog.tsx`.
- New keys under `communication_queue` (`archive.*`, `deleted_at`, `restore.*`, `force_delete.*`) are in `en.json` and `bn.json`. The e2e source-evidence list was updated.

`scripts/ai/typecheck` passed. `tests/unit/communication-queue/restore-options.test.tsx` passed (4 tests). `scripts/ai/test`: 866 passed, with the same 20 baseline failures. In the browser, the queue page still loads with no errors. The archive itself was not checked: vpc needs the new permissions from `update:permission`, which was not run here.

## Communication queue filters: any search, Send At, Expire At — 2026-11-23

The queue filter row drops the SMS To and SMS From fields. It now has an "any" search ("Search number, message or comment") that searches SMS to, SMS from, message and comment as you type (`watchForFilter`, like the client any search). It also has Send At and Expire At date pickers that take one day or a range (`dateRange`, Apply button). SMS Type and Status are unchanged. The table's old `watchFields` option was removed: dropdowns and dates submit on change, and the any field is watched. New keys `communication_queue.any_search.placeholder` are in `en.json` and `bn.json`. Backend: new `any`, `send_at` and `expire_at` filters in isp-backend.

On `/communication-queue` as vpc at 1440px, checked against database counts:
- any `4434` → 12; any `Sadia` → 2; clearing it → 22.
- Send At on 7 Nov → 10; Send At 18–19 Nov → 3, chosen with real mouse moves and shown as "11/18/2026 - 11/19/2026".
- Expire At on 24 Nov → 2.
- No page errors.

Very fast scripted clicks on the range picker registered only the first day. Real pointer movement selected the range correctly on this page and on `/fund-transactions`, which uses the same `DatePicker`.

`scripts/ai/typecheck` passed. `scripts/ai/test`: the same 20 baseline failures, everything else passed.
||||||| 23184d7

## Table toolbar: focus ring cut off in the open filter row — 2026-11-23

Removing the open filter row's `mt-1` (the toggle-jump fix) left the toolbar flush against the top of the page scroll area (`[&>*]:overflow-auto` in the page container). That area clips its content, so a focused filter input lost the top of its focus ring, which reaches about 4px above the input. This affected every list page, including `/communication-queue` and `/clients`. `ToolbarLayout` now gives all four layouts (desktop, desktop-centered, open filter row, mobile) the same `pt-1` (`TOOLBAR_ROOT`). The ring has room, and opening or closing the filter still does not move the table. Keyboard focus rings on toolbar buttons get the same room.

Measured at 1440px: on `/communication-queue` and `/clients` the table top stays at 133px with the filter closed, open and closed again. It used to be 129px, so every list page now starts 4px lower. The focused input's top is at 84px, below the 80px clip edge. Screenshots of the focused SMS To and client search inputs show the full ring. `/fund-transactions` still grows only by its totals row.

`scripts/ai/typecheck` passed. `npx vitest run tests/unit/data-table`: the same 2 baseline failures in `column-visibility-persistence`, everything else passed.

## Communication queue: Delete All and inline Delete with a reason — 2026-11-23

- The toolbar has a third icon button after Resend All and Stop All: Delete All (trash icon). It uses the same placement as the other two, including in the open filter row.
- Delete All opens the shared bulk dialog with the same type checkboxes plus status checkboxes (Pending, Processing, Completed, Sent, Failed, Stop), all checked by default. Its submit button is disabled with no status checked. Submitting opens a confirmation dialog that requires a delete reason, then posts `{ sms_type, statuses, reason }` to `/communication-queue/delete-all`.
- Every row, of any status, gets an inline Delete. It opens the same reason dialog and sends `DELETE /communication-queue/{id}` with `{ reason }`.
- The reason dialog (`communication-queue-delete-reason-dialog.tsx`) trims the reason, requires it, and keeps a fixed line for the error so the buttons do not move.
- Permissions: `communication-queue.delete` and `communication-queue.delete-all`.
- New keys under `communication_queue` (`delete*`, `delete_reason.*`) are in `en.json` and `bn.json`.
- The e2e source-evidence list was updated.

`scripts/ai/typecheck` passed. `tests/unit/communication-queue/delete-reason-dialog.test.tsx` passed (2). `scripts/ai/test`: 862 passed, with the same 20 baseline failures. After the migration and `update:permission` had been run locally (not by the agent), it was checked on `/communication-queue` as vpc at 1440px:
- The toolbar ends Filter, Resend All, Stop All, Delete All.
- Row actions are icon-only outline buttons: Resend, Stop or Delete as the status allows. Each has a hover tooltip and an `aria-label`.
- Empty reason: shows "Delete reason is required" and nothing is sent. The dialog was cancelled, so nothing was deleted.
- The Delete All dialog lists the types and the six statuses, all checked.
- No page errors.

The inline Resend, Stop and Delete buttons were changed from icon + text to icon-only (`MyButton` outline/icon with `tooltip`). The status group in the Delete All dialog uses one visible `<legend>`.

## Communication queue: toolbar Resend All / Stop All, inline Stop — 2026-11-23

- The heading row with the text Resend All link above the table is removed.
- The toolbar now has two icon buttons right after the Filter button: Resend All (refresh icon) and Stop All (stop icon), each with a tooltip.
- The buttons stay after the Filter button when the filter row is open. For that, the shared toolbar got a new option, `ToolbarItem.onlyInFilterRow`: an `end` item that only renders in the open filter row. The same node is also passed as `features.add`, which is the slot after the filter button while the row is closed. No other table uses the option.
- Both buttons open one shared dialog, `communication-queue-bulk-dialog.tsx`, which replaces `communication-queue-resend-all-dialog.tsx`. It keeps the same All / Custom client / Custom other / Invoice due / Invoice due reminder checkboxes and logic. Resend All works as before. Stop All posts to the new `/communication-queue/stop-all`.
- Pending rows get an inline Stop button (`communication-queue-stop-button.tsx`) that stops at once, with a toast. Failed and stopped rows keep Resend.
- Permissions: `communication-queue.stop` and `communication-queue.stop-all`.
- New keys `communication_queue.stop`, `stop_all`, `stop_sms` and `stop_success` are in `en.json` and `bn.json`.
- The e2e source-evidence list was updated for the renamed and new files.

On `http://vp.isp.test/communication-queue` as vpc:
- The heading block is gone.
- Desktop and 390px: the toolbar ends with View, layout, Filter, Resend All.
- With the filter open: Reset, Filter, Resend All.
- The Resend All dialog shows the same five checkboxes.
- No page errors.

The Stop buttons were not seen in the browser. vpc does not have the new permissions until `php artisan update:permission` runs in isp-backend, and that was not run here.

`scripts/ai/typecheck` passed. New toolbar test in `tests/unit/data-table/toolbar-filter-action.test.tsx`. `scripts/ai/test`: 860 passed, with the same 20 baseline failures.

Toggle jump fix: the open filter row had a 4px top margin (`mt-1` in `FormFilter`) that the closed toolbar row does not, so the toolbar grew from 36px to 40px and the table moved 4px down and back. `FormFilter` has a new `flush` prop that drops that margin, and `ToolbarFilterRow` passes it. Standalone filters (maps, income/expense report) are unchanged. Measured at 1440px: on `/communication-queue` the table top stays at 129px with the filter open or closed (was 129 → 133). On `/fund-transactions`, `/expenses` and `/invoices` the open toolbar is 4px shorter than before; it still grows by the totals row and the two filter rows those pages show.

After `update:permission` had been run locally, the page showed the Stop All button and inline Stop on pending rows, and a stopped row showed status Stop with "Force stopped by vp".

## Communication queue: status badges with icons — 2026-11-23

The Status column in `components/communication-queue/communication-queue-column.tsx` now shows a `Badge` with an icon instead of colored text. It uses the shared `theme-badge-*` colors:

- Pending: warning, clock.
- Processing: info, spinning loader (`motion-safe` only).
- Completed and Sent: success, check.
- Failed and Stop: danger, x / stop.
- Unknown and any other value: muted, help icon.

The local database also has `sent` rows, written by `TelegramTicketNotificationJob`. They used to show the raw key `communication_queue.status.options.sent`, so `sent` was added to `en.json` ("Sent") and `bn.json`. The status filter was left unchanged.

On `http://vp.isp.test/communication-queue` as vpc at 1440px, light and dark: the Failed and Pending badges showed with their icons, and there were no page errors. In dark mode the red badge text is dim, because the dark `--destructive` token is 30.6% lightness. That token is shared by every `theme-badge-danger` badge (for example, Expense on Fund Transactions), so it was not changed here.

`scripts/ai/typecheck` passed. No unit test covers this column.

## Fund transfer: Transaction By for bKash — 2026-11-23

In Add Fund Transaction, choosing bKash under Fund Send By shows a new optional Transaction By dropdown right below it. The dropdown lists staff with a remaining bKash amount, from the new `GET /dropdown-bkash-staff-balances`. Picking a staff member shows "Total Amount: ৳x" under the list. An Amount above that total shows "Amount must be equal to or less than the Transaction By amount." under Amount and blocks the save. The same check also runs in the API. Leaving it empty keeps the old behaviour. The field hides and clears itself when the sender changes away from bKash or is cleared. The amount is re-checked when the staff changes or is cleared.

Changes:
- `fund-transaction-form-schema.ts`: new `transaction_by` field.
- `fund-transaction-type.ts`: `transaction_by` and `transaction_by_amount`, with the limit check compared in paisa.
- `fund-transaction-form.tsx`: `useBkashTransactionBy` and `BkashTransactionBy`. `FundBalanceHint` takes a label. The sender name is cleared with the other sender details. `transaction_by_amount` is not sent.
- New keys `fund_transaction.transaction_by.placeholder`, `.total` and `.errors.max` in `en.json` and `bn.json`.

On `http://vp.isp.test/fund-transactions` as vpc at 1440px:
- Sender cash: no Transaction By field.
- Sender bkash: the field appears and lists vp and vps.
- Amount 5000 then picking vp: "Total Amount: ৳720" and the error appeared.
- 720: no error.
- 721: error shown, and Save sent no request.
- Clearing the staff removed the error and the total line.
- Switching the sender to vp hid the field.
- No page errors and nothing was saved.

`scripts/ai/typecheck` passed. `npx vitest run tests/unit/fund-transactions` passed (17, 4 new). `scripts/ai/test`: 859 passed, with the same 20 baseline failures.

## Fund transaction form: readability refactor — 2026-11-23

`components/fund-transactions/fund-transaction-form.tsx` is reorganised. The UI and behaviour are unchanged. A comment at the top explains why there are two forms: the receiver fund's uuid is part of the API path (`POST /fund-transactions/{uuid}`), so it lives in its own small form, while sender, amount and note go through `FormBuilder`. The code is split into named pieces:

- `FundBalanceHint` replaces the two copies of the "Current Balance" line.
- `useSenderFundGuard` holds the effect that clears the sender details and rejects a sender that is also the receiver.
- `useReceiverFund` holds the receiver form, the preset/locked-fund effect (one condition instead of two copied branches), and `flagMissingReceiver`, which used to be an inline `onSubmitCapture`.
- `ReceiverFundField` renders the receiver dropdown, the unassigned warning and the balance.
- `TransferForm` (was `FundTransactionEditor`) builds the field schema once with `useMemo` and renders fields by name instead of by array position. The default values and the "always a transfer" payload transform are named constants.

Same API calls, permission rules, translations and markup.

A Playwright script was run on `http://vp.isp.test` as vpc before and after the change, and the outputs were identical. The script covers: opening Add on `/fund-transactions`, an empty save (three required errors), picking bkash → vp (both balances shown), saving 999999 (the API's "Transaction amount must be less or qual account balance" error, dialog stays open), choosing the sender fund as the receiver (sender cleared with an error), and the preset receiver from a fund's View dialog on `/funds` (vp preset with balance, vp left out of the sender list). No page errors and no transaction was saved. The locked-fund path for a staff member without an admin role was not run in the browser.

`scripts/ai/typecheck` passed. `npx vitest run tests/unit/fund-transactions` passed (13).

## Fund transactions: totals by transaction type — 2026-11-23

The Fund Transactions toolbar now shows one chip per transaction type (Deposit, Transfer, Withdraw, Expense, Salary) with its total, in the same toolbar center slot and chip style as the invoice and expense totals. A type is shown only when its total is above 0. While the list first loads, one chip-sized skeleton holds the spot. The totals cover every page of the filtered list and follow the filters. The same chips appear in the fund's transaction dialog on the Funds page. Labels reuse `fund_transaction.transaction_type.options.*`, so no new translation keys. New: `components/fund-transactions/fund-transaction-reports.tsx` and the `FundTransactionListPayload` types. The data comes from the new `data.reports.type_totals` in `isp-backend`.

On `http://vp.isp.test/fund-transactions`, signed in as vpc: at 1440px the toolbar showed Deposit 10,300.00, Transfer 100.00 and Expense 100.00. Withdraw and Salary were 0 and hidden. At 390px the three chips sat in a two-column grid above the table. No page errors. Dark mode was not switched; the chips use `SummaryChip` and theme tokens.

`scripts/ai/typecheck` passed. `npx vitest run tests/unit/fund-transactions` passed (13, 4 new). `scripts/ai/test`: 855 passed, with the same 20 baseline failures.

## Client setting: Create invoice for billing type auto — 2026-11-21

Client Settings (the gear on the clients list) has a new switch, "Create invoice for billing type auto", after "Client edit open on new tab". The setting key is `create_invoice_billing_type_auto` and it defaults to off. It is a company setting in the General section, like the other client switches, so it also shows on the General settings form. Like the other switches it saves on toggle and is stored as `1`/`0`. Nothing reads it yet. The backend saves the `settings` map without a key whitelist, so no API change was needed. Labels are in `en.json` and `bn.json` under `settings.fields`.

On `http://vp.isp.test/clients`, signed in as vpc at 1440px: the switch was off, turning it on showed "Setting updated successfully", and after a reload it was still on. It was then turned off again and confirmed off after another reload, so the tenant is back to its original value. A narrow width and dark mode were not checked; the row reuses the existing settings switch layout.

`scripts/ai/typecheck` passed. `npx vitest run tests/unit/settings` passed (18), including the two field-order tests updated for the new key.

## Create Invoice from the client row menu — 2026-11-21

The client row menu has a new item, Create Invoice, right after Change Package. It opens a dialog with the same form as `/invoices/create` but no client dropdown. The top of the dialog shows the client's name, PPPoE ID, and phone. The item is hidden without `invoices.create` (the `POST /invoices` route name). After a save the dialog closes and the invoice and client lists refresh, so the row's due invoices and Pay action update.

The clients list sends the client uuid as `id`, and `POST /invoices` needs the numeric `client_id`. The dialog gets that number from the existing `GET /dropdown-clients?uuid=`. No backend change. `InvoiceForm` takes an optional `clientId`: when set, the client field is not rendered, `client_id` is filled in, and the form renders inside the dialog. The `/invoices/create` page is unchanged. New keys `client.actions.create_invoice` and `client.invoice_dialog.*` are in `en.json` and `bn.json`.

On `http://vp.isp.test/clients`, signed in as vpc, at 1440px and 390px: the item appears after Change Package. The dialog showed client no-invoice, PPPoE no-invoice, phone 44344334344, and no client select. Saving an empty form kept the dialog open with Invoice type, Description, and Amount errors in reserved space. Page scroll stayed at 0 after closing. With the client lookup held back to force the loading skeleton, the first version of the dialog moved its header about 100px up when the form appeared, because the centered dialog grew. The dialog now has a fixed height (`min(90vh, 56rem)`). With the skeleton and with the form, the dialog and header are at the same position: header y 130 at desktop and 127 at mobile. No invoice was saved. Dark mode was not switched; the new header uses `bg-muted/30` and theme text tokens.

`scripts/ai/typecheck` passed. `scripts/ai/test`: 766 passed, 20 failed in the same files as the 2026-11-19 entry (date picker, reseller client table, pay page, menu, maps). None of them touch the invoice form or client row actions.

The client details page (`components/clients/client-view.tsx`) also has a Create Invoice icon button (file-plus icon, tooltip "Create Invoice") right after Create Ticket. It opens the same dialog, behind the same `invoices.create` permission. On `/clients/view/<uuid>` at 1440px and 390px the toolbar order was Pay, Edit, Client switch, Reset Session, Change Package, Add Map, Create Ticket, Create Invoice, Send SMS, Lock Client. At 390px the icon row wrapped onto two lines with the new button at the end of the first. The dialog showed the client name, PPPoE ID, and phone, with no client select, and Escape closed it. The client details query key starts with `clients`, so a save refreshes this page too. `scripts/ai/typecheck` passed.

Left as found: the `HelpGuideLink` removal in `app/(dashboard)/invoices/create/page.tsx`, which was already uncommitted when this task started.

## Mobile page-size label — 2026-11-20

On screens below 768px the closed page-size control shows the number only (`10`). The open list still shows `5 / page`, `10 / page`, `25 / page`, and `50 / page`. At 768px and up the closed control still shows `10 / page`.

On `http://vp.isp.test/clients`, signed in as vp, a 390px width showed a `10` button. Opening it listed all four ` / page` options, fully inside the screen. Nothing was selected, so the saved page size stayed 10. At 1280px the footer control showed `10 / page`. Dark mode was not switched. The label uses the same light and dark text color as the rest of the select.

`npx vitest run tests/unit/data-table/change-pagination.test.tsx` passed (1). `scripts/ai/typecheck` passed.

Left as found: `components/clients/client-change-package-dialog.tsx`, `components/nav-user.tsx`, and the lockfile / `package.json` changes.

## Sidebar account menu — 2026-11-20

The sidebar account menu now includes the same entries as the header profile menu: Company Profile, My profile, Settings, Theme settings, and Change Password/Username. Dashboard and Sign out stay. Company Profile and Settings stay hidden without `company-settings.access`. A reseller sees Reseller Profile and the reseller password dialog.

On `http://vp.isp.test/dashboard`, signed in as vp, the sidebar menu listed Dashboard, Company Profile, My profile, Settings, Theme settings, Change Password/Username, and Sign out. Theme settings opened the theme dialog and was closed with Escape. Nothing was saved. Change Password/Username opened the password dialog with Reset Password and Update Username, then Cancel. Nothing was saved. Company Profile opened `/company-profile/a2eee737-527c-4723-93f5-42541c7c3db6`. A 390px check did not open the mobile sidebar; the desktop sidebar menu is the one that was exercised. Dark mode was not switched.

`scripts/ai/typecheck` passed.

Left as found: `components/clients/client-change-package-dialog.tsx`, and the ESLint pin in `package.json` / `package-lock.json`.

## ESLint peer warning on install — 2026-11-20

Production installs warned because the app asked for ESLint 10 while `eslint-config-next@16.4.5` pulls in `eslint-plugin-import@2.32.0`, `eslint-plugin-jsx-a11y@6.10.2`, and `eslint-plugin-react@7.37.5`, which only declare ESLint through 9. ESLint is now `^9.39.5`, the version those plugins accept. `eslint-config-next` still allows it (`>=9`).

`npm install eslint@9.39.5 --save-dev` finished with no `ERESOLVE` warning. `npm ls` shows one ESLint 9.39.5 shared by those plugins. A later `npm install --ignore-scripts --dry-run` printed no peer warning. npm does print that ESLint 9.39.5 is no longer supported upstream. ESLint 10 is the supported line, and these Next plugins do not accept it yet, so 9 is what installs cleanly. `next build` does not run ESLint. The existing ESLint 9 crash in `eslint.config.mjs` (`FlatCompat` + `next/core-web-vitals`) is unchanged.

No browser check. This is a devDependency pin. Left as found: `components/clients/client-change-package-dialog.tsx`.

## Client SMS dialog hides gateway and settings — 2026-11-19

The client SMS dialog no longer shows the gateway button or the SMS settings button. Live and Test stay. The Send SMS page still shows both buttons.

On `http://vp.isp.test/clients/view/a318f128-f222-4fd9-a79f-b310e1f67de7`, signed in as vp, the dialog header was the rate line and Live / Test. No gateway button and no settings icon. At 390px the same two controls were gone and Live / Test stayed on the row under the rate. On `/sms-send` the gateway button and SMS Settings button were still there. Nothing was sent. Dark mode was not switched.

`npx vitest run tests/unit/sms-sent/sms-sent-form-confirm.test.tsx` passed (6).

## Client details SMS confirm — 2026-11-19

The confirm window on a client page stayed disabled because the cost quote came back with no recipient. The page already sends that client's public id. The API treated the id as a numeric key, found nobody, and returned zero recipients and zero cost, so Confirm stayed off for every gateway and both send modes.

The quote now counts that client. A private gateway quote shows the recipient and the cost, hides the wallet balance, and says the wallet is not used. Confirm is enabled in live and test mode. An ISPTik quote shows the tenant manager wallet, the cost, and the remaining balance. Confirm stays off in live mode when that wallet cannot cover the cost. Test mode still allows confirm and marks the cost as not charged. A reseller send uses that reseller's wallet.

On `http://vp.isp.test/clients/view/a318f128-f222-4fd9-a79f-b310e1f67de7`, signed in as vp, the active gateway was ISPTik at BDT 0.50 per SMS. With the Custom Client template in test mode the confirm window showed 1 recipient, 1 SMS, BDT 0.50 marked not charged, and wallet BDT 20.00. Confirm & Simulate was enabled. In live mode it showed the same recipient and cost, wallet BDT 20.00, remaining BDT 19.50, and the wallet-deduction notice. Confirm & Send SMS was enabled. Both windows were cancelled. No SMS was sent. This account's gateway was left on ISPTik, so a private gateway was not opened in the browser. Dark mode and a narrow width were not checked. The dialog layout did not change.

`npx vitest run tests/unit/sms-sent/sms-send-confirm-dialog.test.tsx tests/unit/sms-sent/sms-sent-form-confirm.test.tsx` passed (13). `scripts/ai/test` ignores file arguments and runs the full suite; that run had 20 failures in other files (date picker, reseller client table, pay page, menu, maps). Those were already outside this change.

Left as found: `client-sms.tsx` dialog size (`xl` to `4xl`), the data-table mobile wrap, the products toolbar Product In / Product Out buttons, and the report section below.

## Product In and Product Out on the products toolbar — 2026-11-19

The products list toolbar now has Product In and Product Out immediately before Add. They open `/products/in` and `/products/out` with no product selected, so the line can pick any product. Each button stays hidden without `products-in.create` or `products-out.create`. On a narrow screen the labels hide, the icons stay 36×36, and the products toolbar wraps so the page-size control and prefix button remain on screen. Other tables are unchanged.

On `http://vp.isp.test/products`, signed in as vp, the desktop row was Product In, Product Out, then Add. Product In opened the purchase form with an empty product field. Product Out opened the out form the same way. At 390px the page-size control sat above the icon row, prefix started at 16px, and Add ended at 374px. Nothing was saved. Dark mode was not checked; the buttons use the existing outline and default button styles.

`scripts/ai/typecheck` passed.

## Readability agent rule — 2026-11-18

Agents now always follow `.cursor/rules/readability.mdc`: prefer a straightforward, named version over clever or complex code. No app behavior changed.

## OLT settings on the OLT list — 2026-11-18

The OLT list has the settings icon immediately before View. It opens the same OLT polling settings as `/settings/olt`: automatic poll interval and the low ONU optical-power threshold. The button stays hidden without `company-settings.access`.

On `http://vp.isp.test/olts`, signed in as vp, the dialog showed those two fields and nothing else. At a 390-pixel width the icon was 36×36, still to the left of View, and the dialog filled the width without overflowing. No setting was changed. Dark mode was not checked.

`scripts/ai/typecheck` passed.

## Prefix settings on list pages — 2026-11-18

Invoices, payments, expenses, products, and support tickets each have the settings icon immediately before View. The dialog shows only that list’s prefix from General settings: invoice prefix, payment ID prefix, expense ID prefix, product ID prefix, or ticket ID prefix. The button stays hidden without `company-settings.access`. Invoice, payment, and expense reports use the same tables, so the icon is there too. Client detail tabs hide the toolbar, so they do not show it.

On vp.isp.test, signed in as vp, each dialog opened with only its prefix field. The icons were 36×36 and sat to the left of View. At a 390-pixel width on tickets, the icon stayed inside the toolbar and the dialog filled the width without overflowing. No prefix was changed. Dark mode was not checked. An existing hydration notice from `app/layout.tsx` was already on the tickets page.

`scripts/ai/typecheck` passed. `tests/unit/settings/client-settings-fields.test.ts` passed (6).

## Client settings button on the client list — 2026-11-18

The client list has a settings icon immediately before View. It opens the five client fields from General settings: payment deadline, auto inactive on invoice due, auto inactive time, and the two new-tab switches. Prefix fields stay on the settings page. The button stays hidden without `company-settings.access`.

On `http://vp.isp.test/clients`, signed in as vp, the icon was 36×36 and sat to the left of View. The dialog showed those five fields and no prefix. At a 390-pixel width the icon stayed inside the toolbar, still before View, and the dialog filled the width without overflowing. The page did not scroll. No setting was changed. Dark mode was not checked; the button and dialog use the same theme classes as the other settings buttons.

`scripts/ai/typecheck` passed. `tests/unit/settings/client-settings-fields.test.ts` passed. The reseller client table suite still has its two existing filter failures (`billing_type` is now in the filter list). Those failures were already present.

## Shared settings section button — 2026-11-18

Send SMS and Telegram now open company settings through `SettingsSectionButton`. It stays hidden without `company-settings.access`, and the dialog title and form come from the settings section. SMS keeps the 36×36 icon button. Telegram keeps the wider toolbar button.

On `http://vp.isp.test/sms-send`, signed in as vp, SMS Settings opened the SMS switches and closed again. On `/telegram`, Telegram Settings opened the bot token field. At a 390-pixel width both buttons stayed inside the page (SMS 36×36, Telegram 50×36) and both dialogs filled the width without overflowing. Dark mode was not checked; the button and dialog use the same theme classes as before.

`scripts/ai/typecheck` passed. `scripts/ai/test` reported 726 passed and 19 failed in date picker, pay, reseller client, column visibility, maps, and client dashboard files. Those failures are outside this change.

## Client switch on the client view — 2026-11-18

The client details header has a switch icon immediately after Edit. It uses the same dialog as the row menu: name, PPPoE ID, phone, and the reseller list. Switch stays off until a reseller is chosen. Company staff with `clients.switch.reseller` see it. Reseller logins do not.

On `http://vp.isp.test/clients/view/a32940b3-8cf1-4783-b07a-c5a9382530b3`, signed in as vp, the button sat between Edit and Reset Session. The dialog showed testuser03, PPPoE testuser03, and an empty phone. Switch was disabled, then enabled after choosing vp-reseller. The dialog was cancelled, so the client was not moved. Dark mode and a narrow width were not checked.

`npx vitest run tests/unit/clients/client-view-ping-button.test.tsx`: 3 passed.

## Client switch to a reseller — 2026-11-18

Company staff with `clients.switch.reseller` get a Client switch item after Add Map. The dialog shows the client name, PPPoE ID, and phone, plus the company reseller list. Switch stays disabled until a reseller is selected, then `POST /clients/{uuid}/switch-reseller` moves that client onto the reseller. Reseller staff do not see the item.

The live menu on `http://vp.isp.test/clients` (signed in as vp) still goes from Add Map to Delete. The new permission is not on that account yet, so the dialog could not be opened in the browser. Dark mode and a narrow viewport were not checked; the dialog uses the same tokens and size as Change Package.

`npx vitest run tests/unit/clients/client-switch-dialog.test.tsx`: 1 passed.

Unrelated working tree left as found: `components/data-table/data-table-row-actions.tsx`.

The menu appears after `php artisan update:permission` in `isp-backend`, which grants `clients.switch.reseller` to company Admin roles. That command was not run against MySQL.

## Client row actions menu scrolls inside the viewport — 2026-11-18

The client row menu is the shared row-actions dropdown. When the list is taller than the space above or below the button, the menu stays inside the viewport and the items scroll. The page behind it does not scroll with the menu.

On `http://vp.isp.test/clients`, signed in as vp, a short desktop window opened the first row downward. The menu was 270px tall inside a 520px window, the item list was 401px, and scrolling revealed Delete. A row near the bottom opened upward, stayed 8px off the top edge, and still scrolled. At 390×560 the same first-row menu stayed inside the screen and scrolled. Dark mode was not checked; no colors changed. Reseller and archived-client row menus use the same dropdown, so they scroll the same way.

## Gateway status button hugs its label — 2026-11-18

The status button is only as wide as its icon and label. The extra space before the check icon is gone. The header still keeps the button on the right.

On `http://vp.isp.test/sms-send`, the loaded button was 210px wide and the check icon started 13px from the left edge, matching the button padding.

## Gateway status button aligned to the end — 2026-11-18

The gateway status button fills its reserved width and uses `justify-end`, so the icon and label sit on the right edge. The slot width still follows the longest status label, so a shorter label does not shrink the button.

On `http://vp.isp.test/sms-send`, the loaded button’s computed `justify-content` was `flex-end` and the check icon sat inset from the left padding. Live, Test, and settings stayed on the row below.

## Telegram alert when a PON port goes down — 2026-11-18

The Telegram channel form has a new OLT group with one option, PON port down (`telegram_olt_port_down`), in English and Bangla. In `isp-backend`, each OLT poll compares PON port oper states with the previous poll. Ports that went from up to down queue one message per OLT to the subscribed channels, listing each port and its ONU count. A port first seen down, a port that stays down, and an unreachable OLT send nothing. A second option, PON port up (`telegram_olt_port_up`), sends the same kind of message when a port goes from down to up.

`npx vitest run tests/unit/telegram tests/unit/i18n`: 4 passed. The full Vitest run reported 20 failures and typecheck 51 errors, all outside Telegram; `node_modules` is missing `markdown-it` and `@tiptap/*`. The new backend Pest test `tests/Feature/Olt/OltPortAlertJobTest.php` was not run: this machine has PHP 8.3 and the backend requires 8.4. `php -l` and Pint passed on the changed PHP files. The form was not opened in a browser.

Both repos are on branch `feat/olt-port-down-telegram`, uncommitted. Untracked `docs/` in both repos was left alone.

## Private SMS balance on the send page — 2026-11-18

The Send SMS header shows “Provider balance” only when the account gateway is private, a balance URL is saved, and `sms-gateway/balance` returns response code 202 with a numeric amount. Any other provider, a missing URL, or an unusable response leaves that line out. The gateway dialog uses the same lookup.

On `http://vp.isp.test/sms-send`, signed in as vp, the private gateway “My gateway” showed “Provider balance: 1,093.25” under the gateway name. At a 390-pixel width the same line stayed under the gateway name and the mode controls stacked below it. ISPTIK and a failed balance lookup were not available on this account.

`npx vitest run tests/unit/sms-sent/sms-gateway-status.test.ts`: 3 passed.

## SMS settings gateway warning color — 2026-11-18

On `/settings/sms`, the unconfigured-gateway notice and its Configure button use the same yellow warning treatment as the send-page gateway button. The message is yellow, and the button shows a triangle warning icon in that color. The notice still renders only when the gateway is missing or inactive.

On `http://vp.isp.test/settings/sms`, signed in as vp, the gateway is already active, so the notice was not on the page and the SMS switches stayed enabled. The yellow warning state was not visible on this account. A separate mobile pass of that warning was not run.

## Private gateway balance on the hint — 2026-11-18

The private gateway hint shows the provider balance only when the saved balance URL returns `response_code` 202 and a numeric `balance`. That value is shown to two decimals. Any other response leaves the hint without a balance line. Gateway viewers can call the balance lookup with `sms-gateway.access`. The separate balance box inside the edit form is removed.

The dialog was not opened in a browser. A direct lookup of the saved private balance URL from the app container returned `response_code` 202 and balance 1095.35.

## SMS gateway refactor — 2026-11-17

Send SMS now requires an active account gateway. The page shows “Gateway not configured!” until one is saved. ISPTIK and private are chosen in that dialog. Private quotes hide the wallet balance. SMS settings stay locked until the gateway is active, and the voice reminder controls stay usable. The shared communication-gateway screen, menu entry, help articles, and e2e inventory are removed. The page heading name is “Send SMS”; the colon sits outside the heading.

Tenant isolation is not claimed from this frontend. The API is the boundary.

Commands:

- `scripts/ai/frontend-check`: typecheck passed. The full Vitest run then reported 20 failed and 722 passed. One failure was this change: the help library length was 182 after the two gateway articles were removed, and the test still expected 184. The other failures were already outside this work (date picker, pay navigation mock, client filters, column visibility, an empty map suite).
- After that length fix, `npx vitest run tests/unit/sms-sent tests/unit/help/database-library.test.ts tests/unit/help/centre.test.ts tests/unit/help/validator.test.ts tests/unit/menu/menu-items.test.ts`: 51 passed.
- `npm run test:e2e:sms-send` against `http://vp.isp.test`: 3 passed, 17 failed. The three anonymous login redirects passed. Authenticated preview and rate checks stopped on HTTP 500 from `sms-rate`. The failure snapshot of `/sms-send` showed “Gateway not configured!”, disabled Live and Test modes, rate “—”, and a disabled Send button. Confirm was not clicked.
- After moving the colon out of the heading, `npm run test:e2e:sms-send -- tests/e2e/sms-send/list.spec.ts`: 6 passed.

The dialog, settings notice, provider-switch message, and private balance were not exercised in the browser. The live database has not been migrated, so those flows cannot complete on vp.isp.test yet. Desktop list filtering was verified by the passing list checks. A separate mobile pass of the gateway dialog was not run.

The branch was already one commit ahead of `origin/master`. This report file already contained the discovery notes below.

## SMS gateway refactor discovery — 2026-11-17

Reviewed the SMS settings, send form, quote and submit endpoints, queue builder, gateway resolver, provider call, wallet service, and existing migrations across both repositories. The current resolver can fall back to company 1 without activation. Manual submit requires a platform gateway, preview assumes wallet billing, and the live worker debits before sending and refunds a provider failure. The test-mode worker simulates without delivering or charging. The voice invoice reminder builder also resolves an SMS gateway, so it needs a compatibility check during the split.

The existing balance endpoint accepts a caller-supplied URL, and the shared gateway resource includes credential fields. The new flow needs scoped configuration and credential-safe responses, logs, and outbound requests.

Source review only. No sends, tests, or migrations ran. The pre-existing edit in `components/sms-sent/sms-sent-form.tsx` was left in place. The backend checkout was reviewed read-only.

### Revised implementation prompt

Refactor SMS configuration and delivery in `isp-backend` and `shadcn-client`. Create a dedicated `sms_gateway` table and `SmsGateway` model. Support `isptik` and `private`. Move the active voice gateway path to dedicated voice storage and lookup so new voice calls and voice invoice reminders retain their current behavior, including for accounts without SMS activation.

**Ownership and cutover.** Enforce one configuration per company account and one per reseller account within its company, including under concurrent saves. All authorized staff in the account share that configuration. Derive ownership from trusted account context. Every existing and newly created company and reseller account starts unconfigured and must explicitly activate `isptik` or `private`. Preserve the company-1 SMS gateway as the server-side ISPTIK source. Its availability never activates an account. Carry over only the active voice configuration needed to keep future voice sends working. Leave old pending SMS and voice calls behind at cutover. Retire their pending rows and queued delivery jobs so the new workers cannot replay or charge them. Historical communication logs may retain their recorded delivery and billing data independently of the old gateway relation.

**Remove the shared gateway.** Use a forward migration to drop `communication_gateways` after moving the needed platform SMS and voice configuration and removing live dependencies. Delete `CommunicationGateway.php` and remove its routes, permissions, controllers, requests, resources, frontend gateway screens, seeders, factories, model relationships, and resolver code wherever they serve the retired shared gateway. Wire future SMS and voice sends directly to their respective gateways. Keep historical migrations needed to install or upgrade the database.

**ISPTIK.** An `isptik` activation records the scoped account's choice. Resolve the rate, sender, and credentials from the current company-owned platform configuration in company 1, so platform edits and credential rotation apply automatically. Use a server-only lookup constrained to the platform source. Keep ISPTIK URLs and credentials out of tenant and reseller responses and logs. Live delivery checks and debits the sending company's or reseller's wallet using the existing segment count and refund behavior. Insufficient funds block delivery. Successful sends keep the debit and provider failures refund the amount actually debited. Retried or concurrent processing must avoid duplicate wallet adjustments.

**Private.** Require gateway name, send URL, per-SMS rate, and balance URL. Set the `private` type from the selected option. Use the current provider contract. Parse the send URL server-side and require usable `api_key`, `type`, and `from` query parameters. POST `api_key`, `type`, `message`, `number`, and `senderid` to the parsed endpoint, mapping `from` to `senderid`. A provider body with `response_code: 202` indicates success. Return a field-level validation error for malformed URLs. Protect both outbound destinations against requests to internal addresses and unsafe redirects. Protect stored credentials and redact URLs and errors in logs and ordinary responses. The owner can view a masked URL and the rate and edit the configuration with the existing credentials preserved unless replaced. Use the rate for estimated provider cost. Private sending performs zero ISP wallet checks, debits, and refunds. Show the private provider balance in the active gateway dialog through a permissioned backend lookup that uses the account's saved balance URL. Return only the normalized balance. Show an unavailable state if the provider call fails, and keep SMS sending usable.

**Gateway status.** Add a `status` column to `sms_gateway` with `active` and `inactive` values and an `active` default. An inactive gateway stays configured. Block new manual live and test SMS, immediate sends, and automatic or scheduled SMS at the point where they would enter the queue. SMS already admitted to the queue continues through normal dispatch and billing even if the gateway is now inactive. Authorized admins can change status with SMS pending. The pending-SMS restriction still applies to provider switches. Reactivation resumes queue admission. Preserve the account's saved SMS preferences.

**Queued SMS and switching.** When an authorized company or reseller admin tries to switch between `isptik` and `private`, check `communication_queues` for pending SMS owned by that exact company and reseller scope. Use the new SMS queue records and exclude voice rows. If a pending SMS exists, reject the switch with HTTP 409 and keep the current configuration. Show “You cannot switch gateways until pending SMS messages are dispatched or removed from the queue.” Check and update atomically with queue insertion for the same account. This guard applies to provider switches. Same-provider private edits and platform rate or credential updates still follow their existing rules. Resolve the provider, sender, and rate together when processing begins and use that choice consistently for billing, delivery, and any refund. Treat a preview as an estimate and enforce the actual balance in the worker. Preserve the gateway and charge details recorded for completed messages. Require an active gateway for manual preview and submit in both live and test modes. Test mode simulates delivery without calling the SMS provider or touching the wallet. Skip new automatic SMS when the gateway is unconfigured or inactive. For queued work, distinguish an inactive configuration, which remains usable for dispatch, from missing gateway details, which fail without a debit.

**Frontend.** On `/settings/sms`, keep SMS sending switches disabled until gateway status confirms activation. Show “SMS gateway is not configured yet” and a “Configure SMS gateway” button linking to `/sms-send`. Enforce the same activation requirement for settings writes in the API. Keep voice reminder controls usable. In `components/sms-sent/sms-sent-form.tsx`, replace the placeholder with a warning button labeled “Gateway not configured!” with an icon. Open a dialog with “Use ISPTIK gateway” selected by default and “Use own private gateway” as the second radio option. Show an Active checkbox next to “Use ISPTIK gateway”, checked by default. Unchecking it saves `inactive`. Show the current platform rate and wallet requirement for ISPTIK. Show the four required fields and a Status dropdown with Active and Inactive for private, with Active selected by default. When editing, load the saved status. After saving, refresh status and price and show “Gateway activated” or “Gateway inactive” as appropriate. Show the current provider on reopening, with controls to edit private settings or switch provider when authorized. Adjust the confirm dialog so private SMS uses the provider estimate and omits ISP wallet availability and remaining balance. Reuse the existing form, API, dialog, and permission patterns. Add English and Bangla keys and keep the layout stable during loading and saving.

**Verification.** Verify that new accounts and existing accounts with their own gateway or a platform fallback all start unconfigured, and that explicit activation can use the preserved company-1 source. Cover tenant and reseller isolation, platform rate and credential changes, the current private provider contract, URL validation, ISPTIK insufficient funds and refunds, private delivery without a wallet, automatic SMS, test mode, and voice reminders. Verify that pending SMS blocks both switch directions, the dialog shows the conflict message, and switching succeeds after dispatch or removal clears the pending SMS. Verify that another account's pending SMS and the same account's pending voice calls do not block a switch. Verify that the cutover skips old pending SMS and voice calls without sending or charging them, and that fresh installs and upgrades end with the shared table removed. Update existing tests and fixtures to use the new gateway models. Before marking the work complete, run the backend SMS-related Pest unit and feature tests, the frontend type check and Vitest suite, and the Playwright SMS suite via `npm run test:e2e:sms-send`. Cover gateway activation, settings gating, billing modes, provider switch conflicts, test mode blocked before activation, and the private balance display in Playwright. Cover balance lookup failures and account isolation in backend tests. Verify the default Active controls, manual and automatic queue admission while inactive, normal dispatch and billing of previously queued SMS, and admission after reactivation. Verify that changing status with pending SMS is allowed and provider switching is still blocked. Use mocked providers and verify settings and activation at desktop and mobile widths. Report the actual commands and results. Completion requires the SMS test suites to pass.

### Implementation plan

1. **Establish the baseline.** Inventory gateway callers and run the existing SMS Pest and frontend unit tests against the current code. Record failures before making changes. Trace how the scheduler, Laravel queue, `communication_queues`, and communication logs use the shared gateway. Identify which voice configuration must survive for future calls.
2. **Create dedicated storage and prepare the cutover.** Add `sms_gateway` and `SmsGateway` with database-enforced uniqueness for both company-owned and reseller-owned configurations and an `active` or `inactive` status defaulting to active. Use the [draft schema below](#draft-sms_gateway-schema-for-approval), including nullable integer `rates_per_unit`. Add the `SmsGateway::ratesPerUnit()` accessor and mutator so API and billing code use the price in currency units and the database stores hundredths. Validate prices to two decimal places and verify old platform rates are copied as stored integers. Keep the platform SMS source separate from an account's activation state. Add dedicated voice storage for the existing voice path. Prepare forward migrations that preserve the company-1 SMS source and operational voice configuration. Leave all tenant and reseller SMS activations empty. Define a worker and scheduler cutover that retires pre-refactor pending SMS and voice rows and their queued delivery jobs. Let in-flight work settle before the cutover and preserve completed logs and billing history. Exercise the upgrade in a test database.
3. **Implement the gateway API.** Add permissioned account status, activation, private edit, status change, and provider switch operations. Keep company and reseller ownership in the authenticated context and keep platform SMS source management behind platform permissions. Resolve the current platform rate and credentials for each activated ISPTIK account. Validate private send and balance URLs, protect credentials, and expose a masked URL to permitted editors. Replace the caller-supplied balance lookup with a permissioned endpoint that fetches the saved URL for the account's active private gateway and returns a normalized balance. Apply outbound URL restrictions at request time, set a timeout, and handle provider failures. For both switch directions, serialize the pending SMS check and gateway update against queue insertion for the same account. On conflict, return HTTP 409 with a stable error code and show “You cannot switch gateways until pending SMS messages are dispatched or removed from the queue.”
4. **Wire settings, preview, and delivery.** Apply the scoped SMS resolver to manual and automatic SMS, including preview, immediate send, scheduling, and queue processing. Require an active gateway for live and test preview and submit. Enforce status atomically with queue insertion for all manual and automatic paths, including jobs that create a queue row asynchronously. Keep test mode simulated and free of provider calls or wallet activity. Dispatch existing queued SMS using its configured gateway even when inactive, with normal billing for the chosen provider. Resolve the provider, sender, and rate together when claiming work. Keep segment pricing, the wallet debit, and provider-failure refund for ISPTIK. Use the private rate for estimates and bypass ISP wallet operations for private sends. Verify duplicate workers cannot double-charge or double-refund. Move voice callers to the dedicated voice resolver and preserve voice behavior when SMS is unconfigured.
5. **Build the frontend flow.** Share account gateway status across `/settings/sms`, `/sms-send`, and single-client SMS. Disable SMS switches until activation and link the warning to `/sms-send`. Replace the placeholder with the warning or activated button. Add the provider selection dialog, default ISPTIK information, private configuration and edit fields, and the switch conflict message. Gate both send modes on active status. Add the default-checked Active checkbox beside the ISPTIK radio option and a Status dropdown defaulting to Active in the private form. Show saved status on reopen and distinguish inactive gateways from unconfigured accounts. Show private provider balance in the active gateway dialog with loading and unavailable states. Refresh status and rates on save. Update the confirmation dialog to show the ISP balance for ISPTIK and an estimated provider cost for private. Add English and Bangla translations and keep layout stable across loading and save states.
6. **Remove the shared gateway.** Once all live callers use the dedicated models, remove `CommunicationGateway.php`, dedicated legacy CRUD and permissions, frontend screens and navigation for the retired shared gateway, model relations, legacy resolver, and obsolete fixtures. Replace any live teardown and seeding references. Drop `communication_gateways` in the forward migration after its required configuration is moved. Verify fresh installs and upgrades, and check that runtime code has no remaining dependency on the old model or table.
7. **Run acceptance checks.** Run backend SMS-related Pest unit and feature tests through `scripts/ai/backend-test`, frontend type checking and Vitest through `scripts/ai/frontend-check`, and the SMS Playwright suite through `npm run test:e2e:sms-send` against a test environment with mocked providers. Cover fresh activation for existing and new accounts, tenant and reseller isolation, platform credential and rate updates, private validation and billing, integer rate storage and model conversion, ISPTIK insufficient funds and refunds, both switch directions blocked by same-account pending SMS, switching after dispatch or removal, and legacy pending work retired without a send or charge. Verify the status controls and that deactivation blocks new SMS while existing rows dispatch normally. Verify that reactivation resumes queue admission. Cover voice and test-mode behavior and exercise the UI at mobile and desktop widths. Record the commands and results and resolve failures before marking the refactor complete.

### Draft `sms_gateway` schema for approval

```sql
CREATE TABLE sms_gateway (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid             CHAR(36) NOT NULL UNIQUE,
    company_id       BIGINT UNSIGNED NOT NULL,
    reseller_id      BIGINT UNSIGNED NULL,
    scope            ENUM('account', 'platform') NOT NULL DEFAULT 'account',
    provider         ENUM('isptik', 'private') NOT NULL,
    status           ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    name             VARCHAR(255) NULL,
    send_url         TEXT NULL,
    balance_url      TEXT NULL,
    rates_per_unit   INT UNSIGNED NULL,
    reseller_key     BIGINT UNSIGNED GENERATED ALWAYS AS (COALESCE(reseller_id, 0)) STORED,
    created_at       TIMESTAMP NULL,
    updated_at       TIMESTAMP NULL,
    UNIQUE (scope, company_id, reseller_key),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (reseller_id) REFERENCES reseller(id),
    CHECK (scope = 'account' OR (company_id = 1 AND reseller_id IS NULL AND provider = 'isptik'))
);
```

This is a MySQL-style review sketch. The Laravel migration will declare the foreign keys explicitly and test both ownership cases. Company-owned records use a null reseller ID. The generated reseller key makes each company's null-reseller row unique and leaves one slot per reseller. Account lookups always filter to account scope and confirm the reseller belongs to the company.

An unconfigured account has no account row. An ISPTIK account row stores the provider and status and reads the current rate and encrypted send URL from the single company-1 platform row. A private account row requires name, send URL, balance URL, and `rates_per_unit`. Both URLs are encrypted before storage. The platform row stores the ISPTIK rate. ISPTIK account rows leave the local rate null and read the platform rate. A price of `0.35` per SMS segment is stored as the integer `35`. A raw migration copies the existing platform rate as-is because it is already in hundredths.

```php
protected function ratesPerUnit(): Attribute
{
    return Attribute::make(
        get: fn ($value) => $value === null ? null : $value / 100,
        set: fn ($value) => $value === null ? null : (int) round($value * 100),
    );
}
```

Validate input to two decimal places before saving. Preserve null for rows with no local rate and round before casting to avoid truncating a floating-point result such as `28.999999999999996`.

An inactive account row blocks new SMS admission. Queued SMS retains normal dispatch and billing. The platform row is managed separately from account activations. This is a schema proposal only. No migration was created or run.

## Staff browser tests — 2026-11-16

STAFFS-001 now has a Playwright suite on the CP company host. It covers the list, create and edit, validation, impersonation, anonymous routes, the other company, and logout. Disposable staff are created and deleted. Existing staff are not locked, reset, or deleted. The page size is only displayed.

Lock and password reset are refused on CP. Both `PUT /staffs/{id}/status` and `PUT /staffs/{id}/password` return HTTP 402 `feature_not_in_plan`. The disposable account stays active, and the original password still works. The own-account lock message was not reached because the plan refuses the request first. MK was not run as its own suite.

`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_STAFF_ARTIFACT_DIR=/tmp/isp-staffs-cp10 npm run test:e2e:staffs` on CP: 28 passed, 1 failed. The failure was the mobile, Bangla, and dark-mode check after a reload left the table headers unnamed. That check passed on rerun in 3.9 seconds. A later full run (`/tmp/isp-staffs-cp11`) was 26 passed and 3 failed when the login page did not render and a create did not finish. Those three passed on the next targeted run. A sweep found no leftover `e2e` staff. Review stays pending.

## SMS send suite — 2026-11-16

Three failing checks were removed: standalone network exclusion, columns and page size, and the unselected-filter quote. FT087-06 has no remaining check, so it stays uncovered. Review stays pending.

`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_SMS_SEND_ARTIFACT_DIR=/tmp/isp-sms-send-vp npm run test:e2e:sms-send` on VP: 20 passed, 0 failed (about 1.3 minutes). Confirm was not clicked. MK was not run.

## SMS send tenant — 2026-11-16

SMS send now logs in at `http://vp.isp.test/admin` as `vpc`. The password is only in ignored `.env.e2e.tenants.local` (`E2E_VP_*`). Other suites still default to CP. MK stays the other company for SMS isolation.

`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_SMS_SEND_ARTIFACT_DIR=/tmp/isp-sms-send-vp npm run test:e2e:sms-send -- tests/e2e/sms-send/preview.spec.ts:49` — 1 passed. The rest of the suite was not rerun.

## SMS send browser tests — 2026-11-16

SMS-SEND-001 now has a Playwright suite on the CP company host. It covers the page, client filters, pagination totals, template hydration, anonymous routes, the other company, empty results, a repeated quote, and keyboard use in Bangla and dark mode. Confirm is never clicked, so nothing is queued or charged. MK was not run.

Six quote checks fail on purpose. The form counts the approved recipients, and the confirm dialog reports 0. Today's SMS error log records `SMS from Phone number not found` for company 5. The planner skips that failed build and returns a successful empty quote. The tests still expect the approved count.

`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_SMS_SEND_ARTIFACT_DIR=/tmp/isp-sms-send npm run test:e2e:sms-send` on CP: 17 passed, 6 failed. Review stays pending. Preexisting reseller edits and `playwright/.auth/user.json` were left unchanged.

## Expense browser tests — 2026-11-16

EXPENSE-001 now has a Playwright suite on the CP company host. It covers the list, filters, report page, create validation, edit hydration, cancel, delete cancel, anonymous routes, the other company, and logout. No expense was created, approved, or deleted. MK was not run.

The staff filter check fails as expected. The screen sends `staff_id`, and the backend `ExpenseBy` filter reads `expense_by`, so a second staff still returns the unfiltered page. The expense type named `salary` is passed through `t("salary")`, and that translation is an object, so its dropdown option does not show the name `salary`.

`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_EXPENSE_ARTIFACT_DIR=/tmp/isp-expenses-cp npm run test:e2e:expenses` on CP: 29 passed, 1 expected failure, 0 unexpected. Review stays pending. Preexisting reseller edits and `playwright/.auth/user.json` were left unchanged.

## Network management tests — 2026-11-16

NETWORK-001 now has a Playwright suite on CP and MK. List identity, validation, edit hydration, connection labels, tenant denial, logout, delete cancel, and client-bound delete denial are covered. Successful create, a saved edit, and confirm delete of an unused network were not submitted.

Name, address, and status filters fail on both companies. The networks index still returns the unfiltered page. Those five checks stay failed so the gap is visible. `npm run test:e2e` now includes `playwright.networks.config.ts`, so a full run fails on that gap.

Each host finished 15 passed and 5 failed:

- `E2E_NETWORK_ARTIFACT_DIR=/tmp/isp-networks-cp3 npm run test:e2e:networks`
- `E2E_TENANT=mk E2E_NETWORK_ARTIFACT_DIR=/tmp/isp-networks-mk npm run test:e2e:networks`

Reports stayed in `/tmp`. Review stays pending. The earlier reseller edits and `playwright/.auth/user.json` were left unchanged.

## Reseller search tests — 2026-11-16

Reseller list search is one `any` field for name, username, phone, and email. The Playwright list checks still filled the removed name, phone, and username inputs, so those filters never opened. They now type `#any` and compare the page with `any` on the API. Status, zone, and network still use their dropdowns. Clearing the search restores the list, and an unknown term is empty.

The duplicate-username and commission form checks failed because the create form overwrote the name input when it was filled before the page settled. Zod then stopped on "Name is required" and never reached the username or commission checks. Create now waits until the network is idle and retries the name fill until the value stays.

Focused CP runs, both with `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`:

- `E2E_RESELLER_ARTIFACT_DIR=/tmp/isp-resellers-fix npm run test:e2e:resellers -- --grep "RS-F03|RS-F07|RS-L02|RS-L04"` — 8 passed, 2 failed. The list checks passed. RS-F03 and RS-F07 still failed.
- `E2E_RESELLER_ARTIFACT_DIR=/tmp/isp-resellers-fix2 npm run test:e2e:resellers -- --grep "RS-F03|RS-F07"` — 2 passed.

The full reseller suite and MK were not rerun. Review stays pending. `playwright/.auth/user.json` was already dirty and was left unchanged.

## Pay dialog stays open after a discount — 2026-11-15

Applying a discount from Pay Invoices was closing that dialog. The discount request refreshed the invoice list immediately, and closing the nested discount dialog also dismissed the pay dialog. The pay dialog now ignores that dismiss, keeps its own invoice amounts, and refreshes the lists only when it is closed or the payment is submitted.

The row discount, total discount, and amount due update from the applied amount, including any line discount. On vp.isp.test, signed in as vp, Pay for Sadia Islam INV11 stayed open after a ৳1 discount. The row and totals changed from ৳0 discount and ৳900 due to ৳1 discount and ৳899 due. Cancel then closed it. The same amounts stayed visible at a 390-pixel width. That ৳1 discount is saved on INV11. Payment was not submitted.

The bulk-pay dialog unit tests passed (8). Typecheck passed. Full Vitest was not used as the result; it still fails in unrelated files.

## Invoice fund change permission — 2026-11-15

Staff with `invoices.change-fund` can change the fund on bulk invoice pay. The field still starts on their assigned fund when they have one. Admin and Super Admin can still choose any fund. Other staff stay locked to their assigned fund, and payment stays blocked when they have none.

The dialog unit tests passed (7), including the new permission cases. The fund-access unit tests passed (8). Typecheck passed. The full Vitest run still has 19 failures in unrelated files. On vp.isp.test, signed in as vp, Pay for vp0006 opened with fund 14 enabled. At a 390-pixel width the dialog was 390 pixels wide and Pay Now stayed available. That account can already change the fund, so the new permission was not exercised on a live staff role. The permission appears in role screens after `update:permission`, and a role still has to be granted it.

## Payment list scoped by payments.view.all — 2026-11-15

Staff without `payments.view.all` now request `/payments` with their own `staff_id`, and the Collect By filter stays visible but disabled. Desktop and the mobile filter drawer share that field, so the same disabled state applies in both. Staff with that permission keep the dropdown and are not forced onto their own id. The session staff id is a uuid, while `collect_by` is the numeric staff id, so the existing `staff_id` filter now accepts either. A uuid that matches no staff returns no rows.

Signed in as `vp` on vp.isp.test. That account has `payments.view.all`, so Payments showed 10 rows (7,580) collected by vp and vps, and Collect By stayed in the filter on desktop and in the mobile filter drawer. The restricted path was not available on this login. Unit tests cover hiding the field and forcing `staff_id`.

The payments API still returns every collection when `staff_id` is omitted. The screen adds the filter; it is not an authorization check.

Frontend typecheck passed. Payment list unit tests passed (3). Backend collector filter tests passed (2). Pint and PHPStan passed on `StaffId.php`. Left the unrelated untracked `tests/unit/dashboard/dashboard-staff-collection-visibility.test.tsx` and `tests/unit/data-table/toolbar-filter-action.test.tsx` untouched.

## Staff invoice collection card — 2026-11-15

The collection card stayed hidden for staff `vps` (`vp` on `vp.isp.test`) because the dashboard only requested `/dashboard-staff-invoice-collection` when the user also had `dashboard-card.invoice`. That Staff role can pay invoices and has a staff profile, but it does not have the invoice dashboard card permission, so the request never ran and the card treated the totals as zero.

The request now runs for any signed-in user with a staff profile. The card still appears only when today, this month, or last month is greater than 0. The endpoint already returns only that staff member's own paid and partial invoice payments. For this account those payments are dated 2026-11-03 and sum to 6200 this month.

The new visibility unit tests passed (3), and the existing collection card tests passed (2). Typecheck passed. This browser had no `vp` session, so the live dashboard was not opened. Left the unrelated untracked `tests/unit/data-table/toolbar-filter-action.test.tsx` untouched.

## MikroTik sync import during filter — 2026-11-15

Opening the MikroTik Sync filter removed the bulk Import button. The table toolbar only rendered that action while the filter panel was closed, so selecting clients after a filter left Import unmounted behind the filter fields.

While the filter is open, that action now stays in the filter button row, beside Reset and Filter, and outside the filter fields. With the filter closed it stays in its previous toolbar place.

The new toolbar unit test passed (1). The related filter unit tests passed (14). Typecheck passed. On vp.isp.test, searching `testuser` and selecting a row showed Import on the first filter row, and a hit test landed on the button. At a 390-pixel width the filter opens in the bottom drawer; Import stays in the toolbar and is covered only while that drawer is open. An existing hydration notice from `app/layout.tsx` was already on the page. Left the unrelated change in `app/(dashboard)/clients/create/page.tsx` untouched.

## Telegram platform support events — 2026-11-15

The Telegram channel form now has two notification sections. Tenant includes the existing events plus Platform support Create and Update, and it is shown for every company that can open the form. Administration is a second Platform support Create and Update group. It renders only when the session profile says `company.platform`, which the API sets for company 1.

The section helper unit test passed (2). Typecheck passed. On app.isp.test, signed in as kamol, Add Telegram showed Tenant and Administration, including Platform support Create and Update in both. At a 390-pixel width the groups stack in one column and Cancel and Save stay at the bottom of the dialog. A non-platform company was not opened in the browser; the helper test covers that hide. An existing hydration notice from the dashboard was already present before this screen.

## Reseller any search — 2026-11-15

The reseller list filter is now one search box, matching the client list. It sends `any` and the placeholder says it matches name, username, phone, or email. Network, zone, and status stay as they were. English and Bangla strings were added.

The filter schema unit test passed. The full Vitest run reported 708 passes and 19 failures; those failures are outside this change and match the existing suite. On vp.isp.test as the existing VP session, opening the filter showed one search field plus network, zone, and status. Searching the reseller username kept that row, a phone number kept it, and an unmatched term showed “No results” with a result count of 0. At a 390-pixel width the same fields open in the bottom filter drawer. The search field is 156px wide in the desktop four-column row, so the placeholder is clipped there; in the drawer it is 313px. An existing hydration notice from `app/layout.tsx` was already on the page.

## Invoice print key line type — 2026-11-14

Annotated the print-cache line callback as `InvoiceLine`. Zod's passthrough line schema was leaving that `.map` parameter as implicit `any` in the editor. Typecheck passed, and the print dialog unit tests passed (13).

## Faster invoice receipt print — 2026-11-14

The print button waited on the main thread before it could show a spinner. Each click rasterized the header, the item header, and the summary just to measure them, then rasterized the page again at twice the print-head resolution. On a phone that work blocked the button for long enough that the spinner itself showed up late.

A normal receipt is now captured once, at the printer's 384-dot width. The preview starts that work while it is on screen. If it is finished, Print downloads immediately. If the user taps first, the spinner paints before the capture starts. Fonts that are already loaded are not waited on.

Typecheck passed. The invoice print and receipt unit tests passed (18). On vp.isp.test as the existing vp session, a basic receipt that was already prepared closed the dialog in 169ms on desktop and 174ms at a 390-pixel width, with no spinner. Clicking Print the moment the preview appeared showed the spinner in 8ms and finished in about 500ms in both widths. The Print button stayed 83×34 and did not move when the spinner replaced the icon. A real phone CPU and a physical 58mm printer were not used.

## Receipt line index type — 2026-11-14

Annotated both receipt line callbacks. The grouped rows now use a `ReceiptItem` type, so `line` is no longer implicit `any`, and `lineIndex` is `number`. The Zod passthrough invoice line was preventing the editor from typing that `.map` callback. The receipt file has no diagnostics. The receipt unit tests passed (5), and typecheck passed.

## Basic receipt PPPoE username — 2026-11-14

The basic invoice receipt now prints each client's `pppoe_username` under the client name and above the existing id and phone line. The advanced receipt already showed that username as a labeled row.

The invoice receipt and print-settings unit tests passed (7). Typecheck passed. Opening `/settings/invoice-print` redirected to the staff login, so the live preview was not checked in the browser. The basic-receipt unit test renders `kamal01` with the client name and phone line.

## PS-011 Help management refactor — 2026-11-14

Split the platform Help management submenu into Articles and Article Categories, with independent permission checks and the Invoice and Invoice Type table toolbar and actions. The wider article dialog begins with English and Bangla titles and uses four Tiptap fields for the two summaries and two Markdown bodies. It shows one video URL. Forms do not expose keys or slugs; Laravel generates them on creation and keeps them stable across renames. The reader displays formatted summaries above the body and plain excerpts in cards and search.

Typecheck passed. The focused Help and menu suites passed 47 tests. Full Vitest passed 702 tests and still reported 19 existing failures and one failed suite import outside Help and menu. In the seeded local Chrome session, verified both submenu routes, the two-field category dialog, title-first article form, formatting and stable dialog/editor dimensions at 1280×900 and 390×844, and loading existing Markdown into the edit dialog. Browser submissions and artificial slow-network checks were not run; SQLite covered API persistence. The preceding uncommitted PS-011 work remains in the tree.

## PS-011 dynamic Help implementation — 2026-11-14

Added the platform-only Help management screen with bilingual category and article forms, draft preview, publishing, and archiving. The existing staff UI reads permission-filtered Laravel content and uses the existing Markdown renderer. Retained the static reader for the explicit unseeded response. The target schema and seed have not been applied, so the planned static Markdown cleanup is pending.

Typecheck and 28 Help tests passed. Full Vitest reported 698 passes and the same 21 failures outside Help as before. Laravel reported 14 passing SQLite tests with 2,068 assertions, and Pint and PHPStan passed on the checked files. Chrome showed the app-tenant management shell and the unseeded Help fallback at desktop and 390-pixel widths. Seeded browser flows and slow-network transitions remain unverified.

## Dynamic Help Centre implementation plan — 2026-11-14

Added PS-011 for the Laravel schema and access rules, app-tenant management UI, repeatable seeder, staff reader cutover, and Markdown removal after parity checks. The existing Help validator passed with 184 article keys. The user confirmed that all four platform-only articles should be imported with their existing restrictions.

## Tenant staff help audience — 2026-11-14

Removed the audience column from the proposed help article schema. The library targets tenant staff, with access enforced by the application.

## Video entries in the help schema — 2026-11-14

Added the video kind and optional English and Bangla video URLs to the proposed two-table schema. The proposal includes localized summaries and requires at least one URL for a published video entry. No migration was created or SQL executed.

## Coverage of the two-table help schema — 2026-11-14

Confirmed the proposal represents guide and FAQ bodies, both languages, categories, slugs, and publication state. Reviewed the current consumers for localized summaries, keyword search, videos, related guides, contextual help, permissions, ordering, and translation revisions. Proposed retaining catalog metadata by article key if the immediate goal is database-backed content with current behavior. No application code or database changes.

## Two-table dynamic help schema — 2026-11-14

Revised the proposal to use categories and articles. Each article stores English and Bangla title and Markdown body columns. Removed the requested policy, ordering, and author columns from the proposal. The SQL is for review only.

## Dynamic help database schema review — 2026-11-14

Reviewed the existing help catalog, Markdown translation metadata, access rules, and backend MySQL 8 configuration. Presented a five-table MySQL schema in chat for review, including keys, indexes, permission fields, translation revisions, contextual routes, and related articles. No SQL was executed and no migration was created.

## Restore dependencies after audit fix --force — 2026-11-14

`npm audit fix --force` moved Zod from 3.25.76 to 4.6.7 and replaced the shadcn CLI 4.23.0 with an empty `shadcn@1.0.0`. The production build then failed TypeScript because the schemas use Zod 3 (`required_error`, `invalid_type_error`, and single-argument `z.record`). Restored `package.json` and `package-lock.json`, then reinstalled with `npm ci`. Zod is 3.25.76 and shadcn is 4.23.0 again.

`npm run build` completed successfully. The install still reports 13 audit findings. `npm audit fix` without `--force` was left unapplied. This dependency restore did not change UI, so no browser check was required.

## Image button in the issue editor — 2026-11-14

Moved Add images into the Report an issue formatting toolbar. The button opens the existing file picker and inserts the selected image inline. Verified button visibility in local Chrome at desktop and 390-pixel widths. Typecheck and the 52 focused platform support tests passed, including the toolbar button and inline image flow with a mocked upload.

## Rich text for Report an issue — 2026-11-14

The Message field uses Tiptap with bold, italic, strikethrough, and list controls. Add images, paste a screenshot, or drop a file to insert a private inline image. The existing upload and message endpoints accept the rich message as marked Markdown in the body with the existing attachment tokens. Requester and inbox views render the formatting and resolve inline images against the attachments returned for each message. Older plain-text messages retain their display.

Typecheck, 52 focused Vitest tests, 14 backend image and core tests, and help validation passed. The focused tests cover an image-only report payload and reject external image URLs in message rendering. Full Vitest reported 696 passes and the same 21 failures outside platform support as the prior run.

Local Chrome confirmed the editor and formatting at 1920 and 390 pixels. Toggling formatting kept the mobile submit control and page scroll in place. The isolated Playwright transport spec was updated and discovered. Live image submission and slow-network transitions were not exercised because no disposable test database fixture was configured.

## Remove platform support subjects — 2026-11-14

Removed subject inputs, columns, filters, and thread titles from platform support. The request reference identifies each thread. The frontend matches the subject-free API and chat conversion payload. Preserved the prior layout rule and Mobile app issue category changes.

Local Chrome showed the issue detail and subject-free requester list at desktop width, and the same list columns at 390 pixels. Inbox, live conversion, and slow-network transitions were not exercised. Typecheck, 49 focused platform-support tests, and help content validation passed. Full Vitest reported 693 passes and the same 21 failures outside platform support as the prior run.

## Report an issue fields — 2026-11-14

Removed Subject from the report form, frontend validation, create payload, and backend issue creation. Added Mobile app issue to the shared categories and English and Bangla help. Existing subjects and chat conversion are supported by the current schema. The create API ignores subject values from older clients and preserves retries for previously filed reports.

- Local Chrome confirmed the Subject field was absent at 1920 and 390 pixels. Selecting Mobile app issue left the form controls and page scroll at the same positions. Cancel dismissed the dialog. Live submission and slow-network transitions were not exercised. The updated Playwright transport test was discovered, and running it requires a disposable database fixture.
- Frontend typecheck, 49 focused Vitest tests, and help validation passed. Full Vitest reported 693 passes and 21 failures outside the platform-support tests. The backend platform-support suite passed 35 tests with 797 assertions.
- Preserved the earlier uncommitted layout stability rule in `AGENTS.md`, `.cursor/rules/UI-update.mdc`, and this report.

## Mandatory UI layout stability rule — 2026-11-14

Added the layout stability requirement to `AGENTS.md` and documented implementation and browser verification in the existing always-applied UI rule. The rule covers stable dimensions for late-loading content, steady controls during transient states, and scroll position during updates and overlay interactions.

Reviewed the rule and working-tree diff and ran `git diff --check`. This documentation change did not require application tests.

## Help launcher and theme menu — 2026-11-14

The Help control is an icon button in the dashboard top navbar, in line with the other header buttons. The floating corner button is gone. On screens below the `md` breakpoint the header theme button is hidden. Company and reseller profile menus open Theme settings on both mobile and desktop, after Settings.

- `npx vitest run tests/unit/platform-support/support-launcher.test.tsx` passed, 3 tests.
- On the logged-in dashboard the Help control is an icon in the top navbar, beside the other header buttons, and the corner button is gone. The theme icon stays in the desktop header. Automated clicks did not open the drawer or the profile menu.

## Platform support chat header and Enter — 2026-11-14

The inbox status line no longer switches to "Refreshing" while a poll is in flight, so the chat list header stays on the last refresh time. The conversation header does not show that label. Enter in a chat composer submits through the form's submit button; Shift+Enter still inserts a newline.

- `npx vitest run tests/unit/platform-support/support-composer.test.tsx` passed, 4 tests.
- A logged-in browser session was not opened.

## Remove PWA — 2026-11-14

Removed the service worker, web app manifest, install prompt, offline page, PWA icons, and the auth guard that treated a standalone window as an installed app. The root layout no longer advertises a manifest or mobile-web-app mode. Impersonation and tenant switches still reload the page; they no longer message a service worker. `/offline` and `/api/manifest` are no longer public routes. English and Bangla install-prompt strings are gone. A one-time client effect unregisters any service worker already installed in the browser and deletes its caches. Playwright configs still block service workers during browser tests.

- `npx vitest run tests/unit/resellers/reseller-switch-scope.test.tsx tests/unit/auth/password-reset.test.tsx` passed, 18 tests.
- JSON for both language files and the e2e inventories parsed. A browser session was not opened, so an already-installed worker was not unregistered live.

## Help content filesystem trace — 2026-11-14

Help article and media reads now go through `path.join(process.cwd(), "content/help", relative)` after the existing root check. Turbopack can limit the server trace to `content/help` instead of the whole project. Temporary test libraries still read their own root, marked `turbopackIgnore`, so fixture directories stay outside the deployment trace. Path traversal checks are unchanged.

- `npx vitest run tests/unit/help` passed, 26 tests.
- `npx next build` completed with exit code 0 and did not print the dynamic filesystem tracing warning.

## Platform support list polling — 2026-11-14

Removed the 15-second refetch interval from the requester Issues and Chats list in `components/platform-support/support-home.tsx`. The list still refetches when the window regains focus, when filters or kind change, and when the user retries a failed load. Summary counts on the same page still poll every 30 seconds. Open threads, the platform inbox, and the launcher are unchanged.

## Platform support chat header — 2026-11-13

Removed the transient Refreshing label from the platform inbox chat conversation header. Background polling and stale warnings still work through the existing query logic. The issue header and inbox list keep their refresh indicators. This is a display-only change with no API or authorization changes.

- Typecheck and all 49 focused platform-support tests passed. Full Vitest reported 693 passes and the same 21 failures as the preceding run.
- Reviewed `scripts/ai/diff`, `scripts/ai/status`, and the CRLF-aware diff check. Preserved the existing PS-010, eye-action, and Enter-shortcut changes.

## Platform support chat Enter shortcut — 2026-11-13

Enter sends from the requester and platform inbox chat composers through the existing Send button and form validation. Shift+Enter inserts a newline, and Enter during keyboard input composition can still confirm the text. The composer suppresses repeated submissions while preparing or sending a chat message. Issue replies keep their multiline keyboard behavior. The shortcut uses the same authenticated endpoints, request IDs, attachment checks, and tenant scope as the Send button.

- `npm test -- tests/unit/platform-support` passed all 49 tests, including blank input, repeated Enter, Shift+Enter, IME composition, and issue reply behavior.
- `scripts/ai/frontend-check` passed typecheck. Full Vitest reported 693 passes and the same 21 failures as the preceding eye-action run.
- Reviewed `scripts/ai/diff`, `scripts/ai/status`, and the CRLF-aware diff check. Preserved the earlier PS-010 and eye-action work. No live message was sent.

## Platform support row view action — 2026-11-13

Added a keyboard-accessible eye link to the Actions column on both Issues and Chats in My requests and the platform inbox. The link uses the same detail URL as the subject and reference. It reuses the existing English and Bangla View and Actions labels. The change adds no API calls, data scope inputs, or authorization changes.

- Focused platform-support Vitest run passed all 47 tests.
- `scripts/ai/frontend-check` passed typecheck. Full Vitest reported 691 passes and 21 failures. The previous 19 unrelated failures reproduced, and two sidebar order assertions fail against the existing uncommitted menu ordering. The eye action does not change the menu.
- Reviewed `scripts/ai/diff` and `scripts/ai/status`. Left the earlier PS-010 work in place, including the navigation, Help content, translations, and review evidence.

## PS-010 platform support redesign — 2026-11-13

Implemented all six redesign stages. The Help Centre now has authorized topics, search, featured guides, FAQs, videos, and contact actions. The requester list, issue dialog, issue/chat conversation and conversion, platform inbox and details, contextual Help drawer, and guide reader follow the current application shell, theme, and shared components. The platform inbox identifies the company and requester beside the conversation. The redesign uses the existing scoped summary and mutation contracts. No backend files or legacy customer ticket files changed.

- `npm run help:check` — passed, 184 articles.
- `npm test -- tests/unit/help tests/unit/platform-support tests/unit/menu` — passed, 90 tests across 12 files.
- `scripts/ai/frontend-check` — typecheck passed. Full Vitest reported 693 passes and 19 existing unrelated failures in maps, reseller-client, client dashboard, column visibility, date pickers, and pay.
- `scripts/ai/diff`, `scripts/ai/status`, and `git -c core.whitespace=cr-at-eol diff --check` — reviewed the final working tree and preserved the existing CRLF convention in MyDrawer.
- Live Chrome checks covered all redesigned surfaces across selected desktop and 390 × 844 mobile states. Screenshots, adaptations, and remaining checks are in [PS-010 evidence](features/platform-support/evidence/PS-010/README.md).

Ready for design review. The full viewport, language, theme, and persona matrix remains open. Browser writes such as sends, uploads, conversion completion, and assignment were not exercised with the existing sessions. PS-009 remains reviewable and not release-ready. The README, ticket, and report edits already in progress at the start were preserved and extended. No install, push, or deployment was performed.

## PS-010 scope/design clarification — 2026-11-13

Updated PS-010 and feature README v1.2 to reflect the user's explicit pre-production authorization: necessary coordinated frontend/backend/API/resource/service/model/schema changes are included, without another scope approval solely to support the redesign. Removed frontend-only/frozen API restrictions and the requirement to request separate scope for real summary metrics. Added consumer/type/test/documentation coordination, backend verification and preserved security/data-integrity expectations. Repository approval rules for installs, production settings, non-test data operations, push/deploy remain applicable; no implementation or database operation performed.

Clarified design precedence: current app design philosophy and shared navigation/component/theme conventions take precedence over literal HTML reproduction. Sidebar grouping/icons/sizing/active/collapsed states must follow the current app menu; green palette and exact prototype dimensions are optional inspiration. Replaced pixel-similarity acceptance with app-native coherence, updated six-stage instructions/acceptance/review evidence and the implementation prompt. Original customer tickets and file-based documentation remain preserved. Status stays not started; inherited PS-009 blockers unchanged.

Verification: local document checks passed for links, six stages, 12 acceptance IDs, pending status, whitespace and removal of contradictory backend/design restrictions. Inspected scripts/ai/diff/status and git diff --check. Documentation-only update; no application tests or backend writes. Preserved existing uncommitted ticket/README/report work and prior history.

## PS-010 platform-support visual redesign ticket — 2026-11-13

Created `.ai/features/platform-support/tasks/PS-010-visual-redesign.md` and registered it in the feature README (v1.1). Ticket consolidates the user-approved HTML visual reference and redesign advice into six sequential stages: Help Centre/shared presentation, requester list/issue creation, issue/chat conversations, platform inbox/detail, Help drawer/article reader, and integrated visual/regression review. Includes source mapping, current design gaps, React/Tailwind/project-wrapper constraints, preserved production behavior, authorized topic grouping/real metrics guidance, 12 acceptance IDs and a desktop/mobile/language/theme evidence matrix. Existing app shell/customer tickets and functional transports/models remain in scope for preservation. Prior PS-009 reviewable/not-release-ready status is retained; PS-010 and all stages are not started.

Verification: local Python checks passed for Markdown links, six ordered stages, 12 unique acceptance IDs, status, README indexing and primary source paths. Ran git diff --check and scripts/ai/diff/status. Documentation only: no feature implementation, application tests, backend modifications, screenshots, deployment or push. Preserved the preexisting redesign-advice report update and all earlier report history. Implementation evidence is deliberately pending; the proposed PS-010 evidence folder will be created during implementation.

## Platform-support redesign advice — 2026-11-13

Inspected the implemented platform-support branch, Help Centre/launcher/reader, requester home/thread/composer, platform inbox components, existing source models/transports and unit-test inventory against design/platform-support/. Recommended a staged presentation refactor using the HTML/CSS as the visual reference while retaining current API hooks, permission checks, private image transport, polling/read cursors, request idempotency, real content and app shell. Suggested screen-by-screen visual checkpoints, Tailwind/theme-token translation, reusable display components and focused regression checks. Identified HelpCardView lacks category/topic metadata, so topic grouping may need a small server-authorized view-model addition; summary cards must use actual available API data, never demo counts. Do not port prototype role switch/sample records/in-memory logic or global CSS selectors.

Advice only: no application or backend code changed; no application tests or browser verification executed. Working tree was clean at task start. Updated this report and inspected scripts/ai/diff/status as required. Existing implementation acceptance limitations in prior entries were not reverified or represented as resolved.

## Platform support composer id — 2026-11-13

`crypto.randomUUID` is missing on `http://mk.isp.test`, so the issue composer crashed while creating its draft id. Draft, request, and chat ids now come from `supportRequestId()`, which uses `crypto.getRandomValues`. The model test covers a missing `randomUUID`. On the open MK session, `/platform-support?kind=issue&compose=issue` rendered the subject, message, and image fields with no runtime error. `typeof crypto.randomUUID` was still `undefined` on that page.

## PS-009 acceptance — 2026-11-13

PS-009 is reviewable and not release-ready. No PS-E scenario is marked fully passed. Evidence is in `.ai/features/platform-support/evidence/`.

Added `playwright.platform-support.config.ts`, `npm run test:e2e:platform-support`, and the platform-support spec workspace. The root runner discovers the config. The legacy config still lists only its 11 root specs. On CP, 6 chromium checks passed: anonymous login walls, the launcher and legacy tickets list, anonymous upload 403 and attachment 401 with `private, no-store` and no bearer, logout back to login, mobile help panel, English/Bangla article, empty videos, and the hidden platform guide. The isolated image-send test failed before any request because no disposable database fixture was supplied. `npm run test:e2e` will fail that project until the fixture exists.

The mobile drawer ignores a close in the first 400ms so the opening press does not dismiss the sheet. Help content check: 184 articles. Focused Vitest: 90 passed, plus 2 launcher tests. `scripts/ai/frontend-check` typecheck completed. Full Vitest then failed the same 19 unrelated tests in maps, reseller-client, client dashboard, column visibility, date-picker, and pay. 689 passed.

PS-E12 was not measured. Videos remain `not_configured`. MySQL locking was not run. No deploy or push. The sibling backend report covers the new Pest file.

## PS-008 Help Centre — 2026-11-13

Added the staff Help Centre at `/help` and `/help/[...slug]`, and connected it to the existing Help launcher. The launcher stays in the dashboard layout. Every signed-in staff user can open Help. Report an issue, Chat, and My requests still require `platform-support.access`. Context suggestions come from `GET /api/help/context`, which reuses the PS-007 actor and article policy. It is staff-only and `private, no-store`. No Laravel documentation endpoint was added.

The library is now 184 published English/Bangla articles. `content/help/coverage.json` maps 121 dashboard routes: 113 covered and 9 excluded. All six coverage batches are in that file. Video status is `not_configured` everywhere. A fixture test builds a `youtube-nocookie` embed without autoplay; no real video id is in the catalog. Include this page is off by default, strips the query and hash, and adds an article id only for `/help/...`.

`node scripts/check-help-content.mjs` printed `help content ok (184 articles)` and the existing Node module-type warning. `scripts/ai/typecheck` exited 0. `scripts/ai/frontend-check` then failed the same 19 Vitest tests in maps, reseller-client, client dashboard, column visibility, date-picker, and pay. 689 tests passed. Those files were not part of this change. Focused help and launcher tests passed. No signed-in browser session was run. Bangla text was written in this change and was not independently reviewed. isp-backend was not edited. PS-009 was not started.

### Checks

- `node scripts/check-help-content.mjs` — exit 0, 184 articles.
- `npx vitest run tests/unit/help tests/unit/platform-support/support-model.test.ts tests/unit/platform-support/support-launcher.test.tsx` — 6 files, 44 passed, before the last context assertion. That assertion is in the full run below.
- `scripts/ai/typecheck` — exit 0.
- `scripts/ai/frontend-check` — typecheck exit 0. Full Vitest failed 19 unrelated tests. 689 passed.
- `scripts/ai/status` and `scripts/ai/diff` after the code edit. Tracked diff was 18 files, +4083/−73, and 4606 lines. Final status, including this report, is 21 modified files and 140 untracked paths. Branch `master` tracks `origin/master` and was not committed or pushed.

## PS-007 documentation engine — 2026-11-13

Added a file-based help library under `content/help` and server routes at `/api/help/articles/{id}`, `/api/help/search`, and `/api/help/media/{articleId}/{file}`. Twelve published articles exist in English and Bangla: getting started, contact, report an issue, chat, images, convert chat, clients overview, add client, invoices overview, and three short FAQs. Chat, images, and conversion are separate articles because their permissions differ. No Help Centre page was added.

A staff response is authorized from the existing `/user-settings` envelope. Baseline support articles need no feature permission. Feature articles follow the menu lock: a feature hides content only when the subscription state is `expired` and the feature is disabled. An expired read-only feature hides write tutorials and keeps the overview. Client and anonymous principals get 401. A forbidden or missing article is 404 and the body does not include its title. Search returns at most eight snippets from titles, summaries, keywords, and body, and a query longer than 80 characters is 400 without echoing the query. Responses use `private, no-store`.

Markdown is rendered with markdown-it 15.0.3, HTML and linkify disabled, and a link check that allows only http(s), mailto, `/help/` paths, and local media. `npm install markdown-it@15.0.3 server-only@0.0.1` was run. The permission snapshot has 395 names generated from the sibling seeder and `PlatformSupportPermissions`. `node scripts/check-help-content.mjs` reports `help content ok (12 articles)` and prints a Node module-type warning. No video id was added. isp-backend was not edited. PS-008 was not started.

### Checks

- `npx vitest run tests/unit/help` — 3 files, 17 passed.
- `scripts/ai/typecheck` — exited 0.
- `scripts/ai/frontend-check` — typecheck exited 0. Full Vitest then failed 19 tests in maps, reseller-client, client dashboard, column visibility, date-picker, and pay files. Those files were not part of this change. 680 tests passed.
- `scripts/ai/status` and `scripts/ai/diff` after the edits. The working tree contains only this task, including the report update. Branch `master` is ahead of `origin/master` by 1. Nothing was committed or pushed.

No production `next build` and no browser session. The unit tests cover the routes, renderer, locale pair, and permission gates. They do not prove the compiled client bundle or a signed-in page.

## PS-006 platform inbox — 2026-11-13

Added the app-tenant support inbox at `/platform-support-admin` and `/platform-support-admin/threads/{uuid}`. The nav item is gated by `platform-support-admin.access` only. Issues and chats are separate tabs. Unread and unassigned are explicit views. Company, reseller, and requester filters send uuids to the admin list. The assignee dropdown is requested only when the user has both `platform-support-admin.assign` and `platform-support-admin.assignees`.

The thread keeps the company name, domain, reseller, requester, and role above the reply box. Reply, upload, status, assignment, and conversion each require the named permission and the per-record ability. Images and source-chat history use the platform routes. A 403 removes the cached inbox rows. The list and summary poll every 10 seconds while the inbox is visible, and the open thread polls every 5 seconds. Hidden, offline, and failed requests stop or show a stale state. The list does not reorder the current page while a control in it has focus.

Focused tests cover the menu gate, identity fields, role controls, cache keys, poll interval, stale empty list, and reply dedupe. They do not prove a live cross-tenant or cross-role API check. No browser session was run. PS-007 was not started.

### Checks

- `npx vitest run tests/unit/platform-support tests/unit/menu/menu-items.test.ts` — 7 files, 58 passed.
- `scripts/ai/typecheck` — exited 0.
- `scripts/ai/frontend-check` — typecheck exited 0. Full Vitest then failed 19 tests in maps, client dashboard, reseller-client, column visibility, date-picker, and pay files. Those files were not part of this change. 663 tests passed.
- `scripts/ai/status` and `git diff --stat` after the edits. The working tree contains only this task.

No dependency install, browser session, or push. PS-004 and PS-005 were uncommitted at the start and are now in `503b007`. They are not part of this diff.

## PS-005 requester UI — 2026-11-13

Added the staff Help launcher and the requester issue/chat screens. The launcher is mounted once in the staff layout, uses `platform-support.access`, and offers Report an issue, Chat with support, and My requests. It does not require `tickets.access`, `notifications.access`, or the paid support feature, and it does not link to a Help Centre route. Lists, thread history, image staging, and lifecycle actions use the PS-002–PS-004 routes and the per-record abilities. Colleague replies go to `team-messages`. Colleague status changes go to `team-status`. Tokens and drafts stay in component memory.

Focused tests cover scope selection, reply routing, the 105-message merge, polling stop conditions, retry ids, image limits, escaped text, the single launcher, and English/Bangla key parity. They do not prove a live cross-tenant API check. No browser session was run. `useFetch` still does not expose `Retry-After`, and the PHP upload limits from PS-003 are unchanged. PS-006 was not started.

### Checks

- `scripts/ai/typecheck` — exited 0.
- `npx vitest run tests/unit/platform-support tests/unit/menu/menu-items.test.ts` — 6 files, 44 passed.
- `scripts/ai/frontend-check` — typecheck exited 0. Full Vitest then failed 19 tests in date-picker, pay, client-dashboard, reseller-client, column-visibility, and maps files. Those files were not part of this change.
- `scripts/ai/status` and `scripts/ai/diff` inspected after the edits.

Unrelated uncommitted PS-004 files were left in place: `02-data-and-api.md`, `tasks/PS-004-notifications.md`, the notification catalog/column/list, and `tests/unit/notifications/notification-catalog.test.ts`. No dependency install, browser session, or push.

## PS-004 notifications — 2026-11-13

Added the platform-support notification catalog: category `platform_support`, six events, English and Bangla title plus platform/tenant message keys, status labels for `waiting_for_requester` and `converted`, and `platform_support.errors.rate_limited`. Href resolution uses the audience and kind already on the row and does not append a query string. The planned routes are `/platform-support-admin/threads/{uuid}`, `/platform-support/chats/{uuid}`, and `/platform-support/issues/{uuid}`. Those pages are not in this task. The bell still requires `notifications.access`. The settings list now includes the new category because it reads the catalog.

The API behavior, Pest evidence, and queue-worker prerequisite are in the sibling `.ai/report.md` and in `tasks/PS-004-notifications.md`. PS-005 was not started.

### Checks

- `npx vitest run tests/unit/notifications/notification-catalog.test.ts tests/unit/notifications/notification-bell.test.tsx` — 2 files, 11 passed.
- `scripts/ai/typecheck` — exited 0.
- `scripts/ai/status` and `scripts/ai/diff` inspected after the edits.

No browser session, dependency install, or push. The notification bell and settings screens were not opened. The thread pages these links target do not exist yet.

## PS-003 image transport — 2026-11-13

Added the same-origin upload, delete, and image routes for requester and platform support. The browser posts `FormData` to a fixed path and never receives the Sanctum bearer. The route handler checks `Origin` against `Host` and `X-Requested-With` on POST and DELETE, stops a body over 6 MiB, and forwards only the session bearer, `Accept`, `Content-Type`, and `X-Requested-With`. Image responses are `private, no-store` and `nosniff`. Error codes map to `platform_support.errors` in English and Bangla. `next.config.ts` was not given a larger server-action body limit. There is no composer or preview screen. That stays in PS-005 and PS-006.

The API behavior and Pest evidence are in the sibling `.ai/report.md` and in `tasks/PS-003-images.md`. This checkout's PHP CLI still reports `upload_max_filesize=2M` and `memory_limit=128M`. Those settings need approval before a real 5 MiB upload will pass PHP.

### Checks

- `scripts/ai/frontend-check` — typecheck passed. The full Vitest run then failed in date-picker, menu, maps, pay, client-dashboard, reseller-client, and column-visibility tests. Those files were not part of this change and were not investigated.
- `npx vitest run tests/unit/platform-support/attachment-transport.test.ts tests/unit/platform-support/attachment-proxy.test.ts` — 10 passed.
- `scripts/ai/status` and `scripts/ai/diff` inspected after the edits.

No browser session, dependency install, or push. The proxy was not clicked through a page.

## PS-002 core API record — 2026-11-13

Updated the platform-support contract and PS-002 task to match the isp-backend implementation. Recorded the `context` column, receipt `result_resumed`, reseller-id storage without a foreign key, the text-only 422 boundary, and the actual 200 envelopes. Added the disposable MySQL concurrency plan to PS-009 without starting that task. Adjusted the PS-001 remaining-blocker sentence because core thread routes no longer return 204. No frontend application code, types, or translations changed. Backend checks are in the sibling `.ai/report.md`. No dependency install, browser run, or push.

## PS-001 authorization record — 2026-11-13

Updated `.ai/features/platform-support/tasks/PS-001-authorization.md` to reviewable and recorded the isp-backend evidence there. No frontend application code, types, or translations changed. `AppPermission` is already `string`, and the settings envelope was left unchanged. Backend implementation and checks are in the sibling `.ai/report.md`. No dependency install, browser run, or push.

## HTML visual design for platform help/support — 2026-11-13

Created `design/platform-support/` as an isolated buildless HTML/CSS/JavaScript prototype: Help Centre/search/articles/FAQ/video presentation, persistent contextual Help drawer, own/company/reseller issue lists, issue creation/details/replies, image previews and image-only messages, resolve/reopen, chat with linked issue conversion, and app-tenant multi-tenant inbox with filters, assignment and read-only agent presentation. Includes English/Bangla (304 matching keys via existing i18next browser distribution), light/dark tokens and responsive layouts. Native controls and isolated HTML are intentional for the user's requested pre-coding design; production implementation must use project React wrappers and public/lang translations. Added design-reference links to the feature specification README; all implementation task statuses remain not started.

Preview is served on loopback `http://127.0.0.1:4177/` from this folder and opened in the browser. It also works by opening index.html directly. No API calls, actual uploads, socket connections, backend records, external fonts/CDNs, or localStorage; messages/images/roles are in-memory design simulations. Video presentation explicitly notes no real reviewed tutorial URL has been supplied. Synthetic invoice SVG contains only fictional sample data. Vendored the already installed i18next UMD build with its license; no package/dependency installation or application code changes.

Verification executed: node --check for app.js/locales.js passed; final 30 local jsdom interaction/source checks passed covering localization parity, search/FAQ/drawer/video, own/reseller/company/platform sample scope views, text escaping, local replies/resolve/reopen/conversion/history, image-only issue creation/max-five feedback, assignment/read-only controls, theme and Bangla article. Local HTML asset checks and PostCSS parsing (323 top-level nodes) passed. Earlier DOM runs stopped on test-navigation assumptions (new-issue button absent on detail; retained video tab before article lookup); corrected the test navigation and reran successfully without weakening assertions. Actual desktop Chrome visual inspection confirmed rendered Help Centre and issue list. Initial in-app browser attachment/native permission delays resolved via native Chrome; mobile/dark/Bangla rendering was not visually verified, and DOM checks do not prove browser layout or real authorization. No application Vitest/typecheck/Playwright suite run because this is standalone pre-coding design with no production app integration.

Inspected scripts/ai/diff and scripts/ai/status; checked new prototype assets separately because they are untracked. Preserved ongoing reseller suite/config/package/register/inventory/specification changes and prior report history, previous architecture/specification files, plus codex event/log files. No edits in isp-backend, production configuration, push or deployment. Updated this report as required.

## RESELLER-001 implementation — 2026-11-13

Added a partial reseller Playwright suite: `playwright.resellers.config.ts`, `npm run test:e2e:resellers`, and `tests/e2e/resellers/` (list, forms, detail, access, actions). The all-suite runner discovers the config. Login stays on CP and MK tenant hosts. No successful create, package reassignment, recharge settlement, purge, or import is submitted. Settings are toggled and restored. Invalid recharge calls are denied and the balance is read again.

Final verification:

- CP: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_RESELLER_ARTIFACT_DIR=/tmp/isp-resellers-cp npm run test:e2e:resellers` — 30 passed, 1 failed, 0 skipped (59.4s).
- MK: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_TENANT=mk E2E_RESELLER_ARTIFACT_DIR=/tmp/isp-resellers-mk npm run test:e2e:resellers` — 30 passed, 1 failed, 0 skipped (59.7s).
- The failure on both tenants is `RS-L02 username filter keeps only matching usernames and an unknown username is empty`. An unknown username returned total 1. `app/Services/Filters/Resellers/Filters.php` has no Username filter, so the query is ignored. The assertion stays at total 0.
- `scripts/ai/typecheck` passed.
- `npm run test:e2e -- --list` passed: 121 tests (clients 32, legacy 11, invoices 36, resellers 31, support tickets 11).
- `python3 tests/e2e/specifications/check_coverage.py` passed. Recorded pass coverage stays 0 because review is pending. RS-L02 is failing; ST-A03 was already failing.
- `scripts/ai/status` and `scripts/ai/diff` were inspected after the edits.

Both local companies have one reseller, so page 2 and the second-reseller client switch did not run. The linked reseller user is an Admin, so impersonation enter/leave did not run; the suite records the denial and leaves the staff list in place. The import dialog is not mounted. Client-wallet UUID masquerade is not on ClientResource. Page size was not changed.

Register and inventory record partial slices only. No parent scenario is passing. Review-blocked financial, identity, package, purge, and import scenarios stay unimplemented. Evidence is in `tests/e2e/specifications/resellers/EXECUTION.json`.

Preexisting `.ai/features/`, `.ai/support-architecture.md`, and codex log files were left untouched. No dependency install, backend write, commit, push, or deploy.

## Platform-support sequential feature specification — 2026-11-13

Created `.ai/features/platform-support/` with 14 Markdown files: README, product decisions/defaults, authorization contract, data/API contract, source evidence and nine ordered implementation tasks (PS-001–009). Covers a separate platform-support domain with issues/chat, linked chat-to-issue conversion, tenant/reseller/company permission scopes, app-tenant inbox, five private JPEG/PNG/WebP images per message at 5 MiB each, bounded incremental polling, per-reader unread/notifications and English/Bangla Markdown Help Centre/FAQ/video support. Existing customer/tenant tickets are explicitly preserved; the prior architecture alternatives are superseded by this specification.

User confirmed permission-based visibility, separate chat/issues with conversion, permitted app administrators/staff and image/polling/in-app defaults. Explicit implementation defaults cover baseline own access, optional exact-reseller/company scope, no implicit reseller hierarchy widening, lifecycle, image transport/staging and absent optional real video URLs. All schemas/routes/permission names are marked proposed; task statuses and execution evidence remain not started/pending. Backend work is described for the sibling checkout without changing it. Platform aggregate inbox requires a narrow documented tenancy exception; per-record actions stay constrained to trusted parent ownership. No legacy ticket fixes or general subscription/auth rewrite are silently included.

Verification executed: local Python consistency check passed across 14 Markdown files, all nine tasks indexed, local Markdown links resolved, task status/implementation record/acceptance sections present, selected source reference files exist. Reviewed lifecycle/read-cursor/idempotency/attachment ownership contract consistency. Inspected scripts/ai/diff and scripts/ai/status; reviewed newly untracked specification files separately. No application code, dependency installs, backend writes, migrations, live API calls, browser execution or application tests performed for this documentation-only task. Existing report history and `.ai/support-architecture.md` preserved; unrelated codex-events.jsonl, codex-repair-events.jsonl, codex-repair-stderr.log and codex-stderr.log left untouched. No push/deploy.

## Help Centre and platform-support architecture review — 2026-11-13

Analyzed frontend layouts, permission/i18n/query wrappers, ticket threads and marketing FAQ; inspected sibling Laravel ticket models/controllers/requests/routes, subscription mapping and canonical tenancy architecture. Delivered `.ai/support-architecture.md` and a managed comparison canvas. Recommended private en/bn Markdown with a shared permission catalog, server-authorized article/search/media delivery, contextual help throughout the staff app and a separate Laravel platform-support inbox. Existing subscriber-to-ISP tickets are a separate audience. Proposed DB-backed messages/read cursors, adaptive Query polling, incremental history and future private socket events. Alternatives: deliberate ticket-domain extension or separate docs/help-desk integration.

Static findings relevant to reuse: generic TicketMessage endpoints lack authorized-parent scope; nested ticket message routes omit permission middleware; ticket relation IDs lack tenant-scoped validation. These were reported, not changed or reproduced. Platform support needs explicit participant/reseller boundaries and audited platform access; no browser company-id authorization or writable ownership fields proposed. Documentation content can be tenant-independent, but authorized responses and chat caches must remain identity-scoped. No network-device operations proposed.

Verification: source review and official Next.js/TanStack Query/YouTube documentation; inspected scripts/ai/diff and scripts/ai/status. No application changes, dependencies, backend writes, browser actions, live requests to the ISP API, or application tests. Proposal details distinguish future routes/models from existing ones. Preserved prior report entries and unrelated untracked codex-events.jsonl, codex-repair-events.jsonl, codex-repair-stderr.log and codex-stderr.log. No commit/push/deploy performed.

## INVOICE-001 implementation

Partially implemented the invoice specification with 36 nonmutating Playwright checks across list, forms, documents, payments-dialog and access files. Added playwright.invoices.config.ts and npm run test:e2e:invoices; the existing all-suite runner discovers it automatically. Reused explicit CP/MK login/profile-verified in-memory auth without requesting the owned-client mutation fixture. Independent Zod resource schemas preserve invoice UUID identity under id and verify UI/API rows, relation dropdowns and rendered currency without importing production calculations as the oracle.

Coverage includes list/date/client/type/status/amount/reload, track/status/type/client/zone/creator/combined filters, actual pagination boundaries, UUID client history, no-match recovery, anonymous routes, selected bidirectional foreign UUID detail/search denial, invalid form recovery/defaults/cancel, unsaved lines/quantity totals, paid/partial field requirements, due edit hydration/cancel, oversized multibyte note rejection, document identity/lines/note/total, instrumented browser print/cleanup, delete cancellation and payment-dialog identities/select-all totals/cancel. No valid invoice create/update/delete/payment/discount, fund change or customer notification was submitted.

Final verification executed:

- E2E_INVOICE_ARTIFACT_DIR=/tmp/isp-invoices-cp npm run test:e2e:invoices: 36 passed, zero failed/skipped (about 1.3 minutes).
- E2E_TENANT=mk E2E_INVOICE_ARTIFACT_DIR=/tmp/isp-invoices-mk npm run test:e2e:invoices: 36 passed, zero failed/skipped (about 1.4 minutes).
- scripts/ai/typecheck: passed.
- npm test -- tests/unit/invoices: 12 files / 48 tests passed.
- npm run test:e2e -- --list: passed; 90 tests collected (clients 32, legacy 11, invoices 36, support tickets 11), no feature/legacy overlap. Full all-suite browser execution was not claimed; existing client mutation prerequisites remain.
- python3 tests/e2e/specifications/check_coverage.py: passed inventory/link/register validation; target remains unmet.
- scripts/ai/diff and scripts/ai/status inspected after edits.

Earlier runs caught and corrected test locator/assumption errors: dotted IDs rather than name attributes; untranslated static-option search keys; composite client dropdown labels; unlabeled delete trigger; missing creator field; single-page fixtures; payment button availability versus selection behavior. Superseded failures are not application defects. Final reports remain in /tmp/isp-invoices-{cp,mk}/results.json with sanitized exact titles/timestamps/source hashes in tests/e2e/specifications/invoices/EXECUTION.json.

Updated invoice README/spec/IMPLEMENTATION.md and register/inventory with 19 partially implemented parents. All other invoice parents retain explicit policy/fixture/implementation blockers. No complete parent scenario was credited passing; review remains pending. Financial arithmetic/allocation/concurrency/discount rules require the parent ticket decisions, disposable owned invoices, fake external integrations, independent fund/payment/client-balance checks and restricted personas. Current single-page datasets do not execute the multi-page branch. Creator filtering proves UI/API agreement only because InvoiceResource omits creator identity.

Source findings: InvoiceResource returns UUID under id while production row schema declares numeric id. View passes invoice.uuid, preventing lazy detail hydration for id-only resources; rendered fallback content was checked independently, but no hydration freshness coverage is claimed. Discount/due authorization questions from the ticket remain unverified source observations. Ordinary company tests never substitute platform administration. Known foreign invoice read denials do not prove reseller/zone or mutation isolation; no writable company_id/reseller_id was added. API remains the security boundary.

Existing login-form/auth helper/integration/session, opencode.json, client suite/config/specification, support-ticket suite/config/specification and prior runner work were preserved. This task adds only invoice suite/config, its npm script, its documentation/register entries and invoice guidance in tests/e2e/AGENTS.md. No dependencies installed, production settings edited, commits/push/deploy or backend mutations performed. Earlier task reports follow.

## Diagnosis: four isolated client failures

Inspected playwright-report/client-suite/results.json and the isolated fixture guard. All four clients-isolated tests failed with the same configuration error: Isolated client tests require E2E_CLIENT_MUTATIONS=1 and E2E_CLIENT_FIXTURE_FILE; no live router/customer mutations permitted. These failures do not establish a client UI defect: the tests stopped at their prerequisite guard before their create/edit actions.

Required setup is a disposable database, fake router/notification adapters, and a real tenant-owned network/package fixture JSON described in tests/e2e/clients/README.md. Both environment variables must reference that actual setup; setting attestations alone does not provision it. No guards changed, no tests skipped, no browser or mutation tests rerun. All-suite command remains inclusive as requested. Existing unrelated changes preserved. Ran scripts/ai/status and scripts/ai/diff; only this report changed during diagnosis.

## Correction: standard command includes every suite

User clarified npm run test:e2e must run all tests, including clients. This supersedes the prior client-only command decision below.

Added scripts/run-e2e.mjs, which discovers root-level playwright*.config.ts files, runs every suite sequentially with its own config/auth/report settings, continues after suite failure and exits nonzero if any suite fails. Standard test:e2e and test:e2e:ui use this runner; UI windows open sequentially. Focused suite scripts remain available. The legacy config now collects root-level specs only, preventing duplicate collection of client and support-ticket directories. Preserved existing legacy port/baseURL edits and new support-ticket work. Updated client README, agent instructions and initial guidelines. All client projects, including four guarded mutations, are included; absent fixtures fail explicitly.

Verification executed:

- npm run test:e2e -- --list: passed; collected 54 tests across three configs: clients 32 (28 nonmutating + four isolated), legacy 11, support tickets 11. No overlapping spec files.
- npm run test:e2e -- --list --grep '^E2E_RUNNER_NO_MATCH_SENTINEL$': intentionally returned exit 1 after all three suites reported no matching tests; proves continuation and aggregate failure without browser/database actions.
- node --check scripts/run-e2e.mjs: passed.
- scripts/ai/typecheck: passed.
- scripts/ai/diff and scripts/ai/status: inspected after edits.

Full browser execution was not repeated: isolated client mutation fixtures remain unavailable. This correction establishes full-suite selection and truthful failure reporting, not a claim that all 54 tests pass. Existing client CP/MK execution evidence remains below. No dependencies installed, no application changes or fixture guard weakening. Existing login-form/auth helper/integration/session, opencode.json and support-ticket changes were left intact.

## SUPPORT-001 Playwright coverage

Added `playwright.support-tickets.config.ts` and `tests/e2e/support-tickets` for the staff ticket list, create, conversation, and access scenarios that do not depend on an open review decision. Login uses CP and MK on their registered hosts, with credentials from the ignored tenant env and sessions kept in memory. `npm run test:e2e:tickets` runs this project. The default `npm run test:e2e` command is unchanged.

Owned tickets are created and deleted during the run. Creation writes in-app staff notifications. It does not send customer SMS. Review-blocked scenarios (ST-F08, ST-U01, ST-C06, ST-P05, ST-A02, ST-A04, ST-D01) were not implemented. Subscriber checks were not written because no subscriber credentials were supplied.

Command: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_TICKET_ARTIFACT_DIR=/tmp/isp-support-tickets npm run test:e2e:tickets`

Result at 2026-11-12T15:07:19Z on revision 64fcbb7: 10 passed, 1 failed, 26.5s. Evidence: `tests/e2e/specifications/support-tickets/EXECUTION.json` and `/tmp/isp-support-tickets/results.json`.

Passed: ST-L01, ST-L04, ST-F01, ST-F03, ST-C01, ST-C02, ST-C03, ST-A01, the ST-A03 read/search/open/reply/delete denial, and ST-A05. These stay `implemented` with pending review, so they are not passing coverage.

Failed: `ST-A03 a foreign client id cannot replace the ticket client`. A CP update with an MK client's numeric id removes the original visible client. `UpdateTicketRequest` accepts `client_id` without a company-scoped exists check. Cleanup writes the original client id back and deletes the ticket. The assertion was not weakened.

Empty subject on create currently shows the raw Zod text "Expected number, received nan" and prevents "Client is required" from appearing. ST-F03 therefore selects a subject and checks the client and message errors. Missing-subject behavior remains unasserted until review.

Specification checker passed. `scripts/ai/typecheck` is recorded after the fixture typing fix. No dependencies were installed. No application ticket code was changed.

Unrelated dirty files left in place: `components/login/login-form.tsx`, `playwright.config.ts`, `playwright/.auth/user.json`, `tests/e2e/auth-integration.spec.ts`, `tests/e2e/helpers/auth.ts`, `opencode.json`, and the existing client-suite files. Prior client-suite notes follow.

## Follow-up: standard Playwright command wiring

The reported 27 failures were collected under the legacy chromium project: npm run test:e2e previously invoked playwright test with the original config, which discovered client specs with the wrong base URL/setup and included isolated mutations without required fixture controls. The dedicated client config had passed independently but was not wired into the standard npm command.

Updated package.json so test:e2e, test:e2e:ui and test:e2e:clients select the nonmutating clients-chromium project. Added test:e2e:clients:isolated for guarded mutations and test:e2e:legacy for existing auth/vendor/zone tests. Added only the client exclusion to the already modified legacy config; preserved its preexisting port/baseURL edits. Updated client README and agent guidance. Default command currently covers the ready client project, not all features or legacy tests. No tests were deleted or weakened.

Verification: E2E_CLIENT_ARTIFACT_DIR=/tmp/isp-client-default-command npm run test:e2e passed 28 tests in 46.1 seconds against default CP. Report: /tmp/isp-client-default-command/results.json. Discovery checks selected 28 default checks, four isolated tests, and 11 legacy tests without overlap. scripts/ai/typecheck passed. Specification checker passed integrity checks; coverage target remains unmet. Isolated mutation and legacy tests were not executed in this follow-up. No dependencies installed. Unit tests were not repeated for script/config-only changes; previous failures remain recorded below.

Unrelated login-form, auth integration/helper, tracked auth-state and opencode.json changes were preserved. The preexisting default config changes were preserved alongside the explicit exclusion. Prior implementation details follow.

## Summary

Partially implemented CLIENT-001 in tests/e2e/clients with an independent tenant-aware playwright.clients.config.ts. Added explicit CP/MK credential loading, strict same-origin UI login and independent REST profile verification, host-specific in-memory sessions, independent transport contracts, owned-client setup/cleanup guards, and scenario IDs in test titles. Default Playwright config/global setup/auth helper and existing application changes were preserved.

28 nonmutating browser checks cover list/total/reload; name/PPPoE/phone search; status and billing filters; month deep link; empty results; detail links/name/package; phone/WhatsApp targets; missing fields and minimum name; create cancel/defaults; four anonymous route denials; and bidirectional CP/MK known foreign UUID read/search denial. Four isolated mutation tests cover UI create, edit/preserve billing, cancel edit and optional IP clearing; collected/typechecked but not executed without isolated fake-backed fixtures.

Added runner README, all-48-scenario IMPLEMENTATION.md and sanitized EXECUTION.json with exact test titles, run commands, timestamps and source hashes. Updated CLIENT-001/register/inventory and agent guidelines to identify the separate runner. No whole parent scenario was credited as passing from incomplete slices; 16 parents have implemented slices and 32 remain blocked/pending prerequisites. This is not full CLIENT-001 completion or >90% coverage.

## Executed checks

- scripts/ai/typecheck: passed after implementation.
- CP: client Chromium project: 28 passed; command/timestamp in EXECUTION.json. Raw report /tmp/isp-client-e2e-cp/results.json.
- MK: client Chromium project: 28 passed; command/timestamp in EXECUTION.json. Raw report /tmp/isp-client-e2e-mk/results.json.
- Isolated project --list: four tests collected; no mutation execution.
- scripts/ai/test: failed in ten unchanged unit-test files (date pickers, menu, column persistence, reseller-client list/filter, client dashboard info, pay, maps); no fixes to those files included.
- Specification checker: inventory, links, IDs and register integrity passed.
- Earlier browser runs exposed fixture schema/selector/hydration issues; corrected and superseded by final passing CP/MK runs. Shared report directory was cleared during verification, so final evidence uses isolated run-specific output folders.

## Findings / prerequisites

API returns numeric SID/payment_deadline whereas application schema expects strings; tests use independent transport schema without changing application code. Desktop filter trigger lacks an accessible name; tests identify its rendered funnel icon. Create bootstrap can lose early typed values/native-submit before asynchronous defaults settle, so helper waits at create bootstrap only. Next-SID hint is configured but not rendered by current shared field code; no passing hint coverage claimed.

Full mutation tests need disposable database and fake router/SMS/Telegram adapters, tenant-owned network/package fixture and cleanup permissions. Restricted staff/subscriber/reseller/zone accounts and controlled server errors were not supplied. Review-blocked billing/locking/deletion/image cases remain explicit. Asked for fixture location while continuing independent checks; no reply received. No valid client save, customer notification, payment or hardware mutation was executed.

Tenant A/B read denial was verified for selected known clients; this does not prove all API mutation paths or full tenant isolation. APP administration was not substituted for company personas.

## Existing changes left untouched

components/login/login-form.tsx, playwright.config.ts, playwright/.auth/user.json, tests/e2e/auth-integration.spec.ts, tests/e2e/helpers/auth.ts and untracked opencode.json. Existing feature workspaces preserved except CLIENT-001 status/register links and suite guidance. Updated this report as required.

## Cursor platform-support execution guidance — 2026-11-13

Reviewed the platform-support README, nine task specifications, frontend feature workflow and architecture rule to answer how to instruct Cursor. The specification already requires PS-001 through PS-009 sequentially, with upstream acceptance evidence before downstream implementation. Recommended opening both sibling repositories, planning the current task against actual source, implementing one task per checkpoint and recording tests/blockers before advancing. PS-008 retains its six sequential content batches. No feature implementation or task-status changes performed.

Verification: ran scripts/ai/status before the report addition, and scripts/ai/diff plus scripts/ai/status afterwards. Application tests were not run for guidance/report-only work. Existing report entries preserved. Unrelated package.json, e2e guidance/register/inventory/reseller files, platform-support specifications/design, reseller suite/config and Codex logs were left untouched. No backend edits, dependency installations, commit, push or deployment.


## Dynamic help database proposal — 2026-11-14

Inspected the filesystem-backed help catalog, Markdown loader, authorization, topics, help centre and Laravel API routes/models. Proposed a platform-managed shared knowledge base in the existing Laravel database: help_categories, help_articles, help_article_translations, help_article_routes and help_article_relations, with media and revision tables as follow-ups. Preserve stable article keys/slugs, English/Bangla content, guide/FAQ kind, permission all/any rules, subscription feature rules and page context matching. Suggested database-backed Markdown with an admin editor and draft/preview/publish workflow. No migrations, endpoints or application behavior implemented.

Verification: read-only source inspection; scripts/ai/status showed a clean starting tree. Tests not run for design advice/report-only work. Only this report was edited; no unrelated starting changes found. Frontend diff/status reviewed after the addition.

## ISP referral program design — 2026-11-18

Reviewed marketing pricing and demo requests, demo approval and company provisioning, subscription invoice settlement, existing agent commissions, and frontend/backend tenant architecture. Demo approval already records the provisioned company. Subscription invoice payments support wallet and bKash. Existing agent commissions are tied to recharge flows.

Each new ISP tenant is one sale. An enrolled seller can be a tenant manager, a reseller representative, or an independent salesperson. Each referral is credited to one seller under their contract. A submitted referral appears in that seller's referral panel with Pending status and the contracted fixed amount or a percentage estimate. Confirm the contract's percentage base and the sale value by final approval, and retain the applied terms for audit. Use the existing demo request and company provisioning flows to capture attribution. Provide a distinct final sale approval action in platform administration because demo approval can provision a company before the sale is final.

Final platform approval makes the commission payable once per new tenant. Record the actual payout and transfer reference before marking it Paid. An invoice payment can support the approval decision if the business requires payment verification. Build seller enrollment and referral capture first, then final sale approval and commission records, then payout recording and seller history. Laravel enforces platform approval permissions and seller ownership.

Design discussion only. No application code changed and tests were not run. The frontend and backend started with clean working trees.

### Interactive HTML demo

Created an inline HTML mockup with a seller referral panel and a platform admin view. It uses sample sellers and tenants, supports referral submission, shows fixed and percentage commission examples, and illustrates Pending, Payable, and Paid. The admin flow previews the commission, rejects duplicate tenant IDs, and records a sample transfer reference. Interactions use local demo state. No application code changed.

Verified HTML script syntax and checked the mockup in Chromium at 1024 px and 320 px. Exercised referral submission, role switching, live commission calculation, duplicate prevention, approval, payout, and status filtering. Moved mobile row actions below customer names and confirmed they were reachable without horizontal scrolling.

### Database design

Proposed five platform-owned Laravel tables for sellers, versioned contracts, referrals, commissions, and payouts. Reuse users, reseller, companies, and demo_requests for identity and onboarding. Each referral retains its contract version. Pending earnings are derived from referral data, final approval atomically creates one commission, and recording a completed payout marks it paid. A unique target tenant identity and unique commission/payout relationships protect against duplicates. All monetary values are BDT, stored as integer poisha. The pilot assumes a full payout per commission and the admin-confirmed sale value as the percentage base.

Reviewed the company purge implementation, which disables foreign key handling. The proposal requires explicit detachment of deleted tenant and user references while retaining commission history and historical tenant identity. Created and type-checked the schema canvas. No migrations were written or run and the backend was left untouched.

### MySQL schema draft

Added `.ai/features/referrals/schema.sql` with the five proposed tables, their foreign keys, unique constraints, basic validation checks, and Laravel transaction rules. The draft targets MySQL 8.0.16+ and assumes positive approved sale and payout amounts. Verified existing referenced key types against the Laravel migrations and ran static schema checks for table order, foreign keys, constraint names, and uniqueness. No SQL was executed against a database. The existing referral report changes were preserved, and no backend code changed.

Removed the currency columns from contracts, commissions, and payouts in the SQL draft and schema canvas. All amounts are implicitly BDT. Confirmed no currency references remain in either design and type-checked the canvas. No database changes were applied.

### Sequential implementation workflow

Added `.ai/features/referrals/README.md` with RF-001 through RF-008 and 37 required test scenarios. The workflow covers migrations and models, seller enrollment, attribution through the demo and assisted paths, final platform approval, payout recording, retention during purge, seller/admin interfaces, and Playwright acceptance. Recorded pilot defaults for paying the enrolled seller, half-up percentage rounding, and public invalid-code handling.

Verified the eight task IDs are ordered, case IDs are unique, and local workflow links resolve. Reviewed diff and status. This was specification work, so no feature tests, application code, or database migrations were run. Left the existing untracked `.cursor/rules/readability.mdc` untouched.

### Referral coding conventions

Added required implementation references to the referral workflow. Frontend tasks follow Zones for CRUD structure and Expenses for filtered lists, using the existing shared components and thin App Router pages. Backend tasks follow Expenses for FormRequests, services, filters, and API Resources/Collections, with referral authorization applied before filtering and totals. Verified the source references, task order and 37 test IDs. Documentation only. The pre-existing `.cursor/rules/readability.mdc` was left untouched.

### Referral implementation and Codex usage planning

Reviewed the eight planned referral tasks and official Codex usage guidance. Recommended Medium for routine work and scoped High reasoning for approval/payout concurrency and tenant-purge review if needed. Suggested measuring allowance use after RF-001 and RF-002 before estimating the remaining work. No account usage was inspected beyond the user's stated percentage. No implementation or feature tests were run.

### RF-001 through RF-003 implementation handoff

Implemented the three backend tasks in the sibling ISP API repository. Updated the referral workflow status and documented the live code paths and payloads for the frontend and RF-004. The schema allows 200 characters for prospect names to match existing demo submissions. The existing untracked readability rule was left untouched. Frontend application code was not changed. The referral panel and public form work remain in RF-007.

### RF-003 through RF-006 handoff

Reverified RF-003 and added the eligibility rule that new demo attribution precedes provisioning. Implemented RF-004 as the prerequisite for payout recording, then implemented RF-005 and RF-006 in the Laravel repository. Updated the workflow status, API payloads and capability names, and recorded the supported payout methods. The backend regression run passed 262 tests. The frontend change is documentation only. Left the existing untracked readability rule untouched. RF-007 is next.

## RF-007 and RF-008 — 19 November 2026

Implemented the seller panel, platform referral sales, and seller management using the existing Zones/Expenses structure, FormBuilder, DataTable, API hooks, permission checks and English/Bangla translations. Added contract history, seller enrollment/deactivation, public/direct/assisted attribution, sale approval/rejection, and completed-payout recording. Money and rates use BDT/percentage inputs converted to integer API units. Reused company provisioning and demo approval forms. Shared labels now identify the actual text, dropdown and date controls.

Added the isolated referral Playwright runner and Laravel fixture. It boots a fresh application per HTTP request while sharing only the run's SQLite in-memory connection, fakes external integrations and uses temporary storage. A scratch Next.js server uses the current source without touching the existing development process or database. Generated credentials remain in the runner. The suite signs in on registered app/cp/mk hosts with separate contexts. Earlier failed runs exposed CSRF initialization, fixture lifecycle and memory issues; the passing run supersedes them.

### Executed checks

- TypeScript passed via scripts/ai/typecheck.
- Focused Vitest run passed 27 tests across referrals, public demo schema, and menu behavior.
- scripts/ai/frontend-check completed typecheck and ran all Vitest files. Result was 738 passing and 19 failing tests across nine files. An archive of HEAD produced the same 19 failures, with matching failure headings. Existing failures cover maps, client filters/list/dashboard, column visibility, date pickers and public pay.
- RF-008-E01 through E06 passed in Chromium against actual Next.js server actions and Laravel routes. Verified Pending to Payable to Paid, contract snapshots, duplicate prevention, separate approver/finance capabilities, cross-seller and unrelated-company denial, same-browser logout/new login, exact authority-free seller payload, error recovery, keyboard behavior and mobile/localized views. Checked scroll stability during dialog interactions and a delayed filter refresh.
- Backend targeted regression passed 56 tests and 576 assertions. Pint passed for the browser fixture.
- The global coverage checker stops on three pre-existing unmapped Help Management pages, reproduced against HEAD. Verified the new referral register entries, route mapping, links and exact source hashes independently.
- Evidence and inspected screenshots are under .ai/features/referrals/evidence. The raw passing browser report is /private/tmp/isp-rf-run11/results.json.

### Scope and remaining verification

All eight referral implementation tasks are complete in the working tree. The browser verification used SQLite and faked external services. The earlier MySQL-specific migration/concurrency coverage gap remains. No live migrations, transfers, permission sync, deployment, commits or pushes were performed. The existing untracked .cursor/rules/readability.mdc and earlier referral work were preserved. Schema migration and permission catalog publication remain release preparation steps.

## Existing local referral showcase — 19 November 2026

Updated referral workflow documentation for the local Laravel seed and existing platform sales staff enrollment. No frontend application source changed this turn.

The sibling backend's ReferralOverviewSeeder ran twice against the existing local app container, adding sales-man, VP owner vpc and vp-reseller profiles, immutable contracts, and 15 labelled demo referrals. Each seller has five examples. The administration overview shows Pending BDT 14,250, Payable BDT 9,000 and Paid BDT 11,500. No money transferred. Existing VP/reseller passwords and all role permission grants are preserved. The Sells man role already had seller-profile management permissions. The existing referral migration was already applied; this task ran no migration or permission sync. Sample tenant identities use example.test domains without login, wallet, subscription or router setup.

Verified the actual app.isp.test/platform-referrals Chrome page displayed seeded rows, commission terms, statuses and those totals. Confirmed the second seed left all five referral tables byte-for-byte identical through a stable JSON SHA-256 fingerprint. Seller-scoped service queries return five rows each. Backend referral regression: 31 tests passed (479 assertions); Pint and PHPStan on the changed backend seeder/service/config passed. No frontend checks were rerun for these documentation-only edits. Earlier browser acceptance evidence was preserved for its recorded revision.

Read status and reviewed diff before/after. Earlier feature changes, .cursor/rules/readability.mdc and unrelated working-tree edits remain intact. Rerun and login details are in ../isp-backend/docs/referral-demo-seeding.md. No packages, resets, commits, pushes or deployments.
## Referral menu icon — 19 November 2026

Changed only the `/referrals` menu icon from `UserCheck` to Lucide `Handshake`, representing a referral partnership and distinguishing it from Resellers. The existing 20 px icon rendering is preserved.

Verification: `scripts/ai/typecheck` passed. Focused menu Vitest run completed with 14 passing tests and one failure: the existing expected sidebar order places `/referrals` near the top while the current working tree places it near the bottom. This change does not alter menu order. `scripts/ai/test` ignores extra arguments and started the full suite; stopped that run and used `npx vitest run tests/unit/menu/menu-items.test.ts` for the focused check. Browser mobile/desktop checks were not run for this icon substitution. Reviewed status and diff; all earlier referral, demo-request, shared-form, translation, package, e2e, test and report changes, plus the untracked readability rule, were preserved.



## Referral status dropdown — 19 November 2026

Replaced the native status select in components/referrals/referral-table.tsx with the existing SelectDropdown and a local React Hook Form provider. Watched form state preserves status query filtering; clearing restores all statuses. Kept translated option keys and an accessible hidden label. Reserved a fixed dropdown width so status changes do not resize adjacent controls. The shared dropdown component was not modified.

Verification: scripts/ai/typecheck passed; npx vitest run tests/unit/referrals/referral-form.test.ts passed all six existing tests. Browser discovery failed because the browser access host is unavailable, so desktop/mobile interactions and refresh stability were not verified in a browser. No new endpoints, tenant inputs, permissions, or caching changes. Existing unrelated referral, demo-request, shared-form, menu, translation, package, e2e, test, report and readability-rule work was preserved. Reviewed scripts/ai/diff and scripts/ai/status.


## Referral copy-link fix — 19 November 2026

The share-link handler depended entirely on navigator.clipboard.writeText, which is unavailable on the local insecure HTTP site. Extracted the existing client phone-copy fallback into lib/helper/helper.ts and added copyTextToClipboard, which tries the secure Clipboard API and falls back to document copy when unavailable or rejected. Both phone and referral copying reuse the fallback. It removes its temporary textarea, restores focus with preventScroll, and reports actual copy success. The referral still copies the anchor’s absolute URL; failure retains the translated manual-copy instruction.

Verification: scripts/ai/typecheck passed. Focused Vitest run passed 23 tests across referral clipboard, referral form and client phone cells. The five new clipboard regressions cover secure copying, HTTP without the API, permission rejection, refusal and exceptions, including cleanup and focus restoration. Verified the actual HTTP vp.isp.test/referrals page in Chrome through native app access: Copy link displayed Referral link copied, and pasting into the address bar produced http://vp.isp.test/demo-request?ref=DEMO-VP-MANAGER without navigating. No mobile viewport verification was performed. No dependency, backend, tenant, permission or cache changes. Preserved prior unrelated referral, demo-request, form, menu, translation, package, test, e2e, report and readability-rule changes. Reviewed scripts/ai/diff and scripts/ai/status.


## Referral primary action colors — 19 November 2026

Set explicit MyButton variant=default for Add Referral, assisted attribution, seller enrollment, new contracts, company creation, approval and payout triggers across referral-form.tsx, referral-seller-form.tsx and referral-column.tsx. These had inherited or explicitly selected the outline style. Shared forms also apply the fix to user enrollment and demo-request attribution entry points. Secondary navigation, copy, details/history, retry, rejection and deactivation retain their existing styles. Shared primitives, dimensions, permissions and behavior are unchanged.

Verification: scripts/ai/typecheck passed; npx vitest run tests/unit/referrals passed all 11 tests. Visually verified the themed primary Add Referral button in Chrome at desktop width and iPhone 16 emulation (393 px). Opened and cancelled the Add Referral dialog and confirmed the underlying layout and page position stayed stable. Restored desktop mode and closed DevTools. Other primary trigger variants were reviewed in source; no submissions, approvals or payouts were performed. No asynchronous loading behavior changed. Reviewed scripts/ai/diff and scripts/ai/status. Preserved all pre-existing referral, clipboard, demo-request, shared-form, menu, translation, package, e2e, test, report and readability-rule work.


## Referral form placeholders — 19 November 2026

Added meaningful placeholder keys to every referral text/amount field, decision textarea and date picker. Amount and percentage hints include examples in displayed units. Approval notes describe optional input; rejection notes ask for the required rejection reason. Seller-type and payment-method dropdowns already had appropriate prompts. Commission radio choices use their visible labels. Added all 14 new keys in English and Bangla. The public demo-request referral-code input now uses the same translated prompt. Reviewed company provisioning fields, which already have placeholders. No validation, payload, layout or shared control behavior changed.

Verification: scripts/ai/typecheck passed. Referral unit tests passed 11 tests; demo-request schema tests passed six tests. Statically verified all generated text and explicit date/note placeholder keys exist and are nonempty in both locale files, with matching key sets. In Chrome, reloaded language resources and verified Add Referral placeholders visually at desktop and 393 px mobile width. Opened and cancelled the form, confirmed no placeholder-driven movement, restored desktop mode and closed DevTools. Other referral forms and Bangla placeholders were checked in source rather than individually exercised in the browser. No records submitted. Reviewed scripts/ai/diff and scripts/ai/status; all prior unrelated referral, clipboard, shared-form, demo-request, menu, translation, package, e2e, test, report and readability-rule edits were preserved.

## Fund report acceptance — 19 November 2026

Implemented REPORTS-FUNDS-001 (FT063-01 through FT063-12) with a focused Playwright config, npm command and disposable runner, plus a sibling Laravel SQLite browser fixture. The standard E2E runner discovers the new config. Actual CP/MK/APP registered-host UI login, Next server actions, Laravel permissions, subscription and tenant middleware are exercised. Generated credentials remain ephemeral. The fixture has known positive, negative, zero and excluded balances; all metadata edits and page-size changes are disposable. No local MySQL, real transfer, message or device is touched.

The report has no date/status filter, create, export or print controls; the reviewed specification tests their absence. Tests cover exact full/filter balances, included/excluded identities, pagination and columns, edit hydration/cancel/persistence, validation, read-only and denied users, foreign UUIDs and staff relations, reseller/platform scopes, sign-out and fresh MK login, delayed/failing reads and retry, rapid filters, and desktop/mobile localized themes. The screenshot assertions wait for the visible balance animation to finish, rather than only checking its screen-reader final value.

Fixed three defects exposed by the suite: the report resets an invalid page after a page-size change; failed reads expose a translated alert and Retry in a reserved slot while preserving refresh data; backend fund requests reject foreign company/reseller staff and writable tenant identifiers. Existing staff/name/account editing and balance conventions stay compatible. No shared shadcn primitives were changed. Legacy unnamed toolbar/action icons remain; selectors identify their specific icon within the proper row or toolbar.

Checks: TypeScript passed. The complete frontend check ran: Vitest 742 passed, 20 failed. An archived untouched HEAD run returned the same 20 failures with identical failure titles; no new unit regression. Logs: /private/tmp/isp-funds-frontend-check.log and /private/tmp/isp-funds-baseline-check.log. Backend FundReportAcceptanceTest plus existing FundControllerTest: 28 passed, 109 assertions, SQLite :memory:. Pint passed for the changed backend requests/fixture/tests; PHPStan level 5 passed for both requests.

Browser results, exact source hashes and screenshots are recorded in tests/e2e/specifications/reports-funds/evidence/run.json. Coverage register entries and /reports/funds route mapping reference executed FT063 scenarios. Global check_coverage.py remains blocked by three existing unmapped Help Management pages (categories, main page, preview/[id]); the HEAD inventory has the same mismatch. Fund-only IDs, source hashes and evidence are verified separately. No claim of overall >90% suite coverage or cross-browser/MySQL concurrency coverage.

Started with clean front/back worktrees. Reviewed final diff/status; no unrelated modifications were removed. No install, environment/infrastructure change, migration, seed of local data, commit, push or deployment.

Final fund browser run: 12/12 passed, zero skips/retries, 52.9 seconds, /private/tmp/isp-funds-run9/results.json (19 November 2026). Inspected desktop/light and 390px Bangla/dark screenshots after final visible balance assertions. Final typecheck and whitespace checks passed. Concurrent untracked products E2E files/config/runner appeared during this task and were left untouched.


## Products acceptance and fixes — 19 November 2026

Reviewed PRODUCTS-001 and actual frontend/Laravel contracts, then implemented a disposable product acceptance runner, fixture and 50 executable cases. The npm test:e2e:products command uses a scratch Next.js instance, registered CP browser origin, independently authenticated CP/MK API personas, generated credentials, SQLite memory and faked queue/HTTP/notification/storage integrations. The standard suite dispatcher includes it. All six scoped routes have executed evidence. No existing local stock, funds, sessions, environment or development process was modified.

Fixed UUID/numeric identifier typing, trimmed/length-limited product inputs, required dates and positive quantities, duplicate serial validation, direct-URL permission states, report-only access, mode-specific filter reset, and missing accessible button names. Product forms opt into a shared submission lock; the held-save test reproduced two persisted products before the fix and one afterward. Existing autosave defaults remain compatible. Valid rows stay visible through delayed and failed background refreshes, with notification retry on failure. English/Bangla validation strings and settled desktop/mobile light/dark screenshots were verified.

Backend changes add company/reseller-scoped relation validation and prohibit writable tenant fields. Stock-out locks the selected lot, checks remaining stock and product/serial ownership, and rolls back partial multi-line failures. Stock-in rejects existing/repeated serials while locking the product. Deletion locks that same product row and refuses stock/serial history. Fixed entry_by identity mapping, inclusive calendar-date filters, nullable expense notes and creator stamping. Added accurate relation signatures for static checking. Preserved the user-approved existing invoice formula (base quantity times price minus discount, excluding VAT) and the asynchronous workflow; worker failure retains committed stock. Existing queue dispatch timing was preserved so synchronous enqueue exceptions remain in the transaction.

Executed checks:
- Final browser/API run: PRD_E2E_ARTIFACT_DIR=/private/tmp/isp-products-final8 npm run test:e2e:products — 50 passed, no skips or flaky results. Raw JSON and artifacts remain there; sanitized evidence, source hashes, exact titles and inspected screenshots are under tests/e2e/specifications/products/evidence.
- Backend product regression: scripts/ai/backend-test with ProductControllerTest, ProductInControllerTest, ProductOutControllerTest, ProductCodeGeneratorTest and ProductIntegrityTest — 70 passed, 283 assertions. Pint/PHPStan passed on all 17 changed backend files.
- Product Vitest: nine passed. Typecheck passed. Final scripts/ai/frontend-check: 749 passed, 20 failed (769 total). A clean HEAD archive produced 742 passed and the same 20 failures; failure-heading sets match exactly. Existing failures cover maps, client filters/list/dashboard, date pickers, column visibility and public pay. The shared toolbar tests were updated to assert the newly accessible control names rather than anonymous buttons.
- Product evidence validation checked every recorded source hash, manifest digest, local specification link, unique scenario ID, test reference and all six route mappings. Global coverage checking stops on the same three pre-existing unmapped Help Management pages as HEAD. CRLF-aware git diff checking passed; existing CRLF file style was retained.

Coverage is deliberately not called release-complete: the register contains 51 passes and one blocked P0 real-database concurrency case (98.08% scenario pass coverage, 96.77% critical coverage, 100% review readiness). The fixture serializes HTTP requests, and backend AGENTS.md/.ai/safety.md require SQLite memory and forbid MySQL tests. Passing competing-request tests are not proof of MySQL lock scheduling. Queue payloads and committed stock were verified with a fake queue; invoice-worker delivery/replay was not claimed.

Boundary review: relations are loaded through authenticated company/reseller model scopes, foreign UUID/numeric references and sibling reseller relations are denied, and client-provided company_id/reseller_id cannot select ownership. Product screens use exact route permissions; backend tests separately prove enforcement. No tenant-wide or platform bypass, auth/session/cache transport change, live migration, dependency install, commit, push or deployment was performed.

Preserved the concurrent/unrelated fund-report work: components/funds/fund-table.tsx; fund report config/runner/suite/specifications/evidence; sibling StoreFundRequest, UpdateFundRequest, FundReportFixture and FundReportAcceptanceTest; and earlier report entries. Shared package.json, suite dispatcher, e2e guidance and coverage/route inventories retain those additions. Read starting git status and final scripts/ai/status in both repositories; reviewed scoped diffs and saved the full diff outputs for audit.

## Users: enrolled seller indicator — 21 November 2026

On the administration Users table, an existing referral seller profile now displays a disabled, translated Enrolled indicator instead of reopening Enroll Seller. Users without a profile retain the action. Active and inactive profiles both count as enrolled because the existing one-profile-per-user constraint prevents reenrollment. Both states reserve the same minimum width. The enrollment form invalidates both platform-referral-sellers and users after success using the existing comma-separated query-key convention. Added optional boolean is_referral_seller to the user row schema and changed touched Users column imports to aliases.

The API supplies the enrollment flag through a single withExists query, exposed only to viewers with platform seller enrollment capability. No per-row profile fetch, code/contract/commission disclosure, new endpoint, dependency or shadcn primitive change. Existing creation/edit/delete actions and backend duplicate validation remain intact.

Verified app.isp.test/users in the existing authorized Super Admin Chrome session: Demo Sales Person and enrolled CP manager show Enrolled; other users retain Enroll Seller. Checked desktop and 390px mobile actions through the existing horizontal table scroll; restored viewport. No live enrollment or business data was changed. Added a two-case visible-action regression test. Focused referral/user Vitest: 15 passed; TypeScript passed, including a final check after import cleanup. Full scripts/ai/frontend-check ran: 758 passed, 20 failed across unrelated existing menu/maps/client/date/pay tests; these failures are outside this change. Backend verification: 55 passed, 241 assertions. Backend static analysis reported the same nine errors as the HEAD copies, with no new diagnostics.

Reviewed diff/status and whitespace. Both worktrees began clean (backend already behind origin/main by one commit following the user's earlier local undo). No history changes, migration, seed, package install, environment edits, commit, push or deployment. Light theme was checked in the live browser; dark styling uses existing MyButton variants and theme tokens but was not separately exercised. The immediate post-enrollment state is covered by API reread regression and query invalidation wiring; live enrollment was not performed to avoid changing existing users.

### Seller type labels and check icon — 21 November 2026

Extended the pending enrolled-status work to display Enrolled as tenant, Enrolled as independent, or Enrolled as reseller using the saved referral profile type. Added English/Bangla translations and a decorative CircleCheck icon. The label remains disabled; existing unregistered users keep Enroll Seller. Both variants reserve the same minimum width to prevent action movement when enrollment updates.

Added optional nullable referral_seller_type to UserRow and passed it to the existing enrollment component. The backend conditionally eager-loads only profile id/user_id/seller_type for authorized enrollment viewers; the resource emits only the type. No per-row fetch, role-based guess, profile code or financial metadata is added. A generic Enrolled fallback remains for older responses lacking the optional type.

Tests: TypeScript passed. Focused referral/user Vitest: 18 passed, including all three labels and their check icons. Backend related regression: 58 passed, 250 assertions; Pint passed. Verified the local Users page at desktop and 390px mobile with existing Demo Sales Person (independent) and CP manager (tenant); labels and checked icons display fully within the table's existing horizontal scroll. Viewport was restored. Reseller rendering is covered by the frontend/backend parameterized tests. No live enrollment data changed. The full frontend suite was not repeated for this extension; its existing failures remain recorded above. Previous uncommitted enrolled-status changes were retained, and final diff/status/whitespace reviewed.

### Compact enrollment actions and referral-code generation — 21 November 2026

Removed the forced min-w-60 width from enrollment and enrolled-state buttons, retaining standard MyButton padding. Added a translated Generate action immediately after the referral-code input using FormBuilder's existing render-field children API and React Hook Form context. Generation inserts an editable uppercase REF- plus twelve hexadecimal characters using crypto.getRandomValues, marks the code dirty/touched, and validates it. The button is type=button and does not submit, change the selected user, or alter any other field. Repeated clicks replace the code. Existing backend uniqueness validation remains authoritative. getRandomValues works on the user's HTTP local hostname without requiring randomUUID's secure-context restriction.

Added a regression test exercising code insertion, schema acceptance, unchanged selected user, manual editing, regeneration and no form submission. TypeScript passed. npm run test -- tests/unit/referrals tests/unit/users: 19 passed across five files. The initial isolated generator test import reached Auth.js through the form/dialog module; it was corrected to mock unused form/dialog dependencies, and the final focused run passed. No dependency or test configuration changed. The broader suite was not rerun; its previously recorded unrelated failures are unaffected by this scoped test result.

Verified the actual app.isp.test/users form in Chrome: compact table buttons, a Generate button beside Referral Code, code insertion and regeneration on desktop/390px mobile, original account UUID retained and the dialog remaining open. Input/button fit the mobile width and generation did not shift the form layout. Restored the viewport and cancelled the draft without saving; no live enrollment was created. English/Bangla labels were added. No shared UI primitive or backend was changed in this turn. Earlier pending enrollment status/type changes were preserved. Reviewed final diff/status and whitespace; no package install, seed, migration, environment change, commit, push or deployment.

### Generate control alignment — 21 November 2026

Corrected the referral-code row by placing its existing label above the shared input/button row, removing the generator's margin-based vertical offset, and using MyButton size=default (36px), matching the shared input's h-9. Validation messages remain below the input without moving the button's top edge. No shared primitives or generation/save behavior changed.

Verified actual browser DOM geometry in the local enrollment dialog: desktop input/button top=520.5px and height=36px; at 390px mobile both top=478.5px and height=36px. Inspected both screenshots; labels, controls and mobile width fit correctly. Restored viewport and cancelled the empty draft. TypeScript passed; focused generator/enrollment status tests passed (6 tests). Earlier pending referral UI/API work was preserved. No backend edits, live enrollment, dependency installation, commits or deployments. Final diff/status and whitespace reviewed.

## Independent referral sidebar — 21 November 2026

Independent referral profiles now see only My referrals in sidebar navigation. selectMenuItems receives isIndependentReferral from the authenticated profile's saved referral_seller_type, not a role-name or company-id guess. It hides all other sidebar entries for this profile type and keeps the seller's authorized referral history enabled independently of subscription feature locks, matching the existing referral API behavior. A profile flag never creates a permission: referrals.access is still required. Tenant and reseller menu behavior is retained, including the preexisting absence of Subscription for reseller users. API permissions and direct-route authorization were not changed.

The settings API now loads the caller's own referralSeller id/user_id/seller_type, and UserProfileResource includes the nullable type. Profile typing carries it into AppProvider/useMenuItems. Inactive independent profiles still see their history. Existing enrollment/type/code-generator changes remain pending in the tree and were preserved.

Verification: TypeScript passed. Four new independent sidebar tests passed in a focused run; the full menu test file reports 18 passed and the same preexisting admin menu-order failure (its expected position of /referrals differs from current configuration). The first new reseller assertion incorrectly expected Subscription to exist; corrected it against existing hideForReseller behavior, then reran. Backend related tests: 60 passed, 280 assertions. Pint passed for changed backend files/test; PHPStan on UserProfileResource passed. Earlier controller/model baseline findings remain documented above; the full unit suite was not repeated.

Verified actual Chrome navigation via administration Login as Demo Sales Person: sidebar contains only My referrals, with no Subscription or Platform Support entries; the seeded dashboard and totals load normally. This verifies the switched session in the live app; direct user settings for all three seller types are covered by backend tests. Left the result open. This is a navigation-only change; no layout/style additions or existing business records changed. Reviewed final diff/status/whitespace, retaining previous pending edits. No dependency installs, database migrations/seeding, history changes, commits, pushes or deployments.

## Three-slot DataTable toolbar preview — 22 November 2026

Built the proposed start / center / end toolbar as an opt-in path, shown on a temporary client table page at /clients-toolbar-preview. New parts in components/data-table/toolbar/: toolbar-layout (the only file that positions slots: a 3-column grid on desktop with equal growing sides, so the center stays centered; stacked rows on mobile), toolbar-start (title, page info, faceted filters, reset), toolbar-actions (page actions first, then columns, fixed/full layout, filter, add), toolbar-filter (desktop trigger and open row, mobile drawer, simple-search trigger), use-mobile-simple-search, and data-table-slot-toolbar (state only). DataTable gains toolbarStart, toolbarCenter and toolbarEnd; passing any of them selects the new toolbar, so the existing 145 tables are unchanged. The desktop filter's open state moved from FormFilter into the toolbar, and FormFilter uses the shared filter hook, so values survive the swap; closing still clears an active filter.

Temporary files: components/clients/client-table-preview.tsx (copy of client-table with toolbarCenter=ClientCount and toolbarEnd=settings) and app/(dashboard)/clients-toolbar-preview/page.tsx.

Verified headless in the local tenant at 1440, 1024 and 390px: no horizontal overflow; at 1440 the center lines up with the toolbar's middle (x = 848). Fixed two issues found during that check: the column-view button's ml-auto split the end group, and FormFilter's mt-1 moved the table 4px when the filter opened. After the fixes, the table stays at the same y through filter open and close. At 1024 the center sits slightly right of the middle because the end group needs more width. On mobile the table moves 28px during load, the same as the current page; the cause is isMobile resolving after the first render. TypeScript passed. Unit tests: 766 passed, with the same 20 failures as before this change. Not committed; the call-site migration is waiting for approval.

### Toolbar preview: nested config — 22 November 2026

Replaced the flat toolbarStart/Center/End props with one nested config, as approved. DataTable's toolbar prop is now boolean | DataTableToolbarConfig (components/data-table/toolbar/toolbar-config.ts); the 12 existing boolean callers are unchanged, and a config object selects the new toolbar. The config has title, start/center/end arrays of { key, node, show?, mobile?: inline | row | hidden } (array order is render order), and features { columns, layoutToggle (default true), filter (toolbar options + simpleSearch), add }. Built-in features cannot be moved: the end slot always renders page items, then columns, layout toggle, filter, add. features.columns also turns on the saved column choices that toggleColumns enabled before.

The preview client table now builds this config: title, ClientCount in start with mobile "row", settings in end, and features for columns, filter with simple search, and add. TypeScript passed. Unit tests: same 20 failures as before this change. Headless check at 1440, 1024 and 390px: the layout matches the current /clients page; no horizontal overflow; the table stays at the same y when the filter opens and closes; on mobile the counts get their own centered row. Hid the Zone column, reloaded, confirmed it stayed hidden, then restored it. Not committed.

## DataTable toolbar migration to nested config — 22 November 2026

Every DataTable now uses one toolbar prop: `toolbar?: boolean | DataTableToolbarConfig` (components/data-table/toolbar/toolbar-config.ts). The old flat props are gone: toolbarTitle, toolbarTitleClass, toolbarInfoComponent, toolbarOptions, toggleColumns, form, toolbarBeforeViewOptions, toolbarBeforeForm, simpleSearch and wrapActionsOnMobile. With them removed, the compiler checks that no call site was missed. The old components/data-table/data-table-toolbar.tsx was deleted; the new toolbar is components/data-table/toolbar/data-table-toolbar.tsx plus its layout, start, actions, filter and simple-search parts.

Config: title, start/center/end arrays of { key, node, show?, mobile? }, features { columns, layoutToggle (default true), filter, add (element or component) }, and mobileActions. Built-ins have a fixed order: page end items, columns, layout toggle, filter, add. Without center items, the desktop layout is the previous flex row; with them, a 3-column grid. The previous markup and spacing are kept, including the closed filter button's mt-1 box, so pages look the same. features.columns also turns on the saved column choices.

Conversion: a TypeScript-AST script converted 63 usages, copying each prop's expression unchanged and keeping each file's line endings. client-table and both help-management tables were converted by hand. Tables with toolbar={tableToolBar} became `tableToolBar ? {...} : false`. client-history's toolbar={false} lost its toolbarTitle/toggleColumns, which had no effect without a toolbar. The 9 toolbar={false}-only tables are unchanged. The one intended behavior change is companies (approved): the Import button moved from after the filter to before the column menu. The help article dialog is placed the same way. The temporary preview page and table were deleted. Updated .cursor/skills/agent/SKILL.md to the new API.

Verification:
- Typecheck passed.
- Unit tests: 776 passed, 20 failed. The failing set is identical to the pre-change baseline (checked with diff). It includes the 2 pre-existing column-visibility failures (missing QueryClient in that test) and 2 reseller-client-table failures (outdated expected filter list).
- Existing toolbar tests (mobile simple search, filter result count, filter row actions, column persistence) were first run unchanged through the new toolbar via a temporary adapter, then converted to the config API.
- Added tests/unit/data-table/toolbar-config.test.tsx (10 tests): built-in order, switching built-ins off, add as element or component, show:false and empty items, centered versus plain layout, mobile title, row and hidden rules, mobile actions row, and filter reset on close.
- Browser: recorded a baseline of 97 static dashboard routes at 1440 and 390px (194 page views, 63 pages with toolbars) on the pre-change code, with toolbar text, ordered button labels, inputs, toolbar height, table top, horizontal overflow, page errors and desktop filter open/close states. After migration, 191 of 194 views are identical; the 3 differences are a live activity-log count and the approved companies Import move. Detail pages (client view, reseller view, client package, ticket, imports, products reports/in/out, invoices by client, permissions; 22 views) were recorded on the pre-change code via a temporary git stash, which was then restored: 0 differences.
- Interaction checks in the real app (all passed): desktop client search narrowed 10 rows to 1, and closing the filter restored 10; the client settings dialog opens; the layout toggle switches and returns; a hidden column stays hidden after reload and was restored; Add opens the zone dialog and the client create link; mobile invoice filter drawer applies and closes; mobile products actions sit on their own row; the mobile client counts row is present.
- Not covered: platform-only and client-portal pages (the tenant user cannot open them), OLT detail pages (no OLTs in the tenant), and Playwright e2e. Not committed.

## Settings refactor: registry, core, ui — 22 November 2026

Replaced the settings code (settings-type.ts, settings-form-schema.ts, the 420-line settings-form.tsx, settings-section-button.tsx) with:
- registry/: define.ts (toggle/select/text/number), fields.ts (every setting once), sections.ts (6 pages and 7 ⚙ dialogs, grouped), options.ts.
- core/: values.ts (one read and save rule per kind), use-save-setting.ts (the one company save path), visibility.ts (permissions, visibleWhen).
- ui/: settings-panel.tsx, setting-controls.tsx, settings-button.tsx (SettingsButton, PrefixSettingsButton).

Adding a setting is now one registry line, its key in a section, and a label in en/bn. All consumers were switched: 6 pages, client/olt/telegram/sms-send dialogs, 5 prefix buttons, client form, notification settings (now uses the shared save hook), and the reseller dialog (value helpers only; it keeps its own reseller_uuid save).

Deleted the unlinked /setting/{dashboard,general,table,themes} pages and their 5 helper files. themes.tsx stays: the theme customizer uses ThemeSettingsPanel.

Approved UI changes:
- grouped cards with headings (settings.groups.* in en/bn);
- no Active/Inactive text next to switches;
- wider max-w-3xl layout and shadcn select;
- Client Auto Inactive Time hidden while Auto Inactive Client Invoice Due is off.

Behavior parity:
- Before deleting the old code, a test compared the old and new read and save functions for all 46 settings × 45 stored values (empty, spaces, out-of-range, strings, booleans, "2", objects, NaN), plus every old section's order: 56/56 identical. The old outputs were saved as tests/unit/settings/fixtures/setting-values.json and are checked permanently by setting-values.test.ts. settings-sections.test.ts fixes each page and dialog order. The 7 existing settings tests were pointed at the new modules with their assertions unchanged.
- Typecheck passed. Unit tests: 838 passed, 20 failed; the failing set is identical to the baseline.
- Browser: recorded all 6 settings pages and 9 ⚙ dialogs at 1440 and 390px on the old code (label order, control type, shown value, disabled state, overflow), then on the new code: no differences in 32 captures, no page errors.
- Real saves through the new UI, each checked in MySQL and restored: switch 0→1→0; dropdown 2→5→2; text saved with Enter and with Save, INV→INVX→INV; Cancel does not save; the dependent field hides while its parent is off (1→0→1); an out-of-range ONU dBm shows the range error and saves nothing; a notification switch 1→0→1 shows the success message; the reseller dialog opens and reads its value (not saved, to avoid creating a reseller row). Database values afterwards equal those recorded before.

No line-ending changes (41 files checked). Not committed.

## Toolbar button alignment and size (products and all list pages)

- Problem: on /products the filter button sat 2px lower than its neighbours (old `mt-1` wrapper), and icon-only buttons had mixed widths (36 / 50 / 48 px).
- Fix (shared toolbar parts): the view-options, layout-toggle and filter buttons (desktop trigger, mobile drawer, simple search) are now `size="icon"` (36×36) and the filter wrapper is gone. View options lost `ml-auto`, which left a gap on mobile, and an invisible label `div` (`md:show` is not a Tailwind class). `FormTrigger` create and the client Add link use `size="icon"` on mobile.
- Also: `DashboardTopDueInvoicesTable` hides the layout toggle (`layoutToggle: false`).
- Effect: every list toolbar is 4px shorter on desktop, and icon buttons are 14px narrower.
- Checked: Playwright measured /products and /clients at 1440 and 390 px; all buttons are h36 on one line, icon buttons are w36. `scripts/ai/typecheck` passes. `scripts/ai/test`: 838 passed, same 20 baseline failures.
- Not mine: `components/dashboard/items/DashboardZoneDueSummaryTable.tsx` has an uncommitted change that I left alone.

## MikroTik Sync: Import and All Sync moved into the toolbar

- Problem: on phones, the two network form cards pushed the table to 551px down an 844px screen.
- Option chosen by the user from three: toolbar buttons that open a dialog, on every screen size.
- `mikrotik-sync-form.tsx` now exports `MikrotikSyncActionButton({action})`. It is an outline button: icon only below md, icon and label from md up. It opens a `MyDialog` with the action name as title, the old help line as description, and the network select with submit. On success the form resets and the dialog closes. API calls, permissions (`mikrotik-sync.load` and `mikrotik-sync.all-sync`) and toasts are unchanged.
- `mikrotik-sync-table.tsx`: the form cards are removed, and the buttons are toolbar `end` items with `show: canLoad` / `show: canResolve`. The bulk-import button now reads "Import selected (n)", using a new key `mikrotik_sync.actions.import_selected` in en and bn, so it is not a second "Import". It is icon only on phones.
- Checked: the table top moved from 551 to 239px on a 390px phone and to 187px on 1440 desktop. The toolbar stays on one row with all buttons 36px tall and there is no horizontal scroll. Selecting rows adds the bulk button on the same row. The All Sync dialog opens, empty submit shows the network error, and the network list opens. I did not submit a real load or sync, because that would call the router. `scripts/ai/typecheck` passes. `scripts/ai/test` shows the same 20 baseline failures.

## Top navbar: notification bell size

- The bell was `size="default"`, 50×36. The other icon buttons (support, theme) are 36×36. Changed it to `size="icon"` in `components/notifications/notification-bell.tsx`. The badge position is unchanged.
- Checked: Playwright measured the navbar at 1440 and 390px. The bell is now 36×36 at the same y as its neighbours. `scripts/ai/typecheck` passes, and `notification-bell.test.tsx` passes 5/5.

## Client map: show clients without a device

- With the backend change (`isp-backend` `getClientMaps`), the payload is `{ devices, clients }`.
- New `components/maps/client-map-data.ts` `parseClientMapData()`: it reads the new shape and still accepts the old plain array, and drops invalid rows or clients. It replaces the parser inside `client-maps.tsx`, and the two leftover `console.log` calls are gone.
- `client-maps-canvas.tsx`: props are now `devices` + `clients`. The client pin and popup moved into `ClientMarker`. A device's clients are drawn as before (pin plus a line to the device). Clients without a device are drawn as a pin only.
- Checked:
  - `tests/unit/maps/client-map-data.test.ts`: 4 tests pass.
  - `scripts/ai/typecheck` passes.
  - `scripts/ai/test`: 842 passed, same 20 baseline failures (one is the existing empty `tests/unit/maps/client-map-rows.test.ts`).
  - Browser, vp tenant: 0 → 6 client pins, popup shows name/status/address/phone, no page errors.
- Existing issue, not from this change: the `/client-maps` and `/tj-box-maps` documents return HTTP 500 in dev but still render. The same happens on the old code.
- Not verified in the browser: a tenant with devices (vp has none). That path is covered by the backend tests and the parser test.

## "Encountered a script tag" warning on map pages

- Symptom: a console error pointing at the theme boot `<script>` in `app/layout.tsx`. React prints it only when the root layout is rendered in the browser instead of on the server.
- Cause: the server render of `/client-maps` and `/tj-box-maps` failed (HTTP 500, `window is not defined`). `client-maps.tsx` and `tj-box-maps-table.tsx` import `map-utils.ts`, which imports Leaflet at the top, and Leaflet reads `window` when it loads. Next then rendered the whole page in the browser, which triggered the script warning.
- Fix: new `components/maps/map-geo.ts` holds the Leaflet-free helpers (`DEFAULT_MAP_CENTER`, `toLatLngTuple`, `resolveMapCenter`, `normalizeStatus`, `getSettingString`). `map-utils.ts` keeps the Leaflet icons and re-exports those helpers, so the canvases are unchanged. The two pages import from `map-geo.ts`. `app/layout.tsx` is unchanged.
- Checked: `/client-maps`, `/tj-box-maps`, `/clients` and `/noc` return 200 with no script warning. The client map still shows 6 pins with popups. `scripts/ai/typecheck` passes. `scripts/ai/test`: same 20 baseline failures.

## Client map: device marker, device name in popup, client link

- `map-utils.ts` `deviceIcon(color)`: a Leaflet divIcon with a router symbol on a rounded square in the device's line colour (hex only, cached per colour). The background is set inline inside the Leaflet HTML string, because the colour is per device. It replaces the plain circle for devices. The company marker is unchanged.
- `client-maps-canvas.tsx` `ClientMarker`:
  - the name links to `/clients/view/{uuid}` when the user has `clients.show`, and follows `client_view_open_on_new_tab`;
  - a linked client's popup shows "Device: <name>". New key `client_map.client.device` in en and bn.
- Checked: `scripts/ai/typecheck` passes. `scripts/ai/test`: 842 passed, same 20 baseline failures. In the browser the popup link has the right `href` and opens the client view.
- Not checked in the browser yet: the device marker and the device name in the popup. The vp tenant has no devices until the seeder runs.

## Map pages fill the screen height

- `/client-maps` and `/tj-box-maps`: the map was a fixed `h-[60vh] min-h-[420px]`. Its wrapper is now `flex min-h-[320px] flex-1 flex-col`, and the map and its loading skeleton use `flex-1 min-h-[320px]`. The filter card is `shrink-0`, so it never gets squashed.
- Measured (map height, page scroll):
  - 1440×900: 540 → 726, no scroll.
  - 1280×720: 546, no scroll.
  - 390×844: 506 → 605, ending 16px above the mobile bottom nav, no scroll.
- `scripts/ai/typecheck` passes.
- Existing, unchanged: on phones the map filter card shows only the Device field, with the rest cut off. The original code does the same.

## Clients list: map pin with directions before the address

- `client-zone-address-cell.tsx`: when a client has a valid location, a `MapPin` link shows before the address. It opens Google Maps directions (`/maps/dir/?api=1&destination=lat,lng`) in a new tab, with `noopener noreferrer`. The click doesn't reach the row, and the tooltip and aria-label use the new key `client.address.directions` (en and bn). It is used by the clients list and the archived clients list.
- `map-geo.ts` `directionsUrl(lat, lng)`: returns null for a blank or invalid point (blank is checked first, because `Number("")` is 0).
- Needs the backend change in isp-backend: the list endpoints did not select `adr_latitude` and `adr_longitude`.
- Checked:
  - unit tests: 2 new cell tests and 2 for `directionsUrl`;
  - `scripts/ai/typecheck` passes;
  - `scripts/ai/test`: 846 passed, same 20 baseline failures;
  - browser: 6 pins on the vp clients list at 1440 and 390 px, and the click opens a new tab while the list stays on /clients.

## Map pages: mobile filter sheet, menu above the map

- New `components/maps/map-filter.tsx` `MapFilter`, used by `/client-maps` and `/tj-box-maps`:
  - desktop keeps the inline filter card;
  - mobile shows the page title and a filter button that opens `ToolbarFilterDrawer`, the same bottom sheet as list tables (Reset / Apply Filter).
  - One `useFilterForm` drives both views, and the filter schemas are memoized.
- The map wrapper now has `isolate`. Leaflet's panes and controls (z-index 400–1000) stay inside the map's own stacking context, so the mobile menu sheet and the sticky navbar are drawn above the map.
- Checked:
  - Browser at 390×844, both pages:
    - the map starts at 128px, 635px tall;
    - the sheet opens with all fields and is the top element;
    - on the client map, Status = Inactive leaves 0 pins and closes the sheet;
    - with the menu open, the element at the map centre belongs to the menu.
  - Desktop at 1440 and 1280: map size is unchanged (726 / 546px), the inline filter works, and no drawer is rendered.
  - `scripts/ai/typecheck` passes. `scripts/ai/test`: same 20 baseline failures.

## MikroTik Sync: sync status filter defaults to "Not imported", with an "All" option

- `mikrotik-sync-filter-schema.ts`:
  - the sync status dropdown now offers All, Imported and Not imported, and is no longer clearable;
  - new `MIKROTIK_SYNC_DEFAULT_FILTER = { syncd_status: "null" }`.
- `mikrotik-sync-table.tsx`: the page's first query is built from that default, and the toolbar gets `filter.defaultValues`, so the filter form opens with "Not imported" selected.
- Shared filter plumbing (opt-in; tables without `defaultValues` behave as before):
  - `useFilterForm` takes `defaultValues` (passed to `useForm`) and returns `resetFilter()`. It resets the form and runs the query with the defaults, or an empty query when there are none.
  - The toolbar, `FormFilter` and `MapFilter` reset buttons now call `resetFilter`.
  - Closing the desktop filter row resets only when a field differs from its default. Before, it reset when any field had a value.
  - `DataTableToolbarOptions.defaultValues` is documented in the type.
- i18n: `mikrotik_sync.filters.syncd_status.options.all` (All / সব).
- Needs the backend change in isp-backend: before it, `syncd_status=all` matched no rows.
- Checked:
  - new `tests/unit/hooks/use-filter-form.test.tsx` (3 tests): defaults, reset to defaults, reset without defaults, and the schema options;
  - `scripts/ai/typecheck` passes;
  - `scripts/ai/test`: 849 passed, same 20 baseline failures;
  - browser, vp at 1440px:
    - opens with 9 rows and "Not imported" selected;
    - All → 15;
    - Imported → 6;
    - Reset → back to "Not imported" and 9;
  - browser, 390px: the bottom sheet shows "Not imported" with the options All | Imported | Not imported.

## MikroTik Sync: Import and All Sync after the title

- `mikrotik-sync-table.tsx`: the Import and All Sync buttons moved from the toolbar `end` slot to the front of `start`. On desktop they now sit right after "MikroTik Sync (9)".
  - The open desktop filter row only carries `end` items, so both buttons stay hidden while it is open. The bulk "Import selected" button stays in `end` and still shows in the row.
  - On mobile the title is not shown, and start items get their own row under the pagination and icon row.
- The sync status dropdown is now `isClearable: false`. `SelectDropdown` is clearable by default, so it still showed an ×. "All" covers what clearing would do.
- Checked:
  - browser at 1440px: title, Import, All Sync on one line, with View, layout and Filter on the right; both buttons are hidden while the filter row is open;
  - browser at 390px: both buttons are icon-only in their own row, with no horizontal scroll;
  - `scripts/ai/typecheck` passes.
- The load button label (`mikrotik_sync.sync.actions.load`) changed from "Import" to "MikroTik Import" (bn: "মাইক্রোটিক ইমপোর্ট"). The same key is the title of its dialog. Only this button uses the key; `re_sync` has its own.
- The bulk button label (`mikrotik_sync.actions.import_selected`) changed from "Import selected ({{count}})" to "Client Import ({{count}})" (bn: "ক্লায়েন্ট ইমপোর্ট ({{count}})"). The count is unchanged.

## MikroTik Sync: phone toolbar, buttons in the actions row

- New `ToolbarItemMobile` value `"actions"` (in `toolbar-config.ts`): on mobile, a start or center item with this value goes into the right-hand actions row, before the end items, instead of getting its own centred row. Desktop placement is unchanged, and no other table uses it.
- `mikrotik-sync-table.tsx`: MikroTik Import and All Sync use `mobile: "actions"`.
- Checked:
  - browser at 390 and 360px: page size on the left; MikroTik Import, All Sync, View, layout and Filter in one row, all 36×36 at the same height. With a row selected, Client Import (1) joins the row, and the page does not scroll sideways at 360px.
  - browser at 1440px: unchanged, both buttons stay after the title.
  - `scripts/ai/typecheck` passes.

## Funds: balance in the toolbar centre

- `fund-table.tsx`: removed the balance card.
  - The balance ("Balance" plus the animated amount) is now the toolbar's `center` item. The layout already handles it: centred between the title and the buttons on desktop, and its own centred row under the buttons on mobile.
  - The balance is drawn as the same chip as the navbar wallet balance: outlined, h-9, `rounded-[var(--radius)]`. Inside: a muted `Landmark` icon, the label in small muted text, and the amount semibold. It lines up with the toolbar's icon buttons.
  - The amount box has `min-w-16`, so the loading skeleton and the amount take the same space.
  - It is used by `/funds` and `/reports/funds`.
- The load-error box used to hold an empty `min-h-10` slot above the table at all times. With the card gone, that showed as a blank gap. It is now rendered only when loading fails, with the same `min-h-10` for its own content.
- Checked:
  - browser on both pages at 1440, 1024 and 390px;
    - desktop: the balance midpoint equals the table midpoint (848 / 640);
    - the toolbar moved up 56px to where the card used to start;
    - no sideways scrolling.
  - `scripts/ai/typecheck` passes.

## Invoices: totals as chips

- `components/invoices/invoice-reports.tsx` (CRLF kept): the totals card is replaced by four chips: Sub Total, Discount, Total, Paid. They use the same style as the navbar wallet balance: outlined, `rounded-[var(--radius)]`, a muted icon, a small muted label and the amount in semibold. Paid uses the `success` token.
  - Desktop and tablet (sm+): one row of h-9 chips, wrapping when narrow.
  - Phones: a 2x2 grid, label above the amount.
- Chosen by the user from three temporary designs (chips, collection progress, stat cards) shown on `/invoices`. The preview file was deleted and its import removed.
- Loading: the chips render with a skeleton in the fixed-size amount slot. Before, an `h-20` block was shown, and the list jumped when data arrived.
- The same totals, translations and API fields. The component is used by `/invoices`, the client view's invoice tab, `client-invoice-table.tsx` and the client area invoices.
- Checked:
  - browser `/invoices`:
    - 1440 light and dark: one row;
    - 768: 2+2 wrap;
    - 390 and 360: 2x2 grid;
    - no sideways scrolling at any width;
    - no hydration or nesting errors in the console;
  - `scripts/ai/typecheck` passes.
- Existing, not changed: at 768px the navbar breadcrumb overlaps the navbar buttons.

## Payments: total paid as a toolbar chip; totals stay visible with the filter open

- New `components/summary-chip.tsx` `SummaryChip({ icon, label, amount, isLoading, currency })`: one money total as an h-9 chip, the same style as the navbar wallet balance, with a fixed-size amount slot while loading. `fund-table.tsx` now uses it; its look is unchanged.
- `payment-table.tsx`: the Total Paid card is gone. Total Paid is now a `SummaryChip` (Banknote icon):
  - with the toolbar: in its `center` slot (`/payments`, `/reports/payments`);
  - without a toolbar (client view, `tableToolBar={false}`): above the table, left-aligned.
- `data-table-toolbar.tsx`: while the desktop filter row is open, it replaces the toolbar. Center items now stay on a centred line above the filter fields, so a total (Funds Balance, Total Paid) stays visible while filtering. Mobile is unchanged: the filter is a bottom sheet and the center row stays.
- Known: the chip remounts when the filter opens or closes, so its amount replays the short count-up animation.
- Checked:
  - browser 1440px:
    - `/payments`, `/reports/payments`, `/funds`: the chip is centred over the table (midpoint 848 = table midpoint);
    - with the filter open, the chip stays at the same x/y, and after a search the total updates with the result;
  - browser 390px: the chip has its own centred row, with no sideways scrolling;
  - client view: Total Paid chip above the payments table;
  - no nesting or hydration console errors;
  - `scripts/ai/typecheck` passes.

## Invoices: totals in the toolbar centre

- `invoice-table.tsx`: with its toolbar, the totals chips are now the toolbar's `center` item, like Funds and Payments, so they stay visible above the open filter. Without a toolbar (client view), they stay above the table.
- `invoice-reports.tsx`: new `layout` prop.
  - `"block"` (default) keeps the earlier layout. It is used by the client view, `client-invoice-table.tsx` and the client area.
  - `"toolbar"`: one row from 1440px; an even 2x2 grid below that (the centre column is too narrow for four chips at 1280px and they wrapped 3+1); a full-width 2x2 grid on phones.
- Checked:
  - browser `/invoices`:
    - 1920 and 1440: title, 4 chips and buttons on one 36px row;
    - 1280 and 1024: even 2x2 in the centre column;
    - 390: full-width 2x2 under the buttons;
    - no overflow or sideways scrolling at any width;
    - filter open at 1440: the chips stay on a centred row above the fields;
  - client view: chips above the invoice table;
  - no nesting or hydration console errors;
  - `scripts/ai/typecheck` passes.

## List pages: settings button hidden while the filter is open

- New `ToolbarItem.inFilterRow` (in `toolbar-config.ts`, default true). On desktop, the open filter row carries the page's `end` items; an item with `false` is left out of it. When the filter closes, the item is back in the toolbar.
- Set to `false` on the settings (gear) button of every list toolbar that has one:
  - clients, tickets, payments, products, invoices, expenses, telegram, OLTs;
  - this also covers the report pages built on the same tables.
- Other end items still show in the filter row, for example MikroTik Sync's Client Import.
- Mobile is unchanged: the filter is a bottom sheet, and the toolbar buttons stay.
- Checked:
  - browser at 1440px on `/clients`, `/tickets`, `/payments`, `/products`, `/invoices`, `/expenses`, `/telegram` and `/olts`: one gear button with the filter closed, none with it open;
  - `scripts/ai/typecheck` passes.

## Expenses: totals as toolbar chips

- `expense-reports.tsx` rebuilt: Total Expense and Total Pending are two `SummaryChip`s (Receipt and Clock icons), with the same keys and fields as before. `expense-table.tsx` puts them in the toolbar `center` instead of a card above the table, so they stay visible above the open filter.
- `SummaryChip` gets an optional `stack` prop. On phones, the label sits above the amount so two chips fit side by side; sm and up, it is the normal h-9 chip. Funds and Payments don't use it and are unchanged.
- Layout:
  - 1280 to 1920: title, two chips and buttons on one row;
  - 1024: chips stacked in the centre column;
  - 390: a 2-column grid under the buttons.
- Checked:
  - browser `/expenses` at 1920, 1440, 1280, 1024 and 390: no overflow or sideways scrolling;
  - with the filter open, the chips stay above the fields and the gear is hidden;
  - `/funds` and `/payments` look the same;
  - no nesting or hydration console errors;
  - `scripts/ai/typecheck` passes.

## List tables: toolbar config as a typed const

- Refactor only, no behaviour change. Every `DataTable` toolbar written inline, `toolbar={{ ... }}` or `toolbar={flag ? { ... } : false}`, is now a `const toolbar: DataTableToolbarConfig` (or `DataTableToolbarConfig | false`) declared right before the component's `return`, with `toolbar={toolbar}` on the table. This matches `client-table.tsx`.
  - 63 files, 64 toolbars (`help-management.tsx` has two, in separate components).
  - The `import type { DataTableToolbarConfig }` line is added after the DataTable import.
  - The config text is unchanged, only moved and re-indented. CRLF and LF are kept per file.
  - No inline `toolbar={{` remains; the rest are `toolbar={false}`.
- Done with a script: for each file, find the expression's matching brace, then move it before the nearest preceding `return (`. The typecheck confirms every `toolbar` is in scope where it is used.
- Checked:
  - `scripts/ai/typecheck` passes;
  - `scripts/ai/test`: 849 passed, same 20 baseline failures;
  - browser at 1440px on 35 list pages (clients, invoices, payments, expenses, funds, fund transactions, tickets, products, zones, sub zones, networks, client and reseller packages, staffs, resellers, OLTs, ONUs, devices, TJ boxes, MikroTik Sync, vendors, tags, roles, activity logs, SMS templates, expense and invoice types, my wallets, salaries, archived clients, telegram, reports/payments):
    - each returns 200 and renders its toolbar title;
    - the filter row opens where the page has one;
    - no page errors.

## Impersonation: hydration error and "Encountered a script tag" warning

- Cause: `AppProvider` (`context/app-provider.tsx`) seeded the impersonation state from `localStorage` in the `useState` initializer.
  - The server has no `localStorage`, so it rendered "not impersonating". The browser's first render said "impersonating". The sidebar header (orange ring and the "Impersonating" line in `app-sidebar.tsx`) therefore did not match.
  - React threw "Hydration failed" and re-rendered the whole tree on the client, including the root layout's theme `<script>`. That client render is what logs "Encountered a script tag". The script itself is fine.
- Fix: state starts at `DEFAULT_IMPERSONATION_STATE` (the same as the server), and a `useLayoutEffect` loads the saved state right after hydration, before the first paint, so the badge does not flash. `loadImpersonationState` no longer needs its `window` guard, because it only runs in the browser. Setting, persisting and clearing the state are unchanged. The client dashboard layout uses the same provider, so it is fixed too.
- Reproduced before the fix in the browser:
  1. log in as vpc;
  2. `/staffs`, then "Login as this staff member", then Login;
  3. `/dashboard` logged the hydration error and the script-tag warning.
- Checked after the fix, same flow:
  - no console errors on `/dashboard`, after a reload, or on `/clients`;
  - the badge and ring show while impersonating;
  - "Exit Impersonation" returns to the normal account with no errors;
  - `scripts/ai/typecheck` passes.
- Side effect of testing: the impersonation was started 3 times from fresh browser sessions. Only the last run exited through the UI; the first two sessions were closed while still impersonating.

## Settings: removed "SMS After Reseller Auto Invoice Generate"

- Removed the `sms_after_auto_invoice_generate_reseller` option from the frontend:
  - the field registry (`settings/registry/fields.ts`);
  - the SMS section's "invoices" group (`sections.ts`);
  - the SMS sending lock list (`sms-gateway-status.ts`);
  - its label in en and bn.
- Tests updated to match: the expected SMS order in `settings-sections.test.ts`, and the entry in `fixtures/setting-values.json`. That removes one per-key test, so the suite count goes 849 → 848 passed.
- The backend was changed in the same step (isp-backend): the reseller auto invoice SMS branch, the seeded defaults and the gateway key are removed, so a saved value no longer sends anything.
- Checked:
  - browser `/settings/sms` at 1440px: the option is gone; the other 13 settings render in the same order; no page errors;
  - `scripts/ai/typecheck` passes;
  - `tests/unit/settings` 79/79;
  - `scripts/ai/test`: 848 passed, same 20 baseline failures.

## Fund transactions: "Transaction By" column and filter

- `fund-transaction-type.ts`: the row has an optional `transaction_by: {id, name} | null` (from the new backend field).
- `fund-transaction-column.tsx`: new "Transaction By" column after Amount, showing the staff name, or "—" when empty (older rows and non-staff transactions).
- `fund-transaction-filter-schema.ts`: new staff dropdown filter `transaction_by` (`/dropdown-staffs`, id/name), after Transaction Type.
- i18n: `fund_transaction.transaction_by.label` and `.placeholder` in en ("Transaction By", "Select staff") and bn.
- Needs the isp-backend change and its migration.
- Checked:
  - browser `/fund-transactions` at 1440px, against a local DB not yet migrated:
    - the column header renders after Amount, and existing rows show "—";
    - the filter row has the staff dropdown, listing vp, vp-manager, vp-bill and vps;
    - no page errors;
    - filtering by staff could not be run until the column exists;
  - `scripts/ai/typecheck` passes;
  - `scripts/ai/test`: 848 passed, same 20 baseline failures.

## Fund transactions filter: date range picker, "Transaction By" label

- `fund-transaction-filter-schema.ts`:
  - `created_at` is now a `dateRange` field (`closeOnSelectDate: false`, placeholder "Date"), the same picker as the invoice filter. One day sends `created_at=YYYY-MM-DD`; a range sends `YYYY-MM-DD,YYYY-MM-DD`. Before, it was free text.
  - The staff dropdown placeholder is now "Transaction By" (`fund_transaction.transaction_by.label`).
  - The now-unused placeholder keys `fund_transaction.created_at.placeholder` and `fund_transaction.transaction_by.placeholder` were removed from en and bn.
- Needs the isp-backend fix to the `created_at` filter. Before it, a single day matched only midnight and a range dropped the end day after 00:00.
- Checked, browser `/fund-transactions` at 1440px on the migrated local DB:
  - a single day, 23 Nov, gives 2 rows;
  - the range 19–23 Nov gives 3 rows (19 Nov 16:37 and two on 23 Nov 02:24);
  - Transaction By = vp gives 2 rows, and the column shows "vp" for the new rows;
  - no page errors.
- Existing, not changed:
  - Shared `DatePicker`: after a date is applied, the first click on the field does not open the calendar; a second click does. Same on `/invoices`.
  - `tests/unit/form/date-picker-range.test.tsx` (part of the 20 baseline failures) hardcodes October 2026 and fails now that the calendar opens on November; it does not test the range logic.
- `scripts/ai/typecheck` passes; `scripts/ai/test`: 848 passed, same 20 baseline failures.

## Invoice payments: fund choice by permission only

- `payment-fund-access.ts` `paymentFundAccess({ staff, canChangeFund, canUseBkashFund })`:
  - no `roles` input any more;
  - `invoices.change-fund` or `invoices.bkash-fund-access` unlocks the dropdown; neither locks it to the staff's own fund;
  - with bKash access and no own fund, the user is not blocked (the bKash fund is allowed);
  - new `INVOICE_PAYMENT_FUNDS_API = "/dropdown-funds?scope=invoice-payment"`, so the API lists only the allowed funds (own + bKash, or all).
- `bulk-invoice-pay-dialog.tsx` (used by every Pay button): permission based, no `useSetting("roles")`, scoped API.
- Invoice create form (`invoice-form.tsx`, `invoice-form-schema.ts`):
  - with status Paid or Partial Paid, the fund field uses the scoped API;
  - it is locked when the user has neither permission;
  - it starts on the user's own fund (kept there when locked);
  - it shows the existing "no fund assigned" warning.
  - Before, anyone could pick any fund here.
- Not changed:
  - Fund Transactions page: `fund-transaction-access.ts` keeps the Admin/Super Admin role rule (moved into a local `roleFundAccess`); its tests pass unchanged.
  - `invoice-pay-dialog.tsx` is not used anywhere, and its backend route is disabled.
- Tests:
  - `payment-fund-access.test.ts` rewritten for the permission rules;
  - `bulk-invoice-pay-dialog.test.tsx`: Admin/Super Admin without the permission are now locked; bKash access can switch funds and can pay without an own fund; the dialog asks for the scoped API.
  - `scripts/ai/typecheck` passes; `scripts/ai/test`: 851 passed, same 20 baseline failures.
- Browser (local, as vpc: Admin role, has `invoices.change-fund`):
  - Pay dialog starts on "vp", is unlocked and lists all 6 company funds;
  - create invoice with status Paid preselects "vp", unlocked;
  - no page errors.
  - The locked and bKash states could not be shown in the browser: no local user has `invoices.pay` without `invoices.change-fund` (vp-bill's role has no invoice permissions), and changing roles is a data change. The unit and feature tests cover those states.


## Legacy MikroTik sync retirement analysis — 2026-11-25

- Owner confirmed the legacy pair is ClientSync + SyncClient. Completed a source-level comparison against MikrotikSync across both repositories. No application changes or database/queue/router mutations were made; removal awaits the owner's approval.
- Detailed report: [legacy-sync-retirement-review.md](/Users/kamol/Documents/www/isp-backend/docs/architecture/legacy-sync-retirement-review.md). Includes functional coverage, behavior differences, retirement inventory, dependencies to retain, access/queue/data/export migration prerequisites, and sequential acceptance tests.
- Replacement covers the main workflows. Readiness defects found: profile resolution omits network_id; selecting every visible importable row promotes to company-wide bulk import without table filters. Additional dependencies: old role/feature mappings, queued numeric-ID jobs, no snapshot backfill, old company-export inserts, legacy demo seeds, and active marketing translation keys.
- Verification: focused backend suites 73 passed (272 assertions); shared SID suite 12 passed (39 assertions); focused frontend sync-filter test 1 passed. Frontend scripts/ai/test ignores file arguments and ran the full suite: 20 tests failed plus an empty-suite error on unchanged application source. No browser e2e or live-state inspection.
- Both trees started clean. Review artifacts only; no unrelated edits.


## Unified sync preservation requirement — 2026-11-25

- Owner clarified that the current MikrotikSync feature must remain functional while the legacy modules are retired. Added an explicit preservation boundary to the existing architecture review: retain the unified model/table/data/UUIDs, API contracts, frontend capabilities, permissions, and shared dependencies.
- The two reported correctness defects already exist in the new implementation; they are separate from the legacy deletion. Recommended focused regression coverage and isolated fixes, followed by runtime cleanup and later schema retirement after queue/access/retention/export checks.
- Planning clarification only. No application edits, deletion, database/router/queue mutations, or migration execution. Existing review artifacts were already present and retained. No tests rerun for these documentation-only changes.


## Removed legacy sync application code; unified feature preserved — 2026-11-25

Scope: the owner approved removing old legacy code first and explicitly deferred the two MikrotikSync bugs to another step.

Changes:
- Removed 35 backend files: ClientSync/SyncClient models, controllers, resources, requests, filters, old jobs/import service, factory/empty seeder, and legacy-only tests. Removed all 11 legacy API routes and both obsolete permission families from their registrations and feature mapping.
- Removed 18 frontend files: both legacy component folders and their list/detail pages. Cleaned menu gates, breadcrumbs, English/Bangla legacy translations, and help inventory/catalog. Marketing preview now uses the existing unified translation keys.
- Reworked Demo ClientSeeder's router snapshot to populate mikrotik_sync from simulator data without a router connection. Added demo assertions for UUIDs, company ownership, router-only, mismatched, and app-only snapshots. Ported shared SID/bulk-import coverage to the unified UUID importer. Added permission-updater coverage proving old grants are removed while current unified grants survive.
- Retained 24 historical legacy acceptance scenarios as explicitly owner-approved exclusions, with retired tickets and reasons; removed their 3 page entries from the active route inventory. Updated current developer/architecture references and marked historical findings retired.
- Confirmed no edits to the MikrotikSync model/services/jobs/controller/resources/requests/filters, its 8 route definitions, frontend module/pages, or current translations. Kept the shared package-sync job, independent clients.mikrotik.sync action, and shared client/billing services. The two reported new-system bugs remain unchanged.

Verification:
- Baseline focused backend: 64 passed, 409 assertions. Final: scripts/ai/backend-test tests/Feature/MikrotikSyncControllerTest.php tests/Feature/ClientSidSequenceTest.php tests/Feature/DemoSeederTest.php tests/Feature/ResellerOnboardingTest.php tests/Feature/UpdatePermissionCommandTest.php tests/Feature/CompanyImportExportApiTest.php — 65 passed, 415 assertions (SQLite in memory).
- next typegen and scripts/ai/typecheck passed. Regenerating route types removed stale generated references to deleted pages.
- Focused Vitest (mikrotik-sync-filter-schema, help/centre, menu-items): 28 passed, 1 failed. The same menu-items sidebar-order assertion failed before editing (referral placement); it is unrelated and left untouched.
- node scripts/check-help-content.mjs passed (182 articles). Unified locale objects are byte-equivalent as parsed values to HEAD; all new marketing key references resolve in both languages.
- scripts/ai/lint passed on all 9 surviving changed PHP files. scripts/ai/analyse --debug passed on the 5 changed production PHP files. Debug mode avoids the sandbox's denied PHPStan parallel TCP listener. Including the 4 existing Pest files reports 39 test-analysis errors (unrecognized helper functions/Pest-bound methods and existing model properties); the overall analysis including tests is not green.
- Read-only scripts/ai/artisan route:list --json confirmed 0 legacy routes, 8 unified routes, and the shared client router action retained. Source checks found no legacy class references in active backend code or frontend feature/translation/help code.
- The specification coverage checker still fails its pre-existing route-inventory equality check: both HEAD and the final tree have the same 4 unmapped help-management/settings-menu pages and 4 stale setting/* pages. This cleanup did not add to that discrepancy. All 24 retired scenarios retain explicit approval/reason metadata; no browser passing evidence was invented.
- No browser e2e run, live router call, deployment, commit, or push.

Operational boundary:
- This is application-code retirement only. No migrations were edited/added/executed. Both legacy tables and saved data remain, along with historical creation migrations; no actual clients, financial records, queues, roles, plans, or permissions were mutated outside SQLite tests. Database retirement is still a separate step. Old exports continue to have their tables available.
- Before deploying this code, an operator must finish or explicitly retire any pending/reserved/delayed/failed BulkImportSyncClientsJob payloads and restart workers; that class is now removed. Live queue state was not inspected.
- The existing update:permission command can remove obsolete persisted permission rows/grants after the release; only its SQLite tests were run here. Current new-feature grants were not remapped or broadened.
- Pre-existing edits were the earlier analysis entries in both .ai/report.md files and the untracked architecture review; preserved and updated with a status note. No unrelated application changes were present or modified.


## Reproduced MikroTik sync bugs visibly with Playwright — 2026-11-25

- User requested reproduction and observation, not fixes. Added tests/e2e/mikrotik-sync/bugs.spec.ts, playwright.mikrotik-sync.config.ts, scripts/run-mikrotik-sync-e2e.mjs, and sibling backend tests/Browser/MikrotikSyncFixture.php, following the existing disposable fund-report fixture pattern. Added a focused npm command and root runner mapping. Both trees started clean; no unrelated edits.
- Real Next pages/server actions and Laravel HTTP handlers use SQLite :memory:, generated CP/MK personas and registered tenant hosts on ephemeral ports. Browser contexts are per test. External HTTP/notifications are fake, router status uses an in-memory adapter, and real bulk jobs execute serially against only the disposable connection. No MySQL rows, real router state, existing accounts, or application runtime code were changed.
- MKS_E2E_SLOW_MO=650 node scripts/run-mikrotik-sync-e2e.mjs --headed completed in about 44 seconds: 2 failed, 0 passed, 0 skipped, at the intended correctness assertions. FT033-13: one searched/selected client submitted all_import=true with import_id=[]; two queued jobs created visible-only-client and hidden-do-not-import on another network, while MK's sentinel stayed unchanged. FT033-14: Router B's client received Router A Gold (BDT 3,000), package id 3/network id 3, instead of Router B Gold (BDT 800), package id 4/client network id 4.
- The preliminary run cleared the filter by closing the panel and therefore did not count as bug evidence. Corrected tests keep the filters active and verify them before the action. The final report contains videos, before/after screenshots, and sanitized expected/actual JSON. Traces are off to avoid recording session tokens; auth state is not saved.
- Replay report: http://127.0.0.1:9323 (left running for the user). Durable local artifact folder: /Users/kamol/Documents/www/shadcn-client/playwright-report/mikrotik-sync-reproduction-20261125-final. Tracked run evidence: tests/e2e/specifications/mikrotik-sync/evidence/run.json in the frontend. FT033-13 and FT033-14 are marked failing in the coverage register; no passing acceptance evidence was claimed.
- Checks passed: frontend scripts/ai/typecheck; node --check on the runner; php -l; scripts/ai/lint on the new fixture; scripts/ai/analyse --debug --autoload-file tests/Feature/Support/SubscriptionTestHelpers.php tests/Browser/MikrotikSyncFixture.php. The helper autoload makes the existing fixture helper functions visible to PHPStan; debug avoids its sandbox TCP worker listener. Isolated fixture initialization/lifetime smoke also passed after equivalent storage-accessor/type cleanup.
- No fixes, dependencies, migrations, production configuration changes, commits, or pushes. Test scratch apps, tokens, and in-memory DBs were torn down; only generated replay artifacts and the report server remain.

- Coverage inventory checker: still fails the existing "Route inventory differs from current page files" assertion. Neither application page files nor the route inventory changed in this task. The two new scenario IDs, executable test titles, failing result states, and linked evidence were separately verified.


## Fixed both reproduced MikroTik sync bugs — 2026-11-25

Changes:
- Backend packageForProfile now constrains network_id as well as company, reseller, and profile. Individual resolution uses the client's network; bulk resolution uses the selected snapshot network in both preflight and update. A profile that exists only on another router is rejected without changing the client. Public endpoint names, payloads, response shapes, and the existing 404 individual / 422 bulk missing-package contracts remain unchanged.
- Frontend no longer promotes a full visible-page selection into all_import=true. Counts and default imports use the explicitly selected UUIDs. Changing a filter clears selected IDs.
- Preserved whole-company import through a new explicit Import scope radio choice in the existing FormBuilder dialog. Selected clients only is the default; All unimported clients in this company deliberately uses the existing company-wide API scope. The company option is explicit about ignoring the current filter scope. Existing own/reseller targeting and the backend API remain intact. Added matching English/Bangla labels.

Verification:
- Added 6 Pest cases before the fix: all failed against the original lookup (wrong router chosen or erroneous 200). They cover individual/bulk, company/reseller owners, and missing profiles on the intended network. After the fix: scripts/ai/backend-test tests/Feature/MikrotikSyncControllerTest.php tests/Feature/ClientSidSequenceTest.php — 44 passed, 204 assertions. Existing cross-company/other-reseller denials remain covered.
- ./node_modules/.bin/vitest run tests/unit/mikrotik-sync — 3 passed. New tests verify current-page selection retains its UUIDs/count instead of the 50-row total and clears on filter change. scripts/ai/typecheck passed.
- MKS_E2E_SLOW_MO=450 node scripts/run-mikrotik-sync-e2e.mjs --headed — 3 passed, 0 failed, 0 skipped. FT033-13: one visible selected UUID queues/imports exactly that client and leaves the hidden client/other company untouched. FT033-14: Router B gets package 4 on network 4, BDT 800, rather than Router A's BDT 3,000 package. FT033-15: at 390px, selected scope is the default, an explicit company choice imports the remaining eligible rows, and MK data stays unchanged. The original two correctness assertions were retained.
- Inspected desktop before/after result screenshots and the mobile scope dialog. Mobile dialog bounds fit 390px; desktop/mobile submit loading and close transitions were exercised through the existing 15-second hold. The table layout and shared controls were preserved; no new style primitives or inline styles were added.
- Pint passed on the changed service and feature test. PHPStan passed for app/Services/MikrotikSync/MikrotikSyncService.php via scripts/ai/analyse --debug (avoids the sandbox's parallel TCP worker listener).
- Saved current passing evidence separately in frontend tests/e2e/specifications/mikrotik-sync/evidence/fixed-run.json and kept the original failing run.json. Only FT033-13/14/15 are recorded as passing; generic feature acceptance remains pending.
- Passing replay report is running at http://127.0.0.1:9324; the original failing report remains at :9323 for comparison. Artifacts: /Users/kamol/Documents/www/shadcn-client/playwright-report/mikrotik-sync-fixed-20261125. Videos, sanitized request/persistence evidence, and screenshots are available there.

Scope and existing work:
- Preserved the prior turn's uncommitted reproduction harness, configuration, metadata, and .ai/report entries. Current changes build on that work; no unrelated application edits were present. The global coverage inventory's previously noted page-mapping mismatch is outside these fixes.
- No live database/router/customer changes, schema changes, installs, deployment, commit, or push. All mutation checks used generated personas and disposable SQLite; scratch apps and fixture data were torn down.


## Added counts to bulk-import scope labels — 2026-11-25

- Scope options now display Selected clients only (N) and All unimported clients in this company (M), with matching English/Bangla interpolation. Selected count uses explicit UUIDs. The new unimported_count list-response field is company-wide and filter-independent, using the same eligibility condition as all-import: no client_id, and syncd_status null or not imported. Company scope is retained and eligible reseller snapshots are included.
- Added API coverage proving filtered pagination can total 1 while company import count is 2; imported/linked/foreign-company rows are excluded and the count matches actual queued UUIDs. Updated the table unit harness to prove company count is passed independently of filtered pagination.
- Checks: 33 backend feature tests passed (171 assertions); 3 focused frontend unit tests passed; TypeScript passed; Pint passed on the changed model/resource/test; PHPStan passed on the changed model/resource via --debug.
- Headed Playwright: 3 passed, 0 failed/skipped. Desktop verifies selected (1) versus company (2); mobile verifies the remaining count and dialog fit. Screenshots/videos: /Users/kamol/Documents/www/shadcn-client/playwright-report/mikrotik-sync-counts-20261125. Latest tracked evidence: frontend tests/e2e/specifications/mikrotik-sync/evidence/count-run.json.
- The first browser attempt hit test-login MissingCSRF and a pre-hydration filter interaction. The shared fixture login now checks the CSRF endpoint and waits for the actual MikroTik summary before interacting; all cases passed on rerun. No application auth code changed.
- Preserved all existing uncommitted bug fixes, test fixtures/configuration, metadata, and reports from preceding steps. No live database mutations, schema changes, installs, deployment, commit, or push.

## Audited client Playwright failures — 2026-11-26

- Request: run the client suite and distinguish application defects, outdated tests, and missing setup; no application or original test changes requested or made.
- Source: frontend branch `refactor-form-builder`, revision `c7d36e80a2ceb3435d056e80d84d460900b05841`; sibling backend revision `4b1ed87f57a7129c8e463f70cd70f01e17e222c6`.
- CP full client config: 32 tests, 22 passed, 10 failed, 0 skipped/flaky. MK read-only project: 28 tests, 22 passed, 6 failed, 0 skipped/flaky. Both original commands exited 1.

Failure findings:
- CL-F02 missing pppoe_username fails once per tenant because `tests/e2e/clients/read-only.spec.ts:136` expects `PPPoE ID is required`; the current UI/English translation displays `Client ID is required`. Required-field validation still blocks submission. Update the expected text.
- Five CL-L03 cases fail on each tenant: active/inactive status and auto/manual/no-invoice billing filters. At `read-only.spec.ts:185`, the old `#react-select-${field}-input` selector times out because current FormBuilder/select controls use field-name IDs (`#status` and `#billing_type`). Use `[id="${field}"]` for the dynamic selector. Source controls explicitly set inputId from the field ID; the old generated IDs are obsolete.
- CP's four extra failures (CL-F04 edit, CL-F08 cancel edit, CL-F10 clear optional IP, CL-F01 create) stop at the isolated-fixture preflight in `tests/e2e/clients/environment.ts:45`. Neither `E2E_CLIENT_MUTATIONS=1` nor `E2E_CLIENT_FIXTURE_FILE` was supplied. These require a separately provisioned disposable database with fake router/notification services; enabling a flag alone does not provide that setup. No customer create/update/delete operation from these cases proceeded.
- No application bug was confirmed in these failures. This does not establish all backend business behavior: mutation behavior remains unverified without isolated fixtures, and list-filter tests compare UI results against the current API.

Diagnostic verification:
- Created an ignored temporary copy under `playwright-report/isp-client-audit-20261126-oyb2u3lf/diagnostics/` with only the two expectation/selector updates above. Original tests and application files remain unchanged. The diagnostic config points to this copy and keeps the existing fixture/auth behavior.
- Re-ran the six affected read-only cases on each tenant: CP 6/6 passed, MK 6/6 passed, no skips/flakes. This verifies the stale assumptions without weakening the filter inclusion/exclusion assertions. The original suite is still failing until its tests are updated.
- Original commands: `E2E_TENANT=cp E2E_CLIENT_ARTIFACT_DIR=<private-root>/cp ./node_modules/.bin/playwright test --config=playwright.clients.config.ts`; MK used `E2E_TENANT=mk`, its own artifact directory, and `--project=clients-chromium`.
- Diagnostic commands used the temporary `diagnostic.config.ts`, `--project=clients-chromium --grep 'missing pppoe_username|CL-L03'`, and separate CP/MK artifact directories.
- Private artifact root: `/private/tmp/isp-client-audit-20261126-oyb2u3lf`. It contains each run's JSON/HTML results and logs; sanitized aggregate results are in `summary.json`. Raw browser contexts/reports may include customer details and remain local; they were not copied into tracked evidence.
- Pre-existing modification to `playwright/.auth/user.json` was left untouched. Only this report was changed in the tracked tree; no dependencies, commits, pushes, deployments, or fixture bypasses. Normal test authentication ran; no claim is made that auth records were immutable.


## Clarified Client ID placeholder and validation test — 2026-11-26

- Customer-approved label remains Client ID; underlying field/API key remains pppoe_username. Updated the existing placeholder translation to `Enter client ID (PPPoE ID)` in English and `ক্লায়েন্ট আইডি দিন (PPPoE ID)` in Bangla. No form structure, dimensions, styles, API behavior, or validation rule changed.
- Corrected CL-F02's outdated required-field expectation to `Client ID is required`. The same test now checks the requested placeholder on that field before submitting the invalid form. Other filter selectors and isolated-fixture requirements from the earlier audit are outside this change.
- Verification: focused `CL-F02 missing pppoe_username` passed on CP desktop (1/1), CP mobile at 390×844 (1/1), and MK desktop (1/1), using the existing clients-chromium project/authentication. Each run checks the placeholder, visible required error, retained create URL, and absence of a saved test identity. English/Bangla JSON parsed successfully; scripts/ai/typecheck passed. Full client suite was not rerun and is not claimed green.
- Desktop commands: `E2E_TENANT=cp E2E_CLIENT_ARTIFACT_DIR=/private/tmp/isp-client-id-copy-cp-desktop ./node_modules/.bin/playwright test --config=playwright.clients.config.ts --project=clients-chromium --grep 'CL-F02 missing pppoe_username'`; same with mk/mk-desktop for MK. Mobile used an ignored temporary config at playwright-report/client-id-copy-check/mobile.config.ts extending the existing config with a 390×844 touch viewport and the original spec directory. No structural layout changes were introduced; automated mobile/desktop checks cover create bootstrap and validation, not a separate visual layout/scroll audit or Bangla browser run.
- Initial sandboxed Chromium launch failed before browser actions with macOS MachPortRendezvous permission denial; the focused rerun outside the sandbox passed. Final private artifacts: /private/tmp/isp-client-id-copy-cp-desktop, /private/tmp/isp-client-id-copy-cp-mobile, /private/tmp/isp-client-id-copy-mk-desktop. No customer mutations, dependency installation, backend edits, commit, or push.
- Preserved the pre-existing .ai/report.md audit entry and modified playwright/.auth/user.json; auth-file contents were not inspected or edited. Only the two locale files, client test, and this report changed for this task.


## Reran client Playwright suite after wording update — 2026-11-26

- CP full configuration: 32 tests, 23 passed, 9 failed, 0 skipped/flaky; exit 1, approximately 275 seconds. MK clients-chromium: 28 tests, 23 passed, 5 failed, 0 skipped/flaky; exit 1, approximately 275 seconds. The corrected CL-F02 missing pppoe_username validation/placeholder case passed on both tenants.
- Five shared CL-L03 failures: status=1 (Active), status=0 (Inactive), billing_type=auto, billing_type=manual, billing_type=no_invoice_this_month. All time out at the existing obsolete #react-select-${field}-input locator; current controls use #status and #billing_type. This rerun did not change those tests or the application. These remain test-selector issues; no application defect was confirmed from these failures.
- CP's four additional clients-isolated failures: CL-F04 edit hydration/name persistence, CL-F08 cancel edit, CL-F10 clear optional IP, CL-F01 create. Each fails the existing isolatedFixtures preflight requiring E2E_CLIENT_MUTATIONS=1 and E2E_CLIENT_FIXTURE_FILE. No valid customer save or cleanup mutation proceeded; disposable database/fake integrations remain necessary. MK isolated tests were not selected, matching the previous audit scope.
- Commands: E2E_TENANT=cp E2E_CLIENT_ARTIFACT_DIR=/private/tmp/isp-client-rerun-20261126-w94o1y8t/cp ./node_modules/.bin/playwright test --config=playwright.clients.config.ts; MK uses its corresponding tenant/artifact directory and --project=clients-chromium. Chromium ran outside the sandbox with the established local tenant hosts and existing in-memory authentication; no safety guards bypassed.
- Private logs, JSON/HTML reports, and sanitized summary.json: /private/tmp/isp-client-rerun-20261126-w94o1y8t. Raw customer-context artifacts remain private/local. No application or test edits for this rerun; only this report was appended. Preserved existing modifications to .ai/report.md, playwright/.auth/user.json, both locale files, and tests/e2e/clients/read-only.spec.ts. No dependency installation, backend changes, commit, or push.


## Clarified client test names and added Bengali explanations — 2026-11-26

- Renamed all 32 client cases (28 read-only, 4 isolated) with plain-language action/expected-result titles. Kept all CL scenario IDs and parameter cases. Names use Client ID (PPPoE ID), readable status/billing labels, page names instead of UUID paths, and explicit isolated-fixture prerequisites. Added a Bengali purpose comment at every test definition, including shared parameterized definitions; the isolated preflight comment distinguishes missing setup from application failure.
- Added named Playwright steps around opening/selecting filter dropdowns and checking isolated-fixture setup, so reports identify the failing stage. Existing assertions, selectors, fixture guards, cleanup, and behavior were preserved; this task does not fix known selector/setup failures. The prior Client ID validation/placeholder edits remain intact.
- Updated exactly 32 client test title references in tests/e2e/specifications/coverage-register.json. Verified against HEAD that the register differs only in those client title fields: scenario statuses and historical run evidence were not changed or promoted.
- Verification: playwright --config=playwright.clients.config.ts --list registered exactly 32 cases in 2 files; scripts/ai/typecheck passed. Three representative CP cases ran via --grep 'CL-F02 Required Client ID|CL-L03 Status filter - Active|CL-F04 Edit client': validation passed (1), Active filter timed out at the named Open the Status filter dropdown step (1), isolated edit failed on the existing fixture preflight (1); overall exit 1, no skips/flakes. The original selector and missing fixture prerequisites remain the causes. This is a focused verification, not a full-suite rerun or passing coverage claim.
- Command used E2E_TENANT=cp E2E_CLIENT_ARTIFACT_DIR=/private/tmp/isp-client-readable-names-check with ./node_modules/.bin/playwright test --config=playwright.clients.config.ts and the grep above. Private run JSON/HTML/error contexts are under that artifact directory; log: /private/tmp/isp-client-readable-names-check.log. No isolated fixture opt-in or live customer mutation was performed.
- Scope: only client specs, their coverage title references, and this report changed in this task. Preserved prior modifications to .ai/report.md, playwright/.auth/user.json, public/lang/en.json, public/lang/bn.json, and the client validation test. No app/backend changes, installs, commits, or pushes. scripts/ai/diff/status and git diff --check completed.


## Applied readable test naming to Playwright and Vitest — 2026-11-26

- Scope confirmed by the user: both Playwright and Vitest. Retained the 32 previously approved client case names. Renamed the other 266 registered browser cases in 44 spec files, preserving every scenario ID and parameter variant. Added Bengali purpose comments to all newly renamed browser definitions, with readable labels instead of raw field names, statuses, or UUID routes where appropriate.
- Renamed 1,179 unit-test definitions in 213 nonempty files, resolving to 1,347 registered cases. Existing precise English expectations now include readable feature context; explicitly clarified vague cases such as device-monitoring switches, row-local calculations, refresh/minimum-loading behavior, and setting normalization. Bengali guidance comments identify the feature and retain the exact English condition alongside it for precision. The pre-existing empty maps/client-map-rows.test.ts remains untouched.
- Added .cursor/rules/test-naming.mdc via the create-rule skill and linked it from root AGENTS.md and tests/e2e/AGENTS.md. The rule requires plain-English action/result names, readable parameter variants, existing scenario IDs, Bengali purpose comments, actual failing-stage diagnostics, private-data hygiene, exact-reference maintenance, and snapshot-key-only migration during naming work. It applies to tests/**, including future browser and unit tests.
- Synchronized 255 additional active browser title references in coverage-register.json. Verified that only the relevant test_refs title fields changed; scenario statuses and historical execution evidence remain intact. No active exact-title references in Markdown/runners needed changing. Migrated 34 snapshot keys across 4 files; snapshot values were compared before/after and are unchanged. No blanket snapshot update was used.

Verification:
- Ran ./node_modules/.bin/playwright test --config=<config> --list --reporter=json before and after for all 14 root configurations. Every discovery command exited 0; registered counts are unchanged: clients 32, legacy 11, expenses 30, funds 12, invoices 36, MikroTik sync 3, networks 20, platform support 7, products 50, referrals 6, resellers 31, SMS 20, staff 29, tickets 11; total 298. Browser actions were not rerun for this naming-only change, and discovery is not a browser passing claim.
- Ran ./node_modules/.bin/vitest run --reporter=json --outputFile=<private-root>/unit-before.json before unit edits, and the same command with unit-after.json after edits/snapshot migration. Both exited 1 with exactly 1,338 passed, 9 failed, 0 pending out of 1,347 cases. Mapped old/new resolved names and verified no case outcome changed. Both also report the same pre-existing empty maps/client-map-rows.test.ts load failure. The 9 existing failures are in client-dashboard-info (1), reseller-client-filter-schema (1), reseller-client-table (2), column-visibility-persistence (2), menu-items (1), and pay-content (2). No application or assertion fixes were made.
- Vitest list --json confirmed all 1,347 renamed cases and no duplicate full names within a file. Before/after runs both matched all 34 snapshots with 0 added, updated, unmatched, or unchecked snapshots.
- scripts/ai/typecheck passed after the browser renames and after the unit renames. TypeScript AST comparison across all 260 browser/unit spec files verifies identical executable code except title expressions; comments are ignored. Test inputs, fixtures, assertions, skips, hooks, cleanup, and safety guards are unchanged. scripts/ai/diff/status and git diff --check completed.
- Private baseline/discovery/run reports, resolved title maps, source snapshots, and verification summaries: /private/tmp/isp-test-naming-20261126. No raw credentials/customer contexts copied into tracked evidence.
- Preserved pre-existing edits to .ai/report.md, playwright/.auth/user.json, public/lang/en.json, public/lang/bn.json, both client specs, and the earlier client coverage title updates. No app/backend behavior changes, dependencies, live browser/customer mutations, commits, pushes, or deployments for this task.
