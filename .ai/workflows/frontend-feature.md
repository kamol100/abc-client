# Frontend feature workflow

1. Find the page under `app/(dashboard)/` or `app/(client-dashboard)/` and the feature folder under `components/`.
2. Open the nearest twin before writing files: `components/zones/` (dialog CRUD), `components/staffs/` or `components/clients/` (accordion page), `components/payments/` (filters), `components/invoices/invoice-form.tsx` (custom layout).
3. Reuse `useApiQuery` / `useApiMutation`. Check the Laravel route and resource before adding a field the API does not return.
4. Build the form with `FormBuilder` or `AccordionFormBuilder`. Zod messages are i18n keys.
5. Add keys to both `public/lang/en.json` and `public/lang/bn.json`.
6. Use theme tokens only. Check light and dark. Layout is mobile-first.
7. Gate create, edit, and delete with `hasPermission` using the backend route name. Add a menu entry only if this is a new nav item.
8. Do not modify `components/ui/*`.
9. Keep the change smaller than a new abstraction. Preserve current routes and query keys.
10. Run `scripts/ai/frontend-check`. Do not treat the broken ESLint config as part of the task. Run Playwright only if an e2e spec already covers this screen.
11. Review `scripts/ai/diff` for unrelated files, hardcoded strings, and `any`.
12. Write `.ai/report.md`.
