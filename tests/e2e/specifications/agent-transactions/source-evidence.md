# Source evidence — agent-transactions

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/agent-transactions/page.tsx`
- `components/agent-transactions/agent-transaction-column.tsx`
- `components/agent-transactions/agent-transaction-filter-schema.ts`
- `components/agent-transactions/agent-transaction-form-schema.ts`
- `components/agent-transactions/agent-transaction-form.tsx`
- `components/agent-transactions/agent-transaction-table.tsx`
- `components/agent-transactions/agent-transaction-type.ts`

## Observed permission checks

- `agent-transactions.create`

## Observed API templates (not validated endpoints)

- `/agent-transactions/${agentId}`
- `/dropdown-agents`

## Observed form/config field names

- `agent_id`
- `amount`
- `created_at`
- `description`
- `transaction_type`

## Matching backend route declarations

- GET `/agent-transactions` → `agent-transactions.access`; `AgentTransactionController::index`; `../isp-backend/routes/api.php:353`
- GET `/agent-transactions/{agent}` → `agent-transactions.show`; `AgentTransactionController::show`; `../isp-backend/routes/api.php:354`
- POST `/agent-transactions/{agent}` → `agent-transactions.create`; `AgentTransactionController::store`; `../isp-backend/routes/api.php:355`
- GET `/dropdown-agents` → `dropdown.agents`; `AgentController::dropdownList`; `../isp-backend/routes/api.php:702`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/AgentController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/AgentTransactionController.php`
- `../isp-backend/app/Http/Requests/StoreAgentRequest.php`
- `../isp-backend/app/Http/Requests/StoreAgentTransactionRequest.php`
- `../isp-backend/app/Http/Requests/UpdateAgentRequest.php`
- `../isp-backend/app/Http/Resources/AgentCollection.php`
- `../isp-backend/app/Http/Resources/AgentResource.php`
- `../isp-backend/app/Http/Resources/AgentTransactionCollection.php`
- `../isp-backend/app/Http/Resources/AgentTransactionResource.php`
