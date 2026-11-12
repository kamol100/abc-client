# SUPPORT-001 Playwright runner

Independent of `playwright.config.ts` and the tracked auth file. Login uses `http://cp.isp.test` and, for isolation, `http://mk.isp.test`. Credentials come from ignored `.env.e2e.tenants.local`.

```bash
npm run test:e2e:tickets
```

Creates and deletes tickets owned by the run. Ticket creation writes in-app staff notifications; it does not send customer SMS. Review-blocked scenarios are not implemented.

Subscriber session checks are not included: no subscriber credentials were supplied.
