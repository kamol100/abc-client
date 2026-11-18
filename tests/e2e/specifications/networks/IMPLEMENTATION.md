# NETWORK-001 implementation status

This is a partial implementation. Passing slices never mark a whole parent scenario passing. Review stays pending.

20 checks use `playwright.networks.config.ts`. CP and MK each finished with 15 passed and 5 failed on 2026-11-16. The five failures are the name, address, inactive, combined, and unknown-name filters. `NetworksController::index` orders by id and paginates. It does not apply those query parameters.

## Every parent scenario

- **NW-L01**: Implemented slice — Names, addresses, active/inactive badges, row order, and the company total match the API after reload.
- **NW-L02**: Failing — The API is asked to include only the named network, exclude an unknown address, return only inactive rows, and combine name with active status. Each response is still the unfiltered company page.
- **NW-L03**: Implemented slice — Previous and next follow the page bounds. CP and MK have one page, so page 2 did not run. Page size is not changed because it persists the staff preference.
- **NW-L04**: Failing — An unknown name is required to return total 0 and an empty table. The endpoint still returns the company total. A failed list request was not injected.
- **NW-L05**: Implemented slice — IP Address can be hidden. Name and Actions are absent from the toggle menu. A fresh login context shows IP Address again.
- **NW-F01**: Blocked — A successful create dispatches MikroTik package sync. Not executed.
- **NW-F02**: Implemented slice — Empty name, address, and username show required errors. Short values and a short password show the minimum-length errors. The list total stays unchanged.
- **NW-F03**: Review-blocked — Address formats and port boundaries. Not executed.
- **NW-F04**: Implemented slice — Cancel create stores nothing. A create without a name returns 422 and the ids stay the same.
- **NW-F05**: Implemented slice — Edit hydrates the saved fields and cancel leaves that network and its sibling unchanged. A saved edit was not submitted.
- **NW-F06**: Review-blocked — Password retain, change, and clear. Not executed.
- **NW-F07**: Review-blocked — Automation flags and graph_status mapping. Not executed.
- **NW-F08**: Implemented slice — Cancel after editing the name, and saving a cleared name, leave the stored network unchanged. Rapid submit was not executed.
- **NW-F09**: Review-blocked — Sync failure after create. Not executed.
- **NW-C01**: Implemented slice — Each visible row shows the label from its own status response beside its active or inactive badge. The seeded rows were connected. No disconnected row was available.
- **NW-C02**: Blocked — One status response could not be delayed without holding the server action.
- **NW-C03**: Blocked — Both companies fit on one page, so no row started offscreen.
- **NW-C04**: Review-blocked — Timeout and auth mapping. Not executed.
- **NW-C05**: Review-blocked — No inactive network is seeded. Not executed.
- **NW-C06**: Review-blocked — Freshness after a config change. Not executed.
- **NW-D01**: Implemented slice — Cancel delete keeps the unused network and the sibling. Confirm delete was not used.
- **NW-D02**: Implemented slice — API and dialog delete of a client-bound network return "Please delete the client first!" The network, client count, and package ids stay.
- **NW-D03**: Review-blocked — Package and reseller delete policy. Not executed.
- **NW-D04**: Implemented slice — Dropdown ids are numeric. The network UUID does not return that network's packages. Reseller and client create menus list the company names.
- **NW-D05**: Review-blocked — Concurrent client assignment. Not executed.
- **NW-A01**: Implemented slice — Anonymous `/networks` returns to the same-host login. A subscriber persona is not provisioned.
- **NW-A02**: Blocked — Restricted permission personas are not provisioned.
- **NW-A03**: Review-blocked — Editor without show. Not executed.
- **NW-A04**: Implemented slice — The other company cannot show, list, probe, empty-update, or delete a known UUID. Its dropdown ids stay out of the caller list, and the browser hides the foreign name.
- **NW-A05**: Review-blocked — Reseller and zone visibility. Not executed.
- **NW-A06**: Review-blocked — Credential redaction. Not executed.
- **NW-A07**: Implemented slice — Sign out, back, and reload drop the list. The other company context shows only its own names.
- **NW-R01**: Blocked — Expired session and subscription denial were not injected.
- **NW-R02**: Implemented slice — At 390px the connection word, add control, and filter field are reachable, and the name field takes keyboard input. Bangla and theme were not switched.

## Findings and limits

- Network public identity is the UUID in `id`. Dropdowns and client `network_id` use the numeric primary key. Package lookup with the UUID returns none of that network's packages.
- The list page probes `network-status/{uuid}` for visible rows. The suite refuses to open the page when an active network is outside the local simulator at `127.0.0.1:8728`.
- Create, a saved edit, and confirm delete of an unused network were not submitted. Client-bound delete is rejected before the row is removed.
- Both local companies have two networks and one page. Page size was left unchanged.
- Ordinary company tests use CP and MK. APP administration is not a company-isolation persona.

## Commands

`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`

- `E2E_NETWORK_ARTIFACT_DIR=/tmp/isp-networks-cp3 npm run test:e2e:networks` — 15 passed, 5 failed.
- `E2E_TENANT=mk E2E_NETWORK_ARTIFACT_DIR=/tmp/isp-networks-mk npm run test:e2e:networks` — 15 passed, 5 failed.

The same five filter checks failed on both hosts. Reports stayed in `/tmp`.
