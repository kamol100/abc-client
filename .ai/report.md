## Summary

Shared links showed the Vercel triangle because `app/favicon.ico` was the create-next-app default. Chat apps request `/favicon.ico` on the site host. The tab icon pointed at the company file on the API, which those apps skip.

## Cause

`app/favicon.ico` (25 KB, Vercel triangle) was served at `/favicon.ico` and injected as `<link rel="icon" href="/favicon.ico?favicon.*.ico">`. `generateMetadata` pointed `icons` at the API favicon URL, so the tab could look right while a share preview used the triangle.

## Fix

- Removed `app/favicon.ico`.
- `/favicon.ico`, `/apple-touch-icon.png`, and `/apple-touch-icon-precomposed.png` rewrite to `/api/favicon`.
- That route loads the company favicon for the request host and returns the image. If the company has none, or the URL is not on the API origin, it returns `public/static/favicon.png`.
- Metadata icons are those same-origin paths.
- Service worker cache bumped to `v3` and no longer cache-firsts those icon paths.

## Checks

- `scripts/ai/typecheck` passed.
- `npx vitest run tests/unit/favicon/site-favicon.test.ts` passed (3 tests).

## Browser

Dev server already on `http://localhost:3000`. With `Host: vp.isp.test`:

- `GET /favicon.ico` and `GET /apple-touch-icon.png` return `200` `image/png` (32×32 company icon, not the triangle, not the static fallback).
- Login HTML links `icon` and `apple-touch-icon` at those paths. The hashed Vercel icon link is gone.

Production share cards stay cached until this is deployed. WhatsApp, iMessage, and Slack keep the old preview until their cache expires. If a new deploy still serves the triangle, redeploy once with the Vercel build cache off.
