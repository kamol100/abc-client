# Network test workspace

Start with [NETWORK-001](NETWORK-001-network-management.md) and [implementation status](IMPLEMENTATION.md).

Specs live in `tests/e2e/networks/`: `list.spec.ts`, `forms.spec.ts`, `connection.spec.ts`, `access.spec.ts`, and `dependencies.spec.ts`.

```sh
npm run test:e2e:networks
E2E_TENANT=mk npm run test:e2e:networks
```

The list endpoint does not apply name, address, or status filters. Those checks fail until it does. Do not open the page for an active network that is outside the local MikroTik simulator.
