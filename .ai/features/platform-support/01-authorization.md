# Authorization and availability contract

All names below are proposed. Every capability name equals an actual named route in 02-data-and-api.md. Spatie guard/team conventions remain sanctum/company_id. Use one module capability/visibility resolver in policies, queries and capability output; do not authorize by menu or role display name alone.

## Baseline capabilities

`platform-support.access`, `.create`, `.show`, `.messages`, `.reply`, `.resolve`, `.reopen`, `.convert`, `.read`, `.summary`, `.upload`, `.upload-delete`, `.attachment` are system-granted baseline capabilities for every eligible authenticated User to act on their own conversations. The two route prefixes in this document expand literally (for example `.reply` means `platform-support.reply`). No Client principal receives them. Baseline grants never imply platform inbox access or visibility of a colleague's conversation.

These capabilities must remain available regardless of plan support feature, subscription expiry, staff job role or absence of a Staff record. Implement a dedicated platform-support authorization middleware/policy that supplies these named baseline capabilities and optional role permissions, rather than relying on CheckRolePermissions (currently role-only) to infer them. Register actual Permission records for catalog/UI consistency, distinguish system grants from editable role grants, and return baseline names in the effective frontend permissions/settings. Never make baseline grants extend to other modules. Existing role permission editing cannot disable the promised own-support access by removing a role permission; server policy and capability output must stay aligned. Locked/deleted/inactive accounts remain denied by existing account controls.

Optional Spatie role permissions:

- `platform-support.reseller.access`: list/read other requesters' conversations within the actor's exact reseller and company.
- `platform-support.company.access`: list/read all conversations within the actor's company, including its resellers; actor must have reseller_id null.
- `platform-support.team.reply`: reply to conversations already visible through an optional scope grant.
- `platform-support.team.manage`: resolve/reopen/change issue status or close/reopen chats already visible through an optional scope grant. No assignment or chat conversion for colleagues in v1.

Each optional name is also a named route. Seed these as default OFF for ordinary staff; assign them explicitly through existing permission administration. Do not grant company scope automatically because of Admin role naming. Baseline own permissions remain available independently. A user granted team.reply/manage without a visibility grant cannot use it on colleagues' requests. A reseller granted company.access remains denied the company route; permission plus scope eligibility are both mandatory.

## Platform capabilities

- `platform-support-admin.access`: aggregate cross-company inbox.
- `platform-support-admin.show`, `.messages`, `.attachment`: detail, messages and private image access.
- `platform-support-admin.reply`, `.status`, `.assign`, `.convert`: individual actions.
- `platform-support-admin.read`, `.summary`, `.upload`, `.upload-delete`: personal read state, summary and attachment staging.
- `platform-support-admin.assignees`: eligible platform-agent assignment choices; this does not itself grant assignment or thread visibility.

For every platform route: active User + platform-company membership using the existing canonical PLATFORM_COMPANY_ID constant + that route's platform-only permission, or canonical platform-administrator authorization that yields that effective capability. App administrators receive the full set through platform-only provisioning; platform staff receive selected named permissions. Company membership alone is never sufficient. A non-platform “Super Admin” must be denied, even though legacy CheckRolePermissions bypasses that role. Apply the explicit platform-company check before binding/reading any target. Do not allow a tenant's role editor, subscription plan or reseller role grant to acquire platform privileges.

Base module capabilities are distinct from the legacy `support` plan feature. Configure feature/permission catalogs so tenant baseline and optional tenant scopes are not mistaken for platform-only permissions simply because their feature mapping is null. Optional tenant scope permissions are assignable independently of paid plans but are still subject to role administration rights. Keep all platform-support-admin names nonassignable from tenant/reseller role routes. Add explicit support route availability to subscription enforcement; do not globally disable subscription middleware or rely on an unmapped prefix falling through today's implementation.

## Visibility predicate

Requester-side visibility is always company_id = authenticated company's ID AND one of:

1. requester_user_id = actor.id AND thread.reseller_id matches the actor's current reseller ownership (including null); or
2. actor.reseller_id is non-null AND exact matching reseller AND reseller.access; or
3. actor.reseller_id is null AND company.access.

Use exact null handling. A permission change is effective on the next request. An ownership-scope transfer of a user does not transfer old threads: staff reassigned to another company/reseller lose old-scope access; authorized old-scope managers/platform staff retain access. No descendant/parent reseller expansion in v1.

For details/images/history use this predicate plus the route action capability. API resources expose per-record `abilities` derived from the same policy, so UI can accurately render actions. Per-record abilities supplement named frontend permission checks. Frontend company IDs, reseller IDs, UUIDs, role names and hostnames are never authorization inputs.

## Query and binding rules

Default company scope stays on requester queries. Use the normal company and reseller traits on root threads; widen only reseller scope in the company-wide service after explicit company.access and non-reseller checks. Child queries must start from an already-authorized parent, not unscoped message/attachment IDs. Test route binding order: a company-wide reader needs permission-aware reseller binding; use explicit service lookup if default binding would reject a legitimate company scope. Never remove company scope for tenant-side requests.

Platform inbox is a deliberate, narrowly scoped multi-company listing exception required by this product. PS-001 must document it in canonical tenancy architecture: only platform-support records and minimal tenant/requester identity summaries, behind platform authorization; paginated and auditable. Other category-4 operations still target exactly one company. For each detail/mutation, resolve the support thread through the guarded platform repository and explicitly constrain all subsequent reads/writes to that thread's stored company_id and ID. Never use Landlord::disable(), global scope bypasses on unrelated models or a request-selected tenant. Aggregate listings must not return credentials, client details, billing records or generic full User/Company resources.

Cross-tenant services must account for tenant traits on create: replying as a platform agent stores message ownership under the parent thread's tenant, not the agent's platform tenant. Use explicit trusted parent values and restoring forCompany contexts where needed. Jobs always restore tenant state. No platform route is exposed through subscriber guards.

## Images, metadata and notifications

Authorize metadata and binary bytes identically. Staged images are visible only to the uploader, in the selected thread context if any; sent images inherit the parent thread policy. Thread ownership and author are always server-derived. Every image read rechecks current access. Search, summaries, counts, filters, notification recipients and related chat/issue history use the same visibility predicate. A UUID, attachment token or notification link alone is not a permission.

Audit platform detail reads, image reads, replies, assignments, transitions, conversion and aggregate-inbox access, with actor and target ownership context. Deduplicate/rate-limit polling audit events so normal 5-second reads do not create an unbounded log storm. Logs exclude message bodies, raw uploads, cookies/tokens and secret context.
