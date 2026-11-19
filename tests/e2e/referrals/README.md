# ISP referral browser fixture

Run from the frontend checkout:

```sh
npm run test:e2e:referrals
```

The runner expects the sibling `isp-backend` checkout, existing dependencies and Playwright Chromium. Set `ISP_BACKEND_DIR` for another checkout location, `RF_E2E_CHROMIUM` to use an installed Chromium executable, and `RF_E2E_ARTIFACT_DIR` to retain JSON results in a chosen directory.

The registered `app.isp.test`, `cp.isp.test` and `mk.isp.test` origins must resolve to loopback. The runner uses an ephemeral port and separate browser contexts for each role. It starts the actual Laravel routing stack in a fresh application per HTTP request, with one SQLite in-memory connection for each run. It starts a separate Next.js process from a scratch copy of the current working tree. Login and referral requests use the normal application entry points. Fixtures use generated credentials and fake queue, notifications, HTTP integrations and file storage. The run ends by stopping the local processes and discarding the database.

The test requires loopback binding and permission to launch Chromium. No existing development database, login, session file, or app build cache is used. The recorded payout is a synthetic transfer reference. The registered scenarios and evidence are in [REFERRALS-001](../specifications/referrals/REFERRALS-001.md).
