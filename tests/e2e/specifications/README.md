# Frontend Playwright specification workspaces

**AI agents must first read [initial test guidelines](INITIAL-TEST-GUIDELINES.md) and [Playwright agent instructions](../AGENTS.md), including the required local tenant login hosts.**

Every current page is mapped in [route inventory](route-inventory.json). Features include staff administration, settings/report subpages, subscriber portal, public pages, legacy/placeholder screens and shared behavior. These workspaces are specifications, not executed coverage.

- [Coverage policy and rollout](COVERAGE-POLICY.md)
- [Feature inventory](feature-inventory.json)
- [Scenario register](coverage-register.json)
- Run `python3 tests/e2e/specifications/check_coverage.py` to validate inventory/links/IDs and calculate evidence-backed scenario coverage.

The seven previously inspected feature tickets are preserved. New tickets are **source-inventoried drafts**, with domain scenarios and frontend/backend references. They require detailed validator/service/business review before implementation. Exact middleware, permission aliases, dynamic endpoints and unreachable components must be resolved, not guessed.

No scenario is marked implemented or passing by this documentation task. Existing e2e coverage is not automatically credited: map test titles and fresh execution evidence first.

## Feature tickets

- [activity-logs](activity-logs/ACTIVITY-LOGS-001.md) — source-inventoried-draft
- [agent-transactions](agent-transactions/AGENT-TRANSACTIONS-001.md) — source-inventoried-draft
- [agents](agents/AGENTS-001.md) — source-inventoried-draft
- [application-shell](application-shell/APPLICATION-SHELL-001.md) — source-inventoried-draft
- [archived-clients](archived-clients/ARCHIVED-CLIENTS-001.md) — source-inventoried-draft
- [authentication](authentication/AUTHENTICATION-001.md) — source-inventoried-draft
- [client-maps](client-maps/CLIENT-MAPS-001.md) — source-inventoried-draft
- [client-packages](client-packages/CLIENT-PACKAGES-001.md) — source-inventoried-draft
- [client-wallets](client-wallets/CLIENT-WALLETS-001.md) — source-inventoried-draft
- [clients](clients/CLIENT-001-client-management.md) — partially implemented; see clients/IMPLEMENTATION.md
- [communication-gateways](communication-gateways/COMMUNICATION-GATEWAYS-001.md) — source-inventoried-draft
- [communication-logs](communication-logs/COMMUNICATION-LOGS-001.md) — source-inventoried-draft
- [communication-queue](communication-queue/COMMUNICATION-QUEUE-001.md) — source-inventoried-draft
- [companies](companies/COMPANIES-001.md) — source-inventoried-draft
- [company-profile](company-profile/COMPANY-PROFILE-001.md) — source-inventoried-draft
- [company-subscriptions](company-subscriptions/COMPANY-SUBSCRIPTIONS-001.md) — source-inventoried-draft
- [cross-feature-journeys](cross-feature-journeys/CROSS-FEATURE-JOURNEYS-001.md) — source-inventoried-draft
- [dashboard](dashboard/DASHBOARD-001-staff-dashboard.md) — detailed-draft
- [demo-requests](demo-requests/DEMO-REQUESTS-001.md) — source-inventoried-draft
- [device-types](device-types/DEVICE-TYPES-001.md) — source-inventoried-draft
- [devices](devices/DEVICES-001.md) — source-inventoried-draft
- [expense-types](expense-types/EXPENSE-TYPES-001.md) — source-inventoried-draft
- [expenses](expenses/EXPENSE-001-expense-management.md) — detailed-draft
- [fund-transactions](fund-transactions/FUND-TRANSACTIONS-001.md) — source-inventoried-draft
- [funds](funds/FUNDS-001.md) — source-inventoried-draft
- [histories](histories/HISTORIES-001.md) — source-inventoried-draft
- [import-client](import-client/IMPORT-CLIENT-001.md) — source-inventoried-draft
- [invoice-types](invoice-types/INVOICE-TYPES-001.md) — source-inventoried-draft
- [invoices](invoices/INVOICE-001-invoice-management.md) — detailed-draft
- [legacy-settings](legacy-settings/LEGACY-SETTINGS-001.md) — source-inventoried-draft
- [mikrotik-commands](mikrotik-commands/MIKROTIK-COMMANDS-001.md) — source-inventoried-draft
- [mikrotik-packages](mikrotik-packages/MIKROTIK-PACKAGES-001.md) — source-inventoried-draft
- [mikrotik-sync](mikrotik-sync/MIKROTIK-SYNC-001.md) — source-inventoried-draft
- [my-wallets](my-wallets/MY-WALLETS-001.md) — source-inventoried-draft
- [networks](networks/NETWORK-001-network-management.md) — detailed-draft
- [noc](noc/NOC-001.md) — source-inventoried-draft
- [notifications](notifications/NOTIFICATIONS-001.md) — source-inventoried-draft
- [offline](offline/OFFLINE-001.md) — source-inventoried-draft
- [olts](olts/OLTS-001.md) — source-inventoried-draft
- [onus](onus/ONUS-001.md) — source-inventoried-draft
- [payment-gateways](payment-gateways/PAYMENT-GATEWAYS-001.md) — source-inventoried-draft
- [payments](payments/PAYMENTS-001.md) — source-inventoried-draft
- [permissions](permissions/PERMISSIONS-001.md) — source-inventoried-draft
- [portal-dashboard](portal-dashboard/PORTAL-DASHBOARD-001.md) — source-inventoried-draft
- [portal-invoices](portal-invoices/PORTAL-INVOICES-001.md) — source-inventoried-draft
- [portal-payments](portal-payments/PORTAL-PAYMENTS-001.md) — source-inventoried-draft
- [portal-profile](portal-profile/PORTAL-PROFILE-001.md) — source-inventoried-draft
- [portal-tickets](portal-tickets/PORTAL-TICKETS-001.md) — source-inventoried-draft
- [portal-traffic-report](portal-traffic-report/PORTAL-TRAFFIC-REPORT-001.md) — source-inventoried-draft
- [product-categories](product-categories/PRODUCT-CATEGORIES-001.md) — source-inventoried-draft
- [products](products/PRODUCTS-001.md) — source-inventoried-draft
- [public-about](public-about/PUBLIC-ABOUT-001.md) — source-inventoried-draft
- [public-demo-request](public-demo-request/PUBLIC-DEMO-REQUEST-001.md) — source-inventoried-draft
- [public-entry](public-entry/PUBLIC-ENTRY-001.md) — source-inventoried-draft
- [public-faq](public-faq/PUBLIC-FAQ-001.md) — source-inventoried-draft
- [public-features](public-features/PUBLIC-FEATURES-001.md) — source-inventoried-draft
- [public-home](public-home/PUBLIC-HOME-001.md) — source-inventoried-draft
- [public-payments](public-payments/PUBLIC-PAYMENTS-001.md) — source-inventoried-draft
- [public-pricing](public-pricing/PUBLIC-PRICING-001.md) — source-inventoried-draft
- [re-sync](re-sync/RE-SYNC-001.md) — source-inventoried-draft
- [reports-btrc](reports-btrc/REPORTS-BTRC-001.md) — source-inventoried-draft
- [reports-expenses](reports-expenses/REPORTS-EXPENSES-001.md) — source-inventoried-draft
- [reports-funds](reports-funds/REPORTS-FUNDS-001.md) — source-inventoried-draft
- [reports-hub](reports-hub/REPORTS-HUB-001.md) — source-inventoried-draft
- [reports-income-expense](reports-income-expense/REPORTS-INCOME-EXPENSE-001.md) — source-inventoried-draft
- [reports-invoices](reports-invoices/REPORTS-INVOICES-001.md) — source-inventoried-draft
- [reports-new-clients](reports-new-clients/REPORTS-NEW-CLIENTS-001.md) — source-inventoried-draft
- [reports-payments](reports-payments/REPORTS-PAYMENTS-001.md) — source-inventoried-draft
- [reports-product-in](reports-product-in/REPORTS-PRODUCT-IN-001.md) — source-inventoried-draft
- [reports-product-out](reports-product-out/REPORTS-PRODUCT-OUT-001.md) — source-inventoried-draft
- [reports-reseller-clients](reports-reseller-clients/REPORTS-RESELLER-CLIENTS-001.md) — source-inventoried-draft
- [reseller-packages](reseller-packages/RESELLER-PACKAGES-001.md) — source-inventoried-draft
- [reseller-profile](reseller-profile/RESELLER-PROFILE-001.md) — source-inventoried-draft
- [resellers](resellers/RESELLER-001-reseller-management.md) — partially implemented; see [implementation status](resellers/IMPLEMENTATION.md)
- [roles](roles/ROLES-001.md) — source-inventoried-draft
- [salaries](salaries/SALARIES-001.md) — source-inventoried-draft
- [settings-dashboard](settings-dashboard/SETTINGS-DASHBOARD-001.md) — source-inventoried-draft
- [settings-entry](settings-entry/SETTINGS-ENTRY-001.md) — source-inventoried-draft
- [settings-general](settings-general/SETTINGS-GENERAL-001.md) — source-inventoried-draft
- [settings-invoice-print](settings-invoice-print/SETTINGS-INVOICE-PRINT-001.md) — source-inventoried-draft
- [settings-map](settings-map/SETTINGS-MAP-001.md) — source-inventoried-draft
- [settings-monitoring](settings-monitoring/SETTINGS-MONITORING-001.md) — source-inventoried-draft
- [settings-notifications](settings-notifications/SETTINGS-NOTIFICATIONS-001.md) — source-inventoried-draft
- [settings-olt](settings-olt/SETTINGS-OLT-001.md) — source-inventoried-draft
- [settings-sms](settings-sms/SETTINGS-SMS-001.md) — source-inventoried-draft
- [shared-ui](shared-ui/SHARED-UI-001.md) — source-inventoried-draft
- [sms-send](sms-send/SMS-SEND-001.md) — source-inventoried-draft
- [sms-templates](sms-templates/SMS-TEMPLATES-001.md) — source-inventoried-draft
- [staff-profile](staff-profile/STAFF-PROFILE-001.md) — source-inventoried-draft
- [staffs](staffs/STAFFS-001.md) — source-inventoried-draft
- [sub-zones](sub-zones/SUB-ZONES-001.md) — source-inventoried-draft
- [subjects](subjects/SUBJECTS-001.md) — source-inventoried-draft
- [subscription](subscription/SUBSCRIPTION-001.md) — source-inventoried-draft
- [subscription-features](subscription-features/SUBSCRIPTION-FEATURES-001.md) — source-inventoried-draft
- [subscription-plans](subscription-plans/SUBSCRIPTION-PLANS-001.md) — source-inventoried-draft
- [platform-support](platform-support/PS-009-acceptance.md) — acceptance recorded, not release-ready
- [support-tickets](support-tickets/SUPPORT-001-support-tickets.md) — detailed-draft
- [tables](tables/TABLES-001.md) — source-inventoried-draft
- [tags](tags/TAGS-001.md) — source-inventoried-draft
- [telegram](telegram/TELEGRAM-001.md) — source-inventoried-draft
- [tj-box-maps](tj-box-maps/TJ-BOX-MAPS-001.md) — source-inventoried-draft
- [tj-boxes](tj-boxes/TJ-BOXES-001.md) — source-inventoried-draft
- [unit-types](unit-types/UNIT-TYPES-001.md) — source-inventoried-draft
- [users](users/USERS-001.md) — source-inventoried-draft
- [vendors](vendors/VENDORS-001.md) — source-inventoried-draft
- [zones](zones/ZONES-001.md) — source-inventoried-draft
