# Playwright test structure

- `auth/` - one-time authentication setup that stores `storageState`
- `helpers/` - reusable auth utilities and shared route assertions
- `fixtures/` - reusable fixtures (authenticated test context)
- `integration/` - public route, auth API, and login flow integration tests
- `flows/` - authenticated end-to-end user journeys

## Projects

- `chromium` - default project that includes integration + flow tests
- `setup` - auth bootstrap project used as dependency
