# Source evidence — agents

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/agents/page.tsx`
- `components/agents/agent-column.tsx`
- `components/agents/agent-filter-schema.ts`
- `components/agents/agent-form-schema.ts`
- `components/agents/agent-form.tsx`
- `components/agents/agent-table.tsx`
- `components/agents/agent-type.ts`

## Observed permission checks

- `agent-transactions.create`
- `agent-transactions.show`
- `agents.create`
- `agents.delete`
- `agents.edit`

## Observed API templates (not validated endpoints)

- `/agents`
- `agents`

## Observed form/config field names

- `commission`
- `name`
- `note`
- `phone`
- `status`

## Matching backend route declarations

- GET `/agents` → `agents.access`; `AgentController::index`; `../isp-backend/routes/api.php:348`
- POST `/agents` → `agents.create`; `AgentController::store`; `../isp-backend/routes/api.php:349`
- GET `/agents/{agent}` → `agents.show`; `AgentController::show`; `../isp-backend/routes/api.php:350`
- PUT `/agents/{agent}` → `agents.edit`; `AgentController::update`; `../isp-backend/routes/api.php:351`
- DELETE `/agents/{agent}` → `agents.delete`; `AgentController::destroy`; `../isp-backend/routes/api.php:352`
- GET `/agent-transactions` → `agent-transactions.access`; `AgentTransactionController::index`; `../isp-backend/routes/api.php:353`
- GET `/agent-transactions/{agent}` → `agent-transactions.show`; `AgentTransactionController::show`; `../isp-backend/routes/api.php:354`
- POST `/agent-transactions/{agent}` → `agent-transactions.create`; `AgentTransactionController::store`; `../isp-backend/routes/api.php:355`

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
