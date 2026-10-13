## Summary

The sidebar hydration mismatch came from a shared i18next instance. The server kept the first language (English, “Menu”) for later requests, while the browser initialized Bangla (“মেনু”) from the `lang` cookie.

## Files changed

- `i18n.ts`: `createI18n()` builds a new instance for the requested language.
- `context/I18nProvider.tsx`: holds that instance for the tree so server HTML and client hydration use the cookie language.
- `app/layout.tsx`: `InstallPrompt` sits inside `I18nProvider` so it uses the same instance.
- `tests/unit/i18n/i18n-provider.test.tsx`: an English server render followed by a Bangla one still returns “মেনু”.

## Behavior

`common.menu` and every other `t()` string now follow the `lang` cookie on the first paint. Switching language in the UI still calls `changeLanguage` on that instance.

## Tests

- `scripts/ai/test` — 31 files, 112 tests passed.
- `scripts/ai/typecheck` — passed.
- Dashboard was not opened in the browser; no dev server was running and the sidebar requires a signed-in session.

## Left untouched

Deleted `.agents/skills/source-command-migrate-feature/SKILL.md` was already in the working tree.
