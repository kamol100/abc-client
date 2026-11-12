# Source evidence — client-wallets

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/client-wallets/page.tsx`
- `components/wallets/my-wallet.tsx`
- `components/wallets/reseller-recharge-cost.ts`
- `components/wallets/reseller-recharge.tsx`
- `components/wallets/transaction-modal.tsx`
- `components/wallets/transactions-column.tsx`
- `components/wallets/transactions-table.tsx`
- `components/wallets/wallet-column.tsx`
- `components/wallets/wallet-form-schema.ts`
- `components/wallets/wallet-table.tsx`
- `components/wallets/wallet-transaction.tsx`
- `components/wallets/wallet-type.ts`

## Observed permission checks

- `wallets.access`
- `wallets.my`

## Observed API templates (not validated endpoints)

- `/bkash-balance-recharge/create`
- `/bkash-balance-recharge/execute`
- `/client-wallet-recharge`
- `/dropdown-clients`
- `client-wallet`
- `clients/${clientId}`
- `wallets/${resolvedWalletId}/wallet-transactions`

## Observed form/config field names

- `balance`
- `client_id`
- `note`

## Matching backend route declarations

- GET `/clients` → `clients.access`; `ClientController::index`; `../isp-backend/routes/api.php:215`
- GET `/client-next-sid` → `clients.next-sid`; `ClientController::nextSid`; `../isp-backend/routes/api.php:216`
- GET `/client-maps` → `clients.map`; `ClientController::getClientMaps`; `../isp-backend/routes/api.php:217`
- GET `/clients/{client}` → `clients.show`; `ClientController::show`; `../isp-backend/routes/api.php:218`
- GET `/clients/{client}/sms-status` → `clients.sms-status`; `ClientController::smsStatus`; `../isp-backend/routes/api.php:219`
- POST `/clients` → `clients.create`; `ClientController::store`; `../isp-backend/routes/api.php:220`
- PUT `/clients/{client}` → `clients.edit`; `ClientController::update`; `../isp-backend/routes/api.php:221`
- POST `/clients/{client}/add-client-map` → `clients.map.add`; `ClientController::addClientMap`; `../isp-backend/routes/api.php:222`
- PUT `/client-status/{client}` → `clients.status`; `ClientController::updateClientStatus`; `../isp-backend/routes/api.php:232`
- DELETE `/clients/{client}` → `clients.delete`; `ClientController::destroy`; `../isp-backend/routes/api.php:233`
- GET `/clients/{client}/netactive` → `clients.active`; `ClientController::mikrotikActive`; `../isp-backend/routes/api.php:237`
- GET `/wallets` → `wallets.access`; `WalletsController::index`; `../isp-backend/routes/api.php:422`
- GET `/my-wallet` → `wallets.my`; `WalletsController::myWallet`; `../isp-backend/routes/api.php:423`
- GET `/client-wallet` → `wallets.client`; `WalletsController::clientWallet`; `../isp-backend/routes/api.php:424`
- POST `/wallets` → `wallets.create`; `WalletsController::store`; `../isp-backend/routes/api.php:425`
- GET `/wallets/{wallet}` → `wallets.show`; `WalletsController::show`; `../isp-backend/routes/api.php:426`
- PUT `/wallets/{uuid}` → `wallets.edit`; `WalletsController::update`; `../isp-backend/routes/api.php:427`
- DELETE `/wallets/{wallet}` → `wallets.delete`; `WalletsController::destroy`; `../isp-backend/routes/api.php:428`
- GET `/wallets/{wallet}/transactions` → `wallet-transactions.by-wallet`; `WalletTransactionController::getWalletTransactions`; `../isp-backend/routes/api.php:494`
- GET `/wallets/{wallet}/wallet-transactions` → `wallets.transactions`; `WalletsController::walletTransaction`; `../isp-backend/routes/api.php:622`
- PUT `/clients/{client}/lock` → `clients.lock`; `ClientController::lock`; `../isp-backend/routes/api.php:650`
- GET `/clients/{client}/{period?}` → `clients.graph`; `ClientController::clientGraph`; `../isp-backend/routes/api.php:651`
- GET `/client-router-info/{client}` → `clients.router.info`; `ClientController::routerInfo`; `../isp-backend/routes/api.php:652`
- GET `/client-usage/{client}` → `clients.usage`; `ClientController::usage`; `../isp-backend/routes/api.php:653`
- GET `/client-ping/{client}` → `clients.ping`; `ClientController::pingIp`; `../isp-backend/routes/api.php:654`
- GET `/clients-speed/{client}` → `clients.speed`; `ClientController::getClientUpDownSpeed`; `../isp-backend/routes/api.php:655`
- PUT `/clients-change-package/{client}` → `clients.change.package`; `ClientController::changeClientPackage`; `../isp-backend/routes/api.php:656`
- GET `/clients-history/{client}` → `clients.history`; `HistoryController::clientHistory`; `../isp-backend/routes/api.php:657`
- GET `/dropdown-clients` → `dropdown.clients`; `ClientController::dropdownList`; `../isp-backend/routes/api.php:706`
- POST `/bkash-balance-recharge/create` → `bkash-balance-recharge.create`; `BkashBalanceRechargeController::create`; `../isp-backend/routes/api.php:757`
- POST `/bkash-balance-recharge/execute` → `bkash-balance-recharge.execute`; `BkashBalanceRechargeController::execute`; `../isp-backend/routes/api.php:758`
- POST `/client-wallet-recharge` → `client-wallet.recharge`; `WalletsController::clientWalletRecharge`; `../isp-backend/routes/api.php:759`
- POST `/auth/client` → `clients.login`; `AuthController::login`; `../isp-backend/routes/client.php:22`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/BkashBalanceRechargeController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/HistoryController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/WalletTransactionController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/WalletsController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/ClientController.php`
- `../isp-backend/app/Http/Requests/AddClientMapRequest.php`
- `../isp-backend/app/Http/Requests/BtrcClientReportRequest.php`
- `../isp-backend/app/Http/Requests/BtrcResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/ChangePasswordRequest.php`
- `../isp-backend/app/Http/Requests/ChangeUsernameRequest.php`
- `../isp-backend/app/Http/Requests/ClientLoginRequest.php`
- `../isp-backend/app/Http/Requests/ClientWalletRecharge.php`
- `../isp-backend/app/Http/Requests/LoginRequest.php`
- `../isp-backend/app/Http/Requests/NewClientReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/ResellerWalletRechargeRequest.php`
- `../isp-backend/app/Http/Requests/SignupRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/StoreWalletTransactionRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateWalletsRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientImageRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientPhotoRequest.php`
- `../isp-backend/app/Http/Resources/AuthResource.php`
- `../isp-backend/app/Http/Resources/ClientAccountResource.php`
- `../isp-backend/app/Http/Resources/ClientAuthResource.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/ClientDropdownResource.php`
- `../isp-backend/app/Http/Resources/ClientPaymentResource.php`
- `../isp-backend/app/Http/Resources/ClientProfileResource.php`
- `../isp-backend/app/Http/Resources/ClientResource.php`
- `../isp-backend/app/Http/Resources/DeviceMapResource.php`
- `../isp-backend/app/Http/Resources/HistoryCollection.php`
- `../isp-backend/app/Http/Resources/PaymentCollection.php`
- `../isp-backend/app/Http/Resources/WalletCollection.php`
- `../isp-backend/app/Http/Resources/WalletResource.php`
- `../isp-backend/app/Http/Resources/WalletTransactionCollection.php`
- `../isp-backend/app/Http/Resources/WalletTransactionResource.php`
