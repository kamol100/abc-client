# Source evidence — portal-traffic-report

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(client-dashboard)/client/traffic-report/page.tsx`
- `components/client-area/traffic-report/client-traffic-report.tsx`
- `components/client-area/traffic-report/traffic-report-format.ts`
- `components/client-area/traffic-report/traffic-report-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `client-traffic-report`

## Observed form/config field names

- `usage_date`

## Matching backend route declarations

- GET `/client-traffic-report` → `client.traffic-report`; `TrafficReportController::index`; `../isp-backend/routes/client.php:28`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Client/TrafficReportController.php`
- `../isp-backend/app/Http/Requests/ClientTrafficReportRequest.php`
