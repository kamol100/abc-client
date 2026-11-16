# SMS send browser suite

Read [SMS-SEND-001](../specifications/sms-send/SMS-SEND-001.md) and `tests/e2e/AGENTS.md` before extending these tests.

```sh
npm run test:e2e:sms-send
E2E_TENANT=mk npm run test:e2e:sms-send
```

`npm run test:e2e` discovers `playwright.sms-send.config.ts`. The suite defaults to VP (`http://vp.isp.test/admin`, username `vpc`). MK is the other company. Credentials come from the ignored tenant env file as `E2E_VP_*` and `E2E_MK_*`.

Confirm is never clicked. Preview and cancel are the send checks. A confirmed live or test send queues a communication job.

Reports default to `playwright-report/sms-send/`. Set `E2E_SMS_SEND_ARTIFACT_DIR` for a private run folder.
