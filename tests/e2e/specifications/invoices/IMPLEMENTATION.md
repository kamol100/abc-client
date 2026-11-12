# INVOICE-001 implementation status

This is a partial implementation. Passing executable slices never mark a whole parent scenario passing. No unconditional skips, expected failures, financial fixture attestations or invented business decisions were added.

36 nonmutating checks in five spec files use an independent tenant-aware config. Final runs: CP 36 passed; MK 36 passed; zero failures/skips in either run. Typecheck passed; all 48 invoice unit tests passed across 12 files. Exact results/source hashes are in [execution evidence](EXECUTION.json). The standard all-suite command discovers this config automatically.

## Every parent scenario

- **IV-L01**: Implemented slice — List identities/dates/client/type/status/API amount rendering and reload. Controlled seeded correctness and complete monetary columns remain.
- **IV-L02**: Implemented slice — Track, status, type, client, zone, creator and combined UI/API filter checks/reset. Date ranges remain; creator identity is omitted by resource and only UI/API agreement is checked.
- **IV-L03**: Implemented slice — Dataset boundary buttons checked; next/previous identity branch exists but was not exercised by current single-page CP/MK fixtures. Page-size and later-page filter reset remain.
- **IV-L04**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-L05**: Implemented slice — Client UUID history rows/reload. Client-embedded view, conflicting numeric filter and switching between client identities remain.
- **IV-L06**: Implemented slice — Unmatched track search and clear/recovery. Controlled server errors and seeded subscription exclusion remain.
- **IV-F01**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-F02**: Implemented slice — Required client/type/description, zero/negative amount and zero quantity validation with preserved note and stable list counts. Required dates, fractional quantity and all-lines boundaries remain.
- **IV-F03**: Implemented slice — Unsaved add/remove line, retained description and quantity total (100 × 2 = 200). Discounts and saved/reloaded line lifecycle remain; no reorder UI was found.
- **IV-F04**: Implemented slice — Today/due/no SMS/one-line defaults and cancel with stable list count. Dropdown loading race variant remains.
- **IV-F05**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-F06**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-F07**: Implemented slice — Paid/partial fund requirement, partial amount errors, and switching to due hides fields. Persisted payload stripping/server state remain untested.
- **IV-F08**: Implemented slice — Due edit hydration of descriptions/quantities/amounts/note. Save/date/client/type/discount persistence remains pending isolated owned invoice.
- **IV-F09**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-F10**: Implemented slice — Cancel edited note and compare entire fresh invoice detail. Server rejection, rapid save and duplicate-payment variants remain.
- **IV-F11**: Implemented slice — Multibyte note 65,538 bytes rejected with input retained. Accepted-note persistence and bulk-note limit remain.
- **IV-P01**: Implemented slice — Pay dialog offered identities independently match due endpoint, all belong to selected client; cancel leaves fresh invoice details unchanged. Complete per-row amount/discount/selection expectations remain.
- **IV-P02**: Implemented slice — Select-all clearing produces unchecked invoices/zero total, restore selection and cancel preserves fresh invoice details. Individual selection arithmetic, no-selection submission denial, payments and fund balance verification remain.
- **IV-P03**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-P04**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-P05**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-P06**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-P07**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-P08**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-P09**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-P10**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-X01**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-X02**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-X03**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-D01**: Implemented slice — Document identity/line descriptions/note/payable total checked against fresh API detail and reopen. Lazy fetch is NOT proven: row passes uuid while API returns id. Complete document dates/discount/paid/due matrix remains.
- **IV-D02**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-D03**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-D04**: Implemented slice — Browser print invocation receives selected invoice/client DOM and afterprint cleans up/title restores. Thermal PDF download/count/content and physical printer acceptance remain.
- **IV-D05**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-D06**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-A01**: Implemented slice — Four anonymous staff routes redirect to same-host login. Subscriber API denial needs subscriber credentials.
- **IV-A02**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-A03**: Implemented slice — Known UUID detail denied and track search excludes foreign UUID bidirectionally CP/MK. All mutation/print/foreign relation/financial side-effect variants remain.
- **IV-A04**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-A05**: Implemented slice — Cancel selected due invoice deletion and verify fresh detail/list reload. Confirm deletion needs a disposable owned invoice and zero-payment fixture.
- **IV-A06**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-A07**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-A08**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.
- **IV-A09**: Review-blocked — resolve the referenced business/authorization policy, then provision owned financial fixtures and fake outbound integrations. No test or passing coverage claimed.
- **IV-R01**: Pending — controlled fixtures, restricted personas, failure controls and/or remaining implementation required. No passing coverage claimed.

## Findings and limits

- UUID resource identity is a string under id; the application row schema declares numeric id. Tests preserve the independent backend UUID contract.
- Invoice view uses invoice.uuid for lazy hydration even though the API supplies id. Current list responses include lines and allow a fallback document; passing document content does not prove detail hydration freshness.
- InvoiceResource omits creator identity despite loading createBy. Creator filter membership cannot be independently checked from this resource.
- Current local datasets have one page, so only the single-page boundary branch has been exercised. No staff page-size preference was changed.
- Shared filter/delete triggers and invoice checkboxes lack accessible labels. Specific rendered icons and Select All sibling text are narrowly scoped as documented.
- React Select searches raw static option keys; translated Partial Paid text cannot be used as its search query. Tests open status menu and select exact rendered labels.
- Pay Now remains enabled after clearing selection; UI schema validation is a separate concern. Current tests assert checkbox/totals changes and cancel only; no-selection submission denial remains pending.
- Discount/due routes and partial allocation have unresolved source-level authorization/business questions in the parent ticket. No runtime vulnerability claim is made.
- All profile/tenant checks use company CP/MK; no APP/platform substitution. Selected cross-tenant read denials do not prove full API tenant isolation.
- Invalid saves/cancellations compare fresh API state but are not a complete independent ledger/notification oracle. No valid invoice/payment/discount mutation was performed.
