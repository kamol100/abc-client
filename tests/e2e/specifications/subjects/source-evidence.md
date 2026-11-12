# Source evidence — subjects

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/subjects/page.tsx`
- `components/subjects/subject-column.tsx`
- `components/subjects/subject-form-schema.ts`
- `components/subjects/subject-form.tsx`
- `components/subjects/subject-table.tsx`
- `components/subjects/subject-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/subjects`
- `subjects`

## Observed form/config field names

- `name`

## Matching backend route declarations

- GET `/subjects` → `subjects.access`; `SubjectController::index`; `../isp-backend/routes/api.php:577`
- POST `/subjects` → `subjects.create`; `SubjectController::store`; `../isp-backend/routes/api.php:578`
- GET `/subjects/{subject}` → `subjects.show`; `SubjectController::show`; `../isp-backend/routes/api.php:579`
- PUT `/subjects/{subject}` → `subjects.edit`; `SubjectController::update`; `../isp-backend/routes/api.php:580`
- DELETE `/subjects/{subject}` → `subjects.delete`; `SubjectController::destroy`; `../isp-backend/routes/api.php:581`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/SubjectController.php`
- `../isp-backend/app/Http/Requests/StoreSubjectRequest.php`
- `../isp-backend/app/Http/Requests/UpdateSubjectRequest.php`
- `../isp-backend/app/Http/Resources/SubjectCollection.php`
- `../isp-backend/app/Http/Resources/SubjectResource.php`
