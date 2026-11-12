# Source evidence — demo-requests

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/demo-requests/page.tsx`
- `components/demo-requests/demo-request-actions-cell.tsx`
- `components/demo-requests/demo-request-admin-form-field-schema.ts`
- `components/demo-requests/demo-request-status-form.tsx`
- `components/demo-requests/demo-request-table.tsx`
- `components/demo-requests/demo-request-type.ts`
- `components/demo-requests/demo-request-view-dialog.tsx`
- `components/demo-requests/demo-requests-column.tsx`

## Observed permission checks

- `demo-requests.delete`
- `demo-requests.edit`
- `demo-requests.show`

## Observed API templates (not validated endpoints)

- `/demo-requests`
- `demo-requests`
- `demo-requests/${demoRequestId}`

## Observed form/config field names

- `email`
- `full_name`
- `isp_name`
- `office_address`
- `password`
- `phone`
- `status`
- `terms_accepted`
- `user_count`
- `username`
- `website`
- `whatsapp`

## Matching backend route declarations

- GET `/demo-requests` → `demo-requests.access`; `DemoRequestController::index`; `../isp-backend/routes/api.php:504`
- GET `/demo-requests/{demoRequest}` → `demo-requests.show`; `DemoRequestController::show`; `../isp-backend/routes/api.php:505`
- PUT `/demo-requests/{demoRequest}` → `demo-requests.edit`; `DemoRequestController::update`; `../isp-backend/routes/api.php:506`
- DELETE `/demo-requests/{demoRequest}` → `demo-requests.delete`; `DemoRequestController::delete`; `../isp-backend/routes/api.php:507`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/DemoRequestController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/DemoRequestController.php`
- `../isp-backend/app/Http/Requests/StoreDemoRequest.php`
- `../isp-backend/app/Http/Requests/UpdateDemoRequest.php`
- `../isp-backend/app/Http/Resources/DemoRequestCollection.php`
- `../isp-backend/app/Http/Resources/DemoRequestResource.php`
