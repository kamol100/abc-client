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
