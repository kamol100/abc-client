# Source evidence — tags

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/tags/page.tsx`
- `components/tags/tag-column.tsx`
- `components/tags/tag-form-schema.ts`
- `components/tags/tag-form.tsx`
- `components/tags/tag-table.tsx`
- `components/tags/tag-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/tags`
- `tags`

## Observed form/config field names

- `name`

## Matching backend route declarations

- GET `/tags` → `tags.access`; `TagsController::index`; `../isp-backend/routes/api.php:584`
- POST `/tags` → `tags.create`; `TagsController::store`; `../isp-backend/routes/api.php:585`
- GET `/tags/{tag}` → `tags.show`; `TagsController::show`; `../isp-backend/routes/api.php:586`
- PUT `/tags/{tag}` → `tags.edit`; `TagsController::update`; `../isp-backend/routes/api.php:587`
- DELETE `/tags/{tag}` → `tags.delete`; `TagsController::destroy`; `../isp-backend/routes/api.php:588`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/TagsController.php`
- `../isp-backend/app/Http/Requests/StoreTagRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTagRequest.php`
- `../isp-backend/app/Http/Resources/TagCollection.php`
- `../isp-backend/app/Http/Resources/TagResource.php`
