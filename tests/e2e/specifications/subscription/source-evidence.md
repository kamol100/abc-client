# Source evidence — subscription

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/subscription/page.tsx`
- `components/subscription/company-subscription-column.tsx`
- `components/subscription/company-subscription-form.tsx`
- `components/subscription/company-subscription-table.tsx`
- `components/subscription/company-subscription-type.ts`
- `components/subscription/feature-column.tsx`
- `components/subscription/feature-form-schema.ts`
- `components/subscription/feature-form.tsx`
- `components/subscription/feature-permission-editor.tsx`
- `components/subscription/feature-table.tsx`
- `components/subscription/feature-type.ts`
- `components/subscription/my-subscription.tsx`
- `components/subscription/plan-feature-matrix.tsx`
- `components/subscription/subscription-banner.tsx`
- `components/subscription/subscription-pay-dialog.tsx`
- `components/subscription/subscription-plan-column.tsx`
- `components/subscription/subscription-plan-form-schema.ts`
- `components/subscription/subscription-plan-form.tsx`
- `components/subscription/subscription-plan-table.tsx`
- `components/subscription/subscription-plan-type.ts`

## Observed permission checks

- `company-subscriptions.cancel`
- `company-subscriptions.create`
- `company-subscriptions.delete`
- `company-subscriptions.edit`
- `features.create`
- `features.delete`
- `features.edit`
- `features.permissions`
- `subscription-plans.create`
- `subscription-plans.delete`
- `subscription-plans.edit`
- `subscription-plans.features`

## Observed API templates (not validated endpoints)

- `/company-subscriptions`
- `/company-subscriptions/${id}/cancel`
- `/dropdown-companies`
- `/dropdown-subscription-plans`
- `/features`
- `/features/${featureId || `
- `/features/${featureId}/permissions`
- `/features/${move?.featureId ?? `
- `/features/${remove?.featureId ?? `
- `/my-subscription/invoices/pay/bkash/execute`
- `/subscription-plans`
- `/subscription-plans/${planId}/features`
- `/subscription-plans/${planId}/features/impact`
- `company-subscriptions`
- `features`
- `features/${featureId}`
- `my-subscription`
- `my-subscription/invoices`
- `my-subscription/invoices/pay/bkash`
- `my-subscription/invoices/pay/wallet`
- `my-subscription/invoices/payable`
- `permissions`
- `subscription-plans`

## Observed form/config field names

- `billing_interval`
- `company_id`
- `description`
- `ends_at`
- `grace_days`
- `is_active`
- `key`
- `max_clients`
- `min_clients`
- `name`
- `plan_id`
- `price`
- `sort_order`
- `starts_at`
- `status`
- `trial_days`

## Matching backend route declarations

- GET `/permissions` → `permissions.access`; `PermissionsController::index`; `../isp-backend/routes/api.php:173`
- POST `/permission-add` → `permissions.add`; `RolePermissionController::add`; `../isp-backend/routes/api.php:176`
- POST `/permission-remove` → `permissions.remove`; `RolePermissionController::remove`; `../isp-backend/routes/api.php:177`
- GET `/subscription-plans` → `subscription-plans.access`; `SubscriptionPlanController::index`; `../isp-backend/routes/api.php:597`
- POST `/subscription-plans` → `subscription-plans.create`; `SubscriptionPlanController::store`; `../isp-backend/routes/api.php:598`
- GET `/subscription-plans/{subscription_plan}` → `subscription-plans.show`; `SubscriptionPlanController::show`; `../isp-backend/routes/api.php:599`
- PUT `/subscription-plans/{subscription_plan}` → `subscription-plans.edit`; `SubscriptionPlanController::update`; `../isp-backend/routes/api.php:600`
- DELETE `/subscription-plans/{subscription_plan}` → `subscription-plans.delete`; `SubscriptionPlanController::destroy`; `../isp-backend/routes/api.php:601`
- POST `/subscription-plans/{subscription_plan}/features/impact` → `subscription-plans.features.impact`; `SubscriptionPlanController::featureRemovalImpact`; `../isp-backend/routes/api.php:602`
- PUT `/subscription-plans/{subscription_plan}/features` → `subscription-plans.features`; `SubscriptionPlanController::syncFeatures`; `../isp-backend/routes/api.php:603`
- GET `/features` → `features.access`; `FeatureController::index`; `../isp-backend/routes/api.php:605`
- POST `/features` → `features.create`; `FeatureController::store`; `../isp-backend/routes/api.php:606`
- GET `/features/{feature}` → `features.show`; `FeatureController::show`; `../isp-backend/routes/api.php:607`
- PUT `/features/{feature}` → `features.edit`; `FeatureController::update`; `../isp-backend/routes/api.php:608`
- DELETE `/features/{feature}` → `features.delete`; `FeatureController::destroy`; `../isp-backend/routes/api.php:609`
- PUT `/features/{feature}/permissions` → `features.permissions`; `FeatureController::syncPermissions`; `../isp-backend/routes/api.php:610`
- POST `/features/{feature}/permissions/move` → `features.permissions.move`; `FeatureController::movePermission`; `../isp-backend/routes/api.php:611`
- POST `/features/{feature}/permissions/remove` → `features.permissions.remove`; `FeatureController::removePermission`; `../isp-backend/routes/api.php:612`
- GET `/company-subscriptions` → `company-subscriptions.access`; `CompanySubscriptionController::index`; `../isp-backend/routes/api.php:614`
- POST `/company-subscriptions` → `company-subscriptions.create`; `CompanySubscriptionController::store`; `../isp-backend/routes/api.php:615`
- PUT `/company-subscriptions/{company_subscription}` → `company-subscriptions.edit`; `CompanySubscriptionController::update`; `../isp-backend/routes/api.php:616`
- DELETE `/company-subscriptions/{company_subscription}` → `company-subscriptions.delete`; `CompanySubscriptionController::destroy`; `../isp-backend/routes/api.php:617`
- POST `/company-subscriptions/{company_subscription}/cancel` → `company-subscriptions.cancel`; `CompanySubscriptionController::cancel`; `../isp-backend/routes/api.php:618`
- GET `/my-subscription` → `subscription.my`; `CompanySubscriptionController::mine`; `../isp-backend/routes/api.php:678`
- GET `/my-subscription/invoices` → `subscription.my.invoices`; `CompanySubscriptionController::invoices`; `../isp-backend/routes/api.php:679`
- GET `/my-subscription/invoices/payable` → `subscription.my.invoices.payable`; `CompanySubscriptionController::payable`; `../isp-backend/routes/api.php:680`
- POST `/my-subscription/invoices/pay/wallet` → `subscription.my.invoices.pay.wallet`; `CompanySubscriptionController::payWallet`; `../isp-backend/routes/api.php:681`
- POST `/my-subscription/invoices/pay/bkash` → `subscription.my.invoices.pay.bkash`; `CompanySubscriptionController::payBkash`; `../isp-backend/routes/api.php:682`
- POST `/my-subscription/invoices/pay/bkash/execute` → `subscription.my.invoices.pay.bkash.execute`; `CompanySubscriptionController::executeBkash`; `../isp-backend/routes/api.php:683`
- GET `/dropdown-companies` → `dropdown.companies`; `CompanyController::dropdownList`; `../isp-backend/routes/api.php:714`
- GET `/dropdown-subscription-plans` → `dropdown.subscription-plans`; `SubscriptionPlanController::dropdownList`; `../isp-backend/routes/api.php:715`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/CompanySubscriptionController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FeatureController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/PermissionsController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/RolePermissionController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/SubscriptionPlanController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/CreateSubscriptionBkashPaymentRequest.php`
- `../isp-backend/app/Http/Requests/ExecuteSubscriptionBkashPaymentRequest.php`
- `../isp-backend/app/Http/Requests/FeatureRequest.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/MoveFeaturePermissionRequest.php`
- `../isp-backend/app/Http/Requests/PaySubscriptionInvoicesRequest.php`
- `../isp-backend/app/Http/Requests/RemoveFeaturePermissionRequest.php`
- `../isp-backend/app/Http/Requests/RolePermissionRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanySubscriptionRequest.php`
- `../isp-backend/app/Http/Requests/SubscriptionPlanRequest.php`
- `../isp-backend/app/Http/Requests/SyncFeaturePermissionsRequest.php`
- `../isp-backend/app/Http/Requests/SyncPlanFeaturesRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySubscriptionRequest.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/CompanySubscriptionCollection.php`
- `../isp-backend/app/Http/Resources/CompanySubscriptionResource.php`
- `../isp-backend/app/Http/Resources/FeatureCollection.php`
- `../isp-backend/app/Http/Resources/FeatureResource.php`
- `../isp-backend/app/Http/Resources/InvoiceCollection.php`
- `../isp-backend/app/Http/Resources/PermissionResource.php`
- `../isp-backend/app/Http/Resources/SubscriptionPlanCollection.php`
- `../isp-backend/app/Http/Resources/SubscriptionPlanResource.php`
