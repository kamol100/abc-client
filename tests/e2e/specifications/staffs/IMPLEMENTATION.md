# STAFFS-001 implementation status

Partial browser coverage on CP. Passing slices do not mark a parent scenario passing. Review stays pending.

29 checks use `playwright.staffs.config.ts`. MK is only the other company in the isolation check. The full MK suite was not run.

`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_STAFF_ARTIFACT_DIR=/tmp/isp-staffs-cp10 npm run test:e2e:staffs` on CP: 28 passed, 1 failed (about 2.8 minutes). The failure was FT090-12 after a dark-mode reload: the table shell was present and the Name header had not hydrated. A later run of that check passed in 3.9 seconds.

A following full run, `E2E_STAFF_ARTIFACT_DIR=/tmp/isp-staffs-cp11`, finished 26 passed and 3 failed. Anonymous `/staffs` and `/staffs/create` did not render the login username, and the valid create did not finish within 120 seconds. Those three checks passed on the next targeted run. Reports stayed in `/tmp`.

## Every parent scenario

- **FT090-01**: Implemented slice — Lock is offered, and both the button and `PUT /staffs/{id}/status` return the plan message "This feature is not included in your subscription plan." (`feature_not_in_plan`, HTTP 402). The disposable staff stays active and can still log in. The signed-in account gets the same refusal, so "You cannot change your own account status." was not reached. Unlock was not executed.
- **FT090-02**: Implemented slice — A password shorter than 8 characters stays in the dialog, and Close leaves the original login working. A valid reset is the same 402. The original password still logs in, the unused new password does not, and another staff row is unchanged. A completed reset was not executed.
- **FT090-03**: Implemented slice — Saved zones and salary lines hydrate on edit, and Cancel keeps them. Impersonation of a disposable staff member enters that identity and Exit Impersonation returns the actor. `salary_day` and `salary_generation_type` are not in the staff resource, so the edit form cannot show them.
- **FT090-04**: Implemented slice — The list matches the API and survives reload. Create and edit routes show the saved fields and survive reload.
- **FT090-05**: Implemented slice — Page 1 disables Previous. When the company has one page, Next stays disabled and the visible rows equal the total. The page-size control shows the saved preference and is not changed. Designation can be hidden and shown. The list has no search.
- **FT090-06**: Implemented slice — Cancel on create stores nothing. Edit hydrates the saved staff and Cancel leaves it. A valid create persists, and the edited designation survives reload.
- **FT090-07**: Implemented slice — An empty name, an empty phone, a 10-digit phone, a 256-character username, and a duplicate username stay recoverable and do not create a second staff.
- **FT090-08**: Implemented slice — Anonymous list, create, and edit URLs return to the same-host login. Anonymous staff API calls return 401. A persona without `staffs.edit` is not provisioned. CP's permission list does not include `staffs.status` or `staffs.reset-password`; the buttons still render because `staffs.edit` is present, and the plan then refuses those writes.
- **FT090-09**: Implemented slice — CP and MK deny a foreign staff read, status write, and update. Logout, Back, and reload stay on the login form. Delete and password reset were not sent to a real foreign staff.
- **FT090-10**: Implemented slice — The loaded list shows rows rather than "Request failed", "Failed to load data", or "No results". A delayed or failed list was not injected; the list uses a Next server action.
- **FT090-11**: Implemented slice — Two saves of an invalid form create nothing. Signing out during create stores nothing. Cancel delete leaves the staff in place. A successful rapid double-submit is covered by the valid create, which expects one row.
- **FT090-12**: Implemented slice — At 390px the Add link and Name header are usable. Bangla shows "নাম" and the desktop title "স্টাফ (n)". English returns. Dark mode remains after reload. Typing and Enter on Cancel does not create a staff.

## Findings

- Public staff identity is the UUID in `id`.
- Disposable staff use a company role other than Admin, Super Admin, or Client. This actor cannot impersonate an Admin.
- Lock and password reset are behind the subscription catalog. On CP they answer 402 before the account changes.
- The signed-in page size is stored on that staff member and is only displayed.
- Existing staff are not locked, reset, or deleted. Disposable usernames matching `e2e` plus 12 hex digits are removed, including before the next create. A sweep after the hung create found none left.
