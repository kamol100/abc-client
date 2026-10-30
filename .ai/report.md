## Summary

The dashboard breadcrumb is hidden below the `md` breakpoint and still shows from `md` up.

## Files

- `app/(dashboard)/dashboard-breadcrumb.tsx`

## Checks

On `http://vp.isp.test:3000/dashboard` at 390px the breadcrumb nav computed `display: none`. At 1280px it computed `display: block` and showed “Dashboard”. On `/clients` at 1280px it showed “Dashboard / Clients”; at 390px it computed `display: none`.

## Security

No permission or tenant change.

## Git

Uncommitted. Source change is `app/(dashboard)/dashboard-breadcrumb.tsx`.
