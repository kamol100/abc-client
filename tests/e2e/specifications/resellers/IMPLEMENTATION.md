# RESELLER-001 implementation status

This is a partial implementation. Passing slices never mark a whole parent scenario passing. Review stays pending. No successful reseller create, package reassignment, wallet settlement, purge, or import is executed.

31 checks in five spec files use `playwright.resellers.config.ts`. Final runs: CP 30 passed and 1 failed; MK 30 passed and 1 failed. The failure is the same on both tenants: an unknown username does not narrow the list. Exact commands, titles, and source hashes are in [execution evidence](EXECUTION.json).

## Every parent scenario

- **RS-L01**: Implemented slice — List identity, contact, status, client counts, wallet text, and reload match the API. Controlled package-count assertions remain.
- **RS-L02**: Failing slice — Name, phone, status, zone, network, and combined name plus status match the API and restore. Username exclusion fails. `app/Services/Filters/Resellers/Filters.php` has no Username filter, so `username` is ignored and an unknown value keeps the company total.
- **RS-L03**: Implemented slice — Previous and next buttons match the current page. CP and MK have one page, so page 2 did not run. Page size is not changed because it persists the staff preference. Later-page filter reset remains.
- **RS-L04**: Implemented slice — An unmatched name shows `No results`, the row menu opens, and clearing the name restores the row. Request-failure recovery remains.
- **RS-F01**: Blocked — A successful create assigns packages and provisions a login. Not executed.
- **RS-F02**: Implemented slice — Empty name, phone, and network show required errors. Username and password required errors appear after the other base fields are valid. Short name and phone show the minimum-length errors. The list total stays unchanged.
- **RS-F03**: Implemented slice — A duplicate company username is rejected and the draft is not created. Email policy and cross-company duplicates remain.
- **RS-F04**: Review-blocked — Queued provisioning and a new reseller login. Not executed.
- **RS-F05**: Implemented slice — Edit hydrates the saved reseller and cancel leaves the detail unchanged. Saved contact and billing edits were not submitted.
- **RS-F06**: Implemented slice — Cancel on create stores no reseller. Cancel-edit and server-rejection recovery remain.
- **RS-F07**: Implemented slice — Agent commission is required, and negative or fractional values stay on the form. Persisted unset-agent and count_commission choices remain.
- **RS-F08**: Review-blocked — Billing persistence. Not executed.
- **RS-F09**: Blocked — Duplicate submit needs a disposable create. Not executed.
- **RS-P01**: Implemented slice — View opens the selected profile and package tab. Edit and back links keep that UUID.
- **RS-P02**: Review-blocked — Package assignment. Not executed.
- **RS-P03**: Review-blocked — Package ownership transfer. Not executed.
- **RS-P04**: Implemented slice — Client-tab names match `resellers/client/{uuid}`. CP and MK each have one reseller, so switching to a second reseller did not run.
- **RS-P05**: Implemented slice — The package tab stays usable and the profile name remains. A failed client-tab fetch was not injected.
- **RS-P06**: Review-blocked — Permission editor. Not executed.
- **RS-S01**: Implemented slice — The termination flag toggles, persists, and is restored. Company and sibling flags stay unchanged.
- **RS-S02**: Blocked — Stale UUID and repeated-toggle races were not intercepted.
- **RS-S03**: Implemented slice — A foreign reseller UUID cannot read or write settings, and the owner flag stays unchanged. A permission-less persona remains.
- **RS-S04**: Review-blocked — Image upload. Not executed.
- **RS-S05**: Blocked — Image permission and size limits were not executed.
- **RS-W01**: Implemented slice — The recharge dialog shows the reseller and current balance. Cancel leaves the balance unchanged. Hiding the action without recharge permission remains.
- **RS-W02**: Implemented slice — Amount 0, amount -5, and a missing fund stay in the dialog. The balance is unchanged.
- **RS-W03**: Review-blocked — Successful recharge. Not executed.
- **RS-W04**: Review-blocked — Recharge rollback. Not executed.
- **RS-W05**: Implemented slice — An invalid fund, a foreign fund, and an unknown wallet UUID are denied and the balance stays unchanged. Client-wallet UUID masquerade is not on ClientResource.
- **RS-W06**: Review-blocked — Recharge idempotency. Not executed.
- **RS-A01**: Implemented slice — Four anonymous staff routes redirect to the same-host login. Subscriber sessions remain.
- **RS-A02**: Blocked — Restricted permission personas are not provisioned.
- **RS-A03**: Implemented slice — CP and MK deny a foreign detail and exclude the foreign name. The browser hides the foreign profile. Delete, update, images, packages, and clients were not called.
- **RS-A04**: Review-blocked — Reseller hierarchy. Not executed.
- **RS-A05**: Blocked — Enter and leave need a non-admin reseller user. The linked user is an Admin. The denial is covered by RS-A06.
- **RS-A06**: Implemented slice — Switching to an Admin-role reseller is denied, the URL stays on the list, and the API identities are unchanged. A linked user shows the switch action when `impersonate.start` is present. Stacked-session clicks remain.
- **RS-A07**: Review-blocked — Inactive reseller policy. Not executed.
- **RS-D01**: Implemented slice — Cancel delete keeps the reseller. Confirm purge was not used.
- **RS-D02**: Review-blocked — Purge. Not executed.
- **RS-D03**: Review-blocked — Export and import isolation. Not executed.
- **RS-D04**: Blocked — The import dialog component is not mounted, so there is no reachable import UI.
- **RS-R01**: Blocked — Delayed and failed responses were not injected.
- **RS-R02**: Blocked — Presentation matrix was not executed.

## Findings and limits

- Reseller public identity is the UUID in `id`. The list resource includes user, wallet UUID and balance, zone, client counts, prefix, and status. Network is loaded on detail, not on the index.
- The username field is sent by the filter form and ignored by the backend pipeline. The failing test keeps the spec expectation that an unknown username returns no rows.
- Username and password required messages appear only after name, phone, and network are valid, because Zod skips `superRefine` while the object is invalid.
- The only linked reseller user has the Admin role. Impersonation returns "Cannot impersonate an Admin or Super Admin." The Next.js dev overlay then hides the page from the accessibility tree; the test removes that overlay before checking the row.
- `ResellerImportDialog` is imported by the table and never rendered. No import button was added.
- Delete calls export and purge. The suite only cancels the dialog.
- Settings writes are restored in `finally`. Company-level and sibling flags are compared.
- Recharge posts only with an invalid fund, a foreign fund, or an unknown wallet, and then reads the balance again.
- Both local companies have one reseller. Multi-page navigation and switching client tabs between resellers did not run.
- Ordinary company tests use CP and MK. APP administration is not a company-isolation persona.
