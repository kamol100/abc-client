# Help content

Articles are Markdown files under `en/` and `bn/`. Permission rules live in `catalog.ts` and are the same for both languages. Translators edit front matter and body text. They do not add or change `requiredAll`, `requiredAny`, audience, or feature.

`permission-catalog.json` is a checked copy of backend route permission names. The help validator reads this file. It does not call the API or a production database.

Update it from a sibling `isp-backend` checkout:

```bash
node scripts/export-help-permission-catalog.mjs
```

Review owner: whoever adds or renames a backend route permission reviews the JSON diff before a help article uses the new name.

Check articles, translations, revisions, links, and permissions:

```bash
node scripts/check-help-content.mjs
```

Published articles need both languages at the same `sourceRevision`. A draft may set `developmentEnglishFallback` and omit Bangla. That fallback is development-only and cannot be published.

Video ids stay empty until a reviewed YouTube id is supplied. Do not invent one. Screenshots, if added later, belong under `content/help/media/<article-id>/` and are served only after the article's permission check.
