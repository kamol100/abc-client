import { test as base, expect } from "@playwright/test";

import { authenticatedStorageStatePath } from "@/tests/e2e/helpers/auth";

export const test = base.extend({
  storageState: authenticatedStorageStatePath,
});

export { expect };
