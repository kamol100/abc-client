---
name: File-based i18n refactor
overview: Remove the translation API and refactor i18n to load typed, static JSON resources (en/bn) with persisted language selection and a dashboard header language switcher, while enforcing the Step-4 translation key conventions and preventing initial-render flicker.
todos:
  - id: remove-translation-api
    content: Remove translation API fetch from `app/layout.tsx` and delete translation-specific logic from `getPublicData` helpers.
    status: completed
  - id: file-based-i18n
    content: Create typed static resources from `public/lang/en.json` + `public/lang/bn.json` and refactor `context/I18nProvider.tsx` to use them (no `any`, no async init).
    status: completed
  - id: persist-language-no-flicker
    content: Persist selected language via cookie (and optional localStorage mirror) and ensure SSR initial language matches to prevent flicker.
    status: completed
  - id: language-switcher-ui
    content: Add language switcher UI to `app/(dashboard)/top-navbar.tsx` top-right controls.
    status: completed
  - id: key-convention-audit
    content: Audit and migrate translation keys to Step-4 naming/structure, update both JSON files to match exactly, and refactor Zod schemas to accept `t` via schema factories.
    status: in_progress
  - id: metadata-fix
    content: Replace i18n usage in static `metadata` with `generateMetadata()` using cookie + static JSON lookup where needed.
    status: pending
isProject: false
---

## Goals

- **Remove Translation API** entirely (no external fetch for translations).
- **File-based translations** from `public/lang/en.json` and `public/lang/bn.json` with strong typing and identical key structure.
- **Default language = English**, persisted selection, and **no UI flicker** on first render or during switching.
- **Add language switcher** (English/Bangla) in the **top-right of the Dashboard header**.
- **Validate/normalize translation keys** to match `.cursor/commands/migrate-feature.md` Step 4 conventions across the codebase.

## Current state (key findings)

- Root layout fetches translations via API and passes them into the provider:

```34:68:app/layout.tsx
  const data = await getPublicData(`/api/v1/get-translations`, "translation");
  const translations = data?.data?.translations ?? [];
  // ...
  <I18nProvider translations={translations}>
```

- `I18nProvider` accepts `translations?: any` and initializes a singleton i18next instance.
- `i18n.ts` sets `lng: "da"` (wrong for default) and takes `translations: any`:

```6:13:i18n.ts
export const initializeI18n = (translations: any = {}) => {
  // ...
  i18n.use(initReactI18next).init({
    resources: translations,
    lng: "da",
    fallbackLng: "en",
```

- Many Zod schemas and server pages call `i18n.t(...)` at module-load time (e.g. `components/users/user-type.ts`, `app/(dashboard)/zones/page.tsx`), which will not be compatible with a per-tree i18n instance and also prevents true “instant” language switching for validation messages.
- `en.json`/`bn.json` currently **do not have identical structure** (e.g. `bn` has extra `user.confirm_password.errors.confirmed`, missing tooltips in several places; `en` is missing many keys referenced in code such as `*.errors.invalid`, `*.errors.min`, etc.).
- Dashboard header is implemented in `app/(dashboard)/top-navbar.tsx` (rendered by `components/page-container.tsx`), which is the correct place to add the switcher.

## Refactor approach

### 1) Remove translation API fetch

- Update `[app/layout.tsx](app/layout.tsx)`:
  - Remove the `getPublicData('/api/v1/get-translations', 'translation')` call and the `translations` prop entirely.
  - Read the persisted language from cookies (e.g. `lang`) and set `<html lang={...}>` accordingly.
  - Pass `initialLanguage` into `I18nProvider` instead of `translations`.

### 2) Implement file-based i18n resources (typed)

- Create a small i18n module (example paths):
  - `[lib/i18n/languages.ts](lib/i18n/languages.ts)` exports `type Language = 'en' | 'bn'`, constants, and safe parsing.
  - `[lib/i18n/resources.ts](lib/i18n/resources.ts)` imports JSON **directly** from `public/lang/en.json` and `public/lang/bn.json` and constructs i18next resources:
    - `resources = { en: { translation: enJson }, bn: { translation: bnJson } }`.
  - Enforce identical JSON structure at compile time:
    - `const en = enJson as const; const bn: typeof en = bnJson;` (fails build if structure diverges).
  - Keep it scalable: adding a new language becomes “add `{lng}.json` + update union type + add to resources”.

### 3) Replace singleton i18n initialization with a no-flicker provider

- Refactor `[context/I18nProvider.tsx](context/I18nProvider.tsx)` to:
  - Accept `{ children, initialLanguage }` (no `any`, no `translations`).
  - Create an i18next instance **inside the provider** using `createInstance()` (not the global singleton).
  - Initialize synchronously using `initImmediate: false` and in-memory resources to avoid async loading and initial flicker.
  - Expose a tiny app-level language API (via a context or a custom hook) to change language and persist it.

### 4) Persistence strategy (no initial flicker)

- Use a **cookie** (e.g. `lang=en|bn`) as the source of truth so the server can render the correct language on first paint.
- On language switch (client):
  - call `i18n.changeLanguage(nextLang)` (instant; resources already present)
  - set cookie (e.g. `document.cookie = 'lang=bn; path=/; max-age=31536000'`)
  - optionally mirror to `localStorage` for redundancy (but cookie is what prevents SSR mismatch/flicker).

### 5) Add language switcher in dashboard top-right

- Add a component like `[components/language-switcher.tsx](components/language-switcher.tsx)`:
  - UI: shadcn `ToggleGroup` or `DropdownMenu` (English/Bangla).
  - Reads current language from i18next and calls the provider’s `setLanguage`.
- Update `[app/(dashboard)/top-navbar.tsx](app/(dashboard)/top-navbar.tsx)` to render the switcher in the right-side control cluster next to `ThemeToggle` / `ThemeCustomize`.

### 6) Translation key normalization + validation (Step 4)

- Audit all `t('...')` and `i18n.t('...')` usages and migrate keys to the Step-4 structure:
  - Feature-based nesting: `user.`*, `zone.`*, `staff.*`, `salary.*`, `vendor.*`, `client.*`, `sub_zone.*`, etc.
  - Menu under `menu.*` (already mostly correct).
  - Shared/common UI text under a dedicated top-level feature like `common.*` (still Step-4 compliant).
  - Enforce `snake_case` for multi-word keys.
- Update both JSON files so:
  - **Every key exists in both** `en.json` and `bn.json`.
  - **Structure is identical** (compile-time enforced as described above).
- Refactor Zod schemas so validation messages are language-aware:
  - Replace module-scope `i18n.t(...)` with **schema factories** that accept a `t` function (from `useTranslation`) and are created inside the form components.
  - This prevents “frozen” validation messages after language changes.

### 7) Fix server `metadata` translations safely

- Pages like `[app/(dashboard)/zones/page.tsx](app/(dashboard)/zones/page.tsx)` currently use `i18n.t(...)` in static `metadata`, which won’t work reliably.
- Replace with `generateMetadata()` where needed:
  - Read `lang` cookie server-side.
  - Derive titles/descriptions from the static JSON dictionaries (no i18next singleton).

## Test plan (manual)

- Load app with no cookie: should render in English with **no flicker**.
- Switch to Bangla in dashboard header:
  - UI strings update instantly.
  - No page reload.
  - Cookie is set and persists after refresh/navigation.
- Verify Zod validation errors change language after switching.
- Verify `en.json` and `bn.json` compile with identical structure.
- Confirm there are **no remaining** translation API calls or usage of `NEXT_PUBLIC_TRANSLATION` for i18n.

