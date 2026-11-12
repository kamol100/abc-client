# Source evidence — products

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/products/in/[id]/page.tsx`
- `app/(dashboard)/products/in/page.tsx`
- `app/(dashboard)/products/out/[id]/page.tsx`
- `app/(dashboard)/products/out/page.tsx`
- `app/(dashboard)/products/page.tsx`
- `app/(dashboard)/products/reports/page.tsx`
- `components/products/product-column.tsx`
- `components/products/product-filter-schema.ts`
- `components/products/product-form-schema.ts`
- `components/products/product-form.tsx`
- `components/products/product-in-form-schema.ts`
- `components/products/product-in-form.tsx`
- `components/products/product-in-lines-editor.tsx`
- `components/products/product-in-type.ts`
- `components/products/product-movement-column.tsx`
- `components/products/product-movement-filter-schema.ts`
- `components/products/product-movement-table.tsx`
- `components/products/product-movement-type.ts`
- `components/products/product-out-form-schema.ts`
- `components/products/product-out-form.tsx`
- `components/products/product-out-lines-editor.tsx`
- `components/products/product-out-serial-picker.tsx`
- `components/products/product-out-type.ts`
- `components/products/product-reports-filter-schema.ts`
- `components/products/product-reports-summary.tsx`
- `components/products/product-reports-table.tsx`
- `components/products/product-reports-type.ts`
- `components/products/product-reports-view.tsx`
- `components/products/product-serial-dialog.tsx`
- `components/products/product-table.tsx`
- `components/products/product-type.ts`
- `components/products/products-toolbar-actions.tsx`

## Observed permission checks

- `products-in.create`
- `products-out.create`
- `products.create`
- `products.delete`
- `products.edit`

## Observed API templates (not validated endpoints)

- `/dropdown-clients`
- `/dropdown-expense-types`
- `/dropdown-funds`
- `/dropdown-product-categories`
- `/dropdown-products`
- `/dropdown-staffs`
- `/dropdown-unit-types`
- `/dropdown-vendors`
- `/product-in-serials/${productInId}`
- `/products`
- `/products-in`
- `/products-out`
- `get-product/${productId}`
- `products`

## Observed form/config field names

- `any`
- `client_id`
- `create_invoice`
- `description`
- `entry_by`
- `expense.amount`
- `expense.expense_type_id`
- `expense.fund_id`
- `expense.note`
- `expense.vendor_id`
- `has_serial`
- `name`
- `note`
- `out_date`
- `product`
- `product_category_id`
- `product_id`
- `purchase_by`
- `purchase_date`
- `received_by`
- `status`
- `unit_type_id`
- `vat`
- `vendor_id`
- `voucher`

## Matching backend route declarations

- GET `/products` → `products.access`; `ProductController::index`; `../isp-backend/routes/api.php:319`
- POST `/products` → `products.create`; `ProductController::store`; `../isp-backend/routes/api.php:320`
- GET `/products/{product}` → `products.show`; `ProductController::show`; `../isp-backend/routes/api.php:321`
- PUT `/products/{product}` → `products.edit`; `ProductController::update`; `../isp-backend/routes/api.php:322`
- DELETE `/products/{product}` → `products.delete`; `ProductController::destroy`; `../isp-backend/routes/api.php:323`
- GET `/products-in/reports` → `products-in.report`; `ProductInController::report`; `../isp-backend/routes/api.php:326`
- GET `/products-in/{product_id}` → `products-in.access`; `ProductInController::index`; `../isp-backend/routes/api.php:327`
- POST `/products-in` → `products-in.create`; `ProductInController::store`; `../isp-backend/routes/api.php:328`
- DELETE `/products-in/{productIn}` → `products-in.delete`; `ProductInController::destroy`; `../isp-backend/routes/api.php:329`
- GET `/products-out/reports` → `products-out.report`; `ProductOutController::report`; `../isp-backend/routes/api.php:332`
- GET `/products-out/{product_id}` → `products-out.access`; `ProductOutController::index`; `../isp-backend/routes/api.php:333`
- POST `/products-out` → `products-out.create`; `ProductOutController::store`; `../isp-backend/routes/api.php:334`
- DELETE `/products-out/{productOut}` → `products-out.delete`; `ProductOutController::destroy`; `../isp-backend/routes/api.php:335`
- GET `/products-in/{product}` → `products-in.show`; `ProductInController::show`; `../isp-backend/routes/api.php:337`
- DELETE `/products/{product}` → `products.delete`; `ProductController::destroy`; `../isp-backend/routes/api.php:338`
- GET `/get-product/{productId}` → `products.get.product`; `ProductController::getProduct`; `../isp-backend/routes/api.php:623`
- GET `/dropdown-vendors` → `dropdown.vendors`; `VendorController::dropdownList`; `../isp-backend/routes/api.php:701`
- GET `/dropdown-products` → `dropdown.products`; `ProductController::dropdownList`; `../isp-backend/routes/api.php:703`
- GET `/dropdown-funds` → `dropdown.funds`; `FundController::dropdownList`; `../isp-backend/routes/api.php:704`
- GET `/dropdown-clients` → `dropdown.clients`; `ClientController::dropdownList`; `../isp-backend/routes/api.php:706`
- GET `/dropdown-staffs` → `dropdown.staffs`; `StaffController::dropdownList`; `../isp-backend/routes/api.php:707`
- GET `/dropdown-expense-types` → `dropdown.expense.types`; `ExpenseTypeController::dropdownList`; `../isp-backend/routes/api.php:708`
- GET `/dropdown-unit-types` → `dropdown.unit.types`; `UnitTypeController::dropdownList`; `../isp-backend/routes/api.php:716`
- GET `/dropdown-product-categories` → `dropdown.product.categories`; `ProductCategoryController::dropdownList`; `../isp-backend/routes/api.php:717`
- GET `/product-in-serials/{productin_id}` → `dropdown.product.serial`; `ProductSerialController::productSerial`; `../isp-backend/routes/api.php:743`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ExpenseTypeController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FundController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ProductCategoryController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ProductController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ProductInController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ProductOutController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ProductSerialController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/UnitTypeController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/VendorController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/ClientController.php`
- `../isp-backend/app/Http/Requests/AddClientMapRequest.php`
- `../isp-backend/app/Http/Requests/BtrcClientReportRequest.php`
- `../isp-backend/app/Http/Requests/BtrcResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/ExpenseTypeRequest.php`
- `../isp-backend/app/Http/Requests/NewClientReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/ProductOutRequest.php`
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/RemoveStaffImageRequest.php`
- `../isp-backend/app/Http/Requests/ResetStaffPasswordRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundRequest.php`
- `../isp-backend/app/Http/Requests/StoreProductCategoryRequest.php`
- `../isp-backend/app/Http/Requests/StoreProductInRequest.php`
- `../isp-backend/app/Http/Requests/StoreProductRequest.php`
- `../isp-backend/app/Http/Requests/StoreStaffRequest.php`
- `../isp-backend/app/Http/Requests/StoreUnitTypeRequest.php`
- `../isp-backend/app/Http/Requests/StoreVendorRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundRequest.php`
- `../isp-backend/app/Http/Requests/UpdateProductCategoryRequest.php`
- `../isp-backend/app/Http/Requests/UpdateProductRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateUnitTypeRequest.php`
- `../isp-backend/app/Http/Requests/UpdateVendorRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientImageRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientPhotoRequest.php`
- `../isp-backend/app/Http/Requests/UploadStaffImageRequest.php`
- `../isp-backend/app/Http/Resources/ClientAccountResource.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/ClientDropdownResource.php`
- `../isp-backend/app/Http/Resources/ClientPaymentResource.php`
- `../isp-backend/app/Http/Resources/ClientProfileResource.php`
- `../isp-backend/app/Http/Resources/ClientResource.php`
- `../isp-backend/app/Http/Resources/DeviceMapResource.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeCollection.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeResource.php`
- `../isp-backend/app/Http/Resources/FundCollection.php`
- `../isp-backend/app/Http/Resources/FundResource.php`
- `../isp-backend/app/Http/Resources/ProductCategoryCollection.php`
- `../isp-backend/app/Http/Resources/ProductCategoryResource.php`
- `../isp-backend/app/Http/Resources/ProductCollection.php`
- `../isp-backend/app/Http/Resources/ProductDropdownResource.php`
- `../isp-backend/app/Http/Resources/ProductInCollection.php`
- `../isp-backend/app/Http/Resources/ProductInDropdownResource.php`
- `../isp-backend/app/Http/Resources/ProductInResource.php`
- `../isp-backend/app/Http/Resources/ProductOutCollection.php`
- `../isp-backend/app/Http/Resources/ProductResource.php`
- `../isp-backend/app/Http/Resources/StaffCollection.php`
- `../isp-backend/app/Http/Resources/StaffResource.php`
- `../isp-backend/app/Http/Resources/UnitTypeCollection.php`
- `../isp-backend/app/Http/Resources/UnitTypeResource.php`
- `../isp-backend/app/Http/Resources/VendorCollection.php`
- `../isp-backend/app/Http/Resources/VendorResource.php`
