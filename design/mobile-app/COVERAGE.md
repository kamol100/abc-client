# Web app → mobile design coverage (audit 2026-11-03)

Source of truth: every `app/**/page.tsx` route in abc-client (~120) and the 11 backend feature modules
(Clients, Billing, Network, Resellers, Inventory, SMS, Support, HR, Finance, Core, OLTs).
Status: ✅ covered · 🟡 partial · ❌ missing (should be on mobile) · 🖥 web-only (manage on web).

## Subscriber portal
| Web route | Mobile screen | Status |
|---|---|---|
| client/login | auth-SubscriberLogin, auth-Otp | ✅ |
| client/dashboard | sub-Home | ✅ |
| client/invoices | sub-Invoices, sub-InvoiceDetail | ✅ |
| client/payments | sub-Payments | ✅ |
| client/profile | sub-Profile | ✅ |
| client/tickets, tickets/[id] | sub-Tickets, sub-TicketChat (new-ticket form missing) | 🟡 |
| client/traffic-report | sub-Usage | ✅ |
| pay, pay/[key], pay/bkash-callback | sub-PayBill, sub-BkashCheckout, sub-PaymentSuccess | ✅ |
| forgot-password, reset-password | — | ❌ |

## Clients (staff)
| Web route | Mobile screen | Status |
|---|---|---|
| clients | adm-Clients, res-Clients | ✅ |
| clients/view/[id] (package change, lock, session reset, status, SMS, ticket, history, ONU, router, live speed) | adm-Client360, res-ClientDetail | ✅ |
| clients/create | res-NewClient | ✅ |
| clients/edit/[id] | — (reuse NewClient as edit) | ❌ |
| archived-clients | — | ❌ |
| client-maps | tech-Map (jobs only) | 🟡 |
| client-packages, client-packages/view/[id] | — | ❌ |
| client-wallets | — | ❌ |
| import-client | — | 🖥 CSV upload |

## Billing and finance
| Web route | Mobile screen | Status |
|---|---|---|
| dashboard | adm-Home | ✅ |
| invoices, invoices/client/[id] | — (staff invoice list/detail) | ❌ |
| invoices/create, invoices/edit/[id] | — | ❌ |
| payments | res-CollectPayment (collect only); staff payment list missing | 🟡 |
| my-wallets | res-Wallet | ✅ |
| funds, fund-transactions | — | ❌ |
| expenses | — | ❌ |
| salaries | — | ❌ (view/pay) |
| reports/* (income-expense, payments, invoices, funds, expenses, new-clients, reseller-clients, product-in/out, btrc) | adm-Reports (hub only; no report detail) | 🟡 |
| invoice-types, expense-types, payment-gateways | — | 🖥 |

## Network and OLT
| Web route | Mobile screen | Status |
|---|---|---|
| noc | adm-NocMap, adm-Alarms, adm-AlarmDetail, adm-Outage | ✅ |
| olts | — (OLT list) | ❌ |
| olts/view/[id], monitoring | adm-OltDetail | ✅ |
| onus | adm-Onus, tech-ScanOnu, tech-BindOnu | ✅ |
| networks (MikroTik routers, status) | — | ❌ |
| re-sync | — | ❌ |
| mikrotik-commands | — (tech-Terminal is OLT only) | ❌ |
| devices | — | ❌ |
| tj-boxes, tj-box-maps | — | ❌ |
| mikrotik-packages, device-types, zones, sub-zones | — | 🖥 |

## Resellers and agents
| Web route | Mobile screen | Status |
|---|---|---|
| resellers, resellers/view/[id], create, edit | — (admin side) | ❌ |
| reseller-profile/[id] | res-Home via adm-More switch | 🟡 |
| reseller-packages | — | ❌ |
| agents, agent-transactions | — | ❌ |

## Support and SMS
| Web route | Mobile screen | Status |
|---|---|---|
| tickets, tickets/view/[id] (staff inbox, assign) | tech-Jobs (technician only) | 🟡 |
| sms-send | adm-BulkSms | ✅ |
| sms-templates | — | ❌ (pick in BulkSms) |
| communication-logs, communication-queue | — | ❌ |
| notifications | adm-Notifications | ✅ |
| subjects, tags, communication-gateways, telegram | — | 🖥 |

## Inventory
| Web route | Mobile screen | Status |
|---|---|---|
| products, products/in, products/out, products/reports | — | ❌ (issue stock to job) |
| product-categories, unit-types, vendors | — | 🖥 |

## Staff, HR and core
| Web route | Mobile screen | Status |
|---|---|---|
| login | auth-StaffLogin, auth-Unlock | ✅ |
| staffs, staffs/create, edit | — | ❌ |
| staff-profile | adm-More (header only) | 🟡 |
| activity-logs, histories | — | ❌ |
| users, roles, permissions | — | 🖥 |
| settings/* (general, invoice-print, map, monitoring, notifications, olt, sms, themes, dashboard, table) | — (app settings: language, theme, push, printer) | ❌ subset, rest 🖥 |
| subscription (tenant plan, renew, expired 402) | adm-More plan line | ❌ |
| offline | tech-SyncQueue (no offline/empty/error states) | 🟡 |

## Platform (company_id 1)
| Web route | Mobile screen | Status |
|---|---|---|
| companies | plat-Tenants | ✅ |
| company-profile/[id], company-subscriptions, subscription-plans, demo-requests | — | ❌ |
| subscription-features | — | 🖥 |

## Summary
- ✅ covered: ~32 web routes. 🟡 partial: 9. ❌ missing: ~45 routes, about 38 new mobile screens.
- 🖥 web-only (config/CRUD of lookup tables, roles, gateways, CSV import): ~25 routes; mobile shows a
  "Manage on web" row in Settings instead.

## Round 2 result (same day)
All ❌, 🟡 and 🖥 rows above now have screens: 73 new boards (134 total), listed with parents and web
sources in NAV.md "Coverage round 2", grouped G1-G8 as titled rows at the bottom of the canvas. Lookup
tables (zones, sub-zones, device/unit types, product categories, vendors, invoice/expense types, ticket
subjects, tags) share one template: set-Lookups -> set-LookupList; MikroTik packages has its own screen.
