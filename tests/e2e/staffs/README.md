# STAFFS-001 browser suite

Read the staff ticket and `tests/e2e/AGENTS.md` before extending these tests.

```sh
npm run test:e2e:staffs
E2E_TENANT=mk npm run test:e2e:staffs
```

`npm run test:e2e` discovers `playwright.staffs.config.ts` with the other feature suites. Company tests default to CP. MK is the other company. Credentials come from the ignored tenant env file. Login uses `http://cp.isp.test/admin` or `http://mk.isp.test/admin`.

Disposable staff are created for lock, password reset, impersonation, and create/edit persistence, then deleted. Existing staff are not locked, reset, or deleted. Page size is not changed because it is stored on the signed-in staff member.
