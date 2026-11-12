# Source evidence — product-categories

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/product-categories/page.tsx`
- `components/product-category/product-category-column.tsx`
- `components/product-category/product-category-form-schema.ts`
- `components/product-category/product-category-form.tsx`
- `components/product-category/product-category-table.tsx`
- `components/product-category/product-category-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/product-categories`
- `product-categories`

## Observed form/config field names

- `description`
- `name`

## Matching backend route declarations

- GET `/product-categories` → `product-categories.access`; `ProductCategoryController::index`; `../isp-backend/routes/api.php:358`
- POST `/product-categories` → `product-categories.create`; `ProductCategoryController::store`; `../isp-backend/routes/api.php:359`
- GET `/product-categories/{productCategory}` → `product-categories.show`; `ProductCategoryController::show`; `../isp-backend/routes/api.php:360`
- PUT `/product-categories/{productCategory}` → `product-categories.edit`; `ProductCategoryController::update`; `../isp-backend/routes/api.php:361`
- DELETE `/product-categories/{productCategory}` → `product-categories.delete`; `ProductCategoryController::destroy`; `../isp-backend/routes/api.php:362`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ProductCategoryController.php`
- `../isp-backend/app/Http/Requests/StoreProductCategoryRequest.php`
- `../isp-backend/app/Http/Requests/UpdateProductCategoryRequest.php`
- `../isp-backend/app/Http/Resources/ProductCategoryCollection.php`
- `../isp-backend/app/Http/Resources/ProductCategoryResource.php`
