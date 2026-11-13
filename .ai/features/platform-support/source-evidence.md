# Source evidence and integration map

Reviewed locally on 13 November 2026. Inspect current source before implementation; these references are starting points, not a frozen API guarantee. This specification does not authorize copying existing gaps.

## Frontend — /Users/kamol/Documents/www/shadcn-client

- `AGENTS.md`, `.ai/workflows/frontend-feature.md`, `.ai/workflows/code-review.md`, `.cursor/rules/architecture.mdc`: implementation/checks/tenant rules.
- `.agents/skills/agent/SKILL.md` and `.cursor/skills/agent/SKILL.md`: wrappers, thin pages, forms, table, i18n and permission conventions. Use applicable current copy if these diverge.
- `app/(dashboard)/layout.tsx`: server settings load and authenticated AppProvider boundary for the new launcher. `app/(client-dashboard)/layout.tsx` is a separate subscriber audience; do not mount this feature there in v1.
- `context/app-provider.tsx`: current hasPermission checks names from settings. It does not establish backend authorization. `hooks/use-menu-items.ts`: permission/feature/reseller navigation and source for feature-help coverage.
- `hooks/use-api-query.ts`: passes Query options through, sets refetchOnWindowFocus=false by default and builds page-aware keys. `hooks/use-api-mutation.ts`: FormData-aware server action transport, comma-separated string invalidation keys. Use explicit QueryClient updates for scoped history rather than changing its public contract for convenience.
- `app/actions.ts`: useFetch attaches server-side Sanctum bearer and cache:no-store. `lib/images/proxy-private-image.ts` and `app/api/clients/[id]/images/[field]/route.ts`: authenticated fixed-path private-image streaming pattern. Existing proxy is GET-only; PS-003 adds bounded same-origin multipart POST/DELETE adapters.
- `components/form/private-image-fields.tsx`: existing image selection pattern; support messages need multi-image staging, not profile field names. `components/form-wrapper/form-wrapper.tsx`: FormBuilder/FormData orchestration.
- `components/tickets/ticket-message-thread.tsx` and `components/client-area/tickets/client-ticket-message-thread.tsx`: existing five-second polling pattern. These are preserved, not extended. Existing thread API returns all messages; new cursor contract is independent.
- `components/notifications/notification-bell.tsx`: currently requires notifications.access. New support unread must remain usable independently. `components/notifications/notification-catalog.ts` and `hooks/use-notifications.ts`: event label/query integration references.
- `lib/i18n/languages.ts`: en/bn, cookie lang, default en. `lib/i18n/server.ts`: shared default-language instance; do not mutate it globally for each article request.
- `components/marketing/faq/faq-page.tsx`: public marketing FAQ, not private feature documentation. `package.json` has no declared Markdown renderer. `next.config.ts` does not currently declare custom server-action upload-size allowances; inspect runtime limits before upload work.
- `components/zones/`, `components/staffs/`, `components/invoices/invoice-form.tsx`, `components/payments/`: source twins for forms/tables/custom layouts.
- `tests/e2e/specifications/`, `scripts/run-e2e.mjs`, root Playwright configs: existing spec IDs, execution evidence and multi-suite runner conventions.

## Backend — /Users/kamol/Documents/www/isp-backend

- `AGENTS.md`, `.ai/workflows/backend-feature.md`, `.ai/safety.md`: implementation, testing and production-operation restrictions.
- `docs/architecture/multi-tenancy.md`, especially §§3,7,8,9,10; `docs/architecture/tenant-isolation-audit.md`: canonical security model and known gaps. PS-001 documents a narrow aggregate support-inbox exception, never a general permission to clear scopes.
- `app/Models/User.php`: User principals may have no Staff; User is not automatically tenant-scoped. Do not use unqualified cross-company User queries.
- `app/Tenant/BelongsToTenants.php`, `app/Scopes/ResellerScope.php`, `app/Traits/UseResellerScope.php`: company stamping/tenant binding and exact-reseller/null-company-staff behavior. Company-wide support readers need explicit permitted widening; platform child writes must use trusted parent ownership.
- `app/Http/Middleware/CheckRolePermissions.php`: reads role permissions and bypasses Super Admin; it is not sufficient alone for system-baseline grants or explicit platform-company checks.
- `app/Http/Middleware/CheckSubscription.php`, `app/Services/Subscriptions/SubscriptionService.php`, `database/seeders/Project/FeatureSeeder.php`: existing ticket feature mapping and expired-write availability. Distinguish always-available support from platform-only catalog entries; do not let route-prefix fallthrough decide availability accidentally.
- `app/Models/Ticket.php`, `app/Models/TicketMessage.php`, `app/Http/Controllers/V1/Admin/TicketController.php`, `app/Http/Controllers/V1/Client/TicketController.php`, `routes/api.php`, `routes/client.php`: preserved tenant/customer domain, not this feature's persistence or API.
- Existing source gaps observed: generic TicketMessageController queries lack authorized-parent tenant scoping; nested ticket message routes omit permissions middleware; UpdateTicketRequest accepts relation IDs without scoped checks. This new product must not rely on those paths. Fixing legacy defects is separate scope, not a prerequisite to a fully independent platform-support service.
- `app/Services/Images/PrivateImageStorage.php`: existing private disk/stream pattern with fixed profile fields and 2 MB limit. Preserve it; implement support attachment storage separately or extract only a proven neutral helper without behavior changes.
- `app/Services/Notifications/NotificationEmitter.php`, `NotificationRecipientResolver.php`, `NotificationService.php`, `app/Enums/NotificationEvent.php`, `app/Jobs/DispatchNotificationJob.php`: notification integration. Verify current recipient/channel semantics and after-commit delivery rather than copying a ticket event with source-company audience.
- Existing `RunsForCompany` job concern and queue tenancy rules: restoring worker contexts for notification delivery and staged-image cleanup.

## Specification preparation evidence

Only specification documents/report were changed while preparing this pack. No API implementation, migration, package installation, live data mutation, browser test or production configuration change was performed. Repository status/diff and local specification consistency checks are recorded in `.ai/report.md`. Implementation records deliberately remain pending.
