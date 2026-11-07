## Summary

`http://mk.isp.test/` opened the Laravel API page because the local nginx proxy only forwarded a fixed host list to Next.js. The company row was already correct.

## Change

- `docker/nginx/default.conf` now sends `*.isp.test` to the Next.js app. `api.isp.test` stays on the API server as an exact name.
- Nginx was reloaded.

## Checks

- Company `mk` (id 7) has domain `mk.isp.test` and status `active`. `GET /api/v1/company-data?host=mk.isp.test` returns that company.
- After reload, `http://mk.isp.test/` is a Next.js 307 to `/home`, then 200. The page title is `ISP Management Platform | mk` and the heading is `Welcome to mk`.
- `http://api.isp.test/up` still returns 200.
- `http://vp.isp.test/` still reaches the VP app (existing session lands on the dashboard).

## Remaining

- In `/etc/hosts`, `app.isp.test` is `27.0.0.1`. The other tenant hosts use `127.0.0.1`.
