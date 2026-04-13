import { mkdirSync } from "node:fs";
import path from "node:path";
import { test as setup } from "@playwright/test";

import {
  authenticatedStorageStatePath,
  expectLoginSuccessRedirect,
  loginFromUI,
} from "@/tests/e2e/helpers/auth";

setup("authenticate and persist storage state", async ({ page, context }) => {
  await loginFromUI(page, {
    callbackUrl: "/dashboard",
  });
  await expectLoginSuccessRedirect(page, "/dashboard");

  mkdirSync(path.dirname(authenticatedStorageStatePath), { recursive: true });
  await context.storageState({ path: authenticatedStorageStatePath });
});
