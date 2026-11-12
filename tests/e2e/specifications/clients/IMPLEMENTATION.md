# CLIENT-001 implementation status

The parent scenario IDs often contain multiple variants. A passing slice does not mark the entire parent as passing or imply >90% coverage. No new skipped tests or expected-failure annotations were introduced.

## Written suites

- `tests/e2e/clients/read-only.spec.ts`: 28 nonmutating checks; CP run 28 passed. MK run also 28 passed; exact titles/host/source hashes in [execution evidence](EXECUTION.json).
- `tests/e2e/clients/isolated.spec.ts`: four mutation tests; collected/typechecked but not executed without isolated fake-backed fixture.
- `playwright.clients.config.ts`: independent tenant-aware runner; preserves existing config/global setup/auth-state changes.

## Scenario-by-scenario remaining work

- **CL-L01**: Implemented slice — API/UI identities and total/reload verified; controlled seeded package/billing assertions remain.
- **CL-L02**: Implemented slice — Name/PPPoE/phone searches with inclusion/exclusion/reset verified against API snapshot; controlled CI dataset still needed.
- **CL-L03**: Implemented slice — Status and all billing options implemented; network/zone/combined filters and reset matrix remain.
- **CL-L04**: Pending implementation: controlled fixture/variant setup required; no passing coverage claimed.
- **CL-L05**: Implemented slice — Current-month URL/rows/show-all/reload verified; fixed-date inclusion/exclusion/back-forward remain.
- **CL-L06**: Implemented slice — No-match/recovery verified; controlled server error variant requires server-reachable stub.
- **CL-L07**: Pending implementation: controlled fixture/variant setup required; no passing coverage claimed.
- **CL-L08**: Pending implementation: controlled fixture/variant setup required; no passing coverage claimed.
- **CL-F01**: Implemented slice — UI create test written; isolated database/fake router+notifications fixture and permissions required before execution.
- **CL-F02**: Implemented slice — Missing required field and one-character name validation tests implemented and run; no valid save attempted.
- **CL-F03**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-F04**: Implemented slice — Owned-fixture edit test written; isolated fixture required before execution; address variant remains.
- **CL-F05**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-F06**: Implemented slice — Prepaid/auto/deadline/invoice-day defaults verified; next-SID hint not rendered by shared field code and edit/default-race variants remain.
- **CL-F07**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-F08**: Implemented slice — Create cancel verified; isolated edit cancel written/unexecuted and server-rejection variant remains.
- **CL-F09**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-F10**: Implemented slice — Optional IP-clear test written; isolated fixture required; remaining optional-field matrix not implemented.
- **CL-D01**: Implemented slice — Identity and view-action destination handled according to current new-tab setting; explicit settings matrix remains.
- **CL-D02**: Implemented slice — Name/package reload verified; missing-data/router-failure variants require controlled fixtures.
- **CL-D03**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-D04**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-D05**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-D06**: Implemented slice — Phone and WhatsApp targets verified; clipboard and permission variants remain.
- **CL-D07**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-O01**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-O02**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-O03**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-O04**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-O05**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-O06**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-O07**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-O08**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-O09**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-O10**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-O11**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-M01**: Review-blocked: resolve the parent ticket business decision and supply isolated fake-backed fixtures before implementation.
- **CL-M02**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-M03**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-M04**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-A01**: Implemented slice — Four anonymous staff routes verified; subscriber persona denial requires subscriber fixture.
- **CL-A02**: Blocked on explicit restricted staff/subscriber/reseller/assigned-zone personas; broad CP/MK admin sessions cannot prove these denials.
- **CL-A03**: Blocked on explicit restricted staff/subscriber/reseller/assigned-zone personas; broad CP/MK admin sessions cannot prove these denials.
- **CL-A04**: Implemented slice — Bidirectional CP/MK known UUID read and search denial verified; mutation/dropdown/private-image variants remain.
- **CL-A05**: Blocked on explicit restricted staff/subscriber/reseller/assigned-zone personas; broad CP/MK admin sessions cannot prove these denials.
- **CL-A06**: Pending implementation: controlled fixture/variant setup required; no passing coverage claimed.
- **CL-A07**: Blocked on controlled seeded data, fake adapters and/or server failure controls; cannot safely use shared clients for writes.
- **CL-A08**: Pending implementation: controlled fixture/variant setup required; no passing coverage claimed.

## Environment and product observations

- CP/MK login works on registered hosts; localhost fallback is not used.
- API SID/payment-deadline numbers differ from frontend string schema; transport assertions are independent.
- Desktop filter button has no accessible name; specific rendered funnel icon identifies it until an accessibility fix is approved. Dropdown filters auto-submit.
- Create page can lose early input/native-submit before initial asynchronous bootstrap finishes; helper waits at create bootstrap only.
- Existing full Vitest run fails in ten unchanged files; see .ai/report.md.
- Backend security for all mutation/resource paths remains unverified. Shared browser sessions never prove API tenant isolation.
