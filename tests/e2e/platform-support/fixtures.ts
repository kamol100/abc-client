import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test as base, expect } from "@playwright/test";
import { z } from "zod";
import { authenticate, requirePermissions, type Session } from "@/tests/e2e/support-tickets/fixtures";

const selected = process.env.E2E_TENANT === "mk" ? "mk" : "cp";

const DisposableSchema = z.object({
  isolatedDatabase: z.literal(true),
  disposableDatabase: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  syntheticImagesOnly: z.literal(true),
  containsCustomerData: z.literal(false),
});

export function loadDisposableSupportFixture() {
  const file = process.env.E2E_PLATFORM_SUPPORT_FIXTURE_FILE;
  if (process.env.E2E_PLATFORM_SUPPORT_DISPOSABLE !== "1" || !file) {
    throw new Error(
      "Platform-support thread and image mutations require E2E_PLATFORM_SUPPORT_DISPOSABLE=1 and E2E_PLATFORM_SUPPORT_FIXTURE_FILE. The file must name a database created for this run. This suite does not create that database.",
    );
  }
  if (!existsSync(file)) {
    throw new Error("E2E_PLATFORM_SUPPORT_FIXTURE_FILE does not exist.");
  }
  const fixture = DisposableSchema.parse(JSON.parse(readFileSync(resolve(file), "utf8")));
  return fixture;
}

export const test = base.extend<{}, { staff: Session }>({
  staff: [async ({ browser }, use) => {
    const session = await authenticate(browser, selected);
    try {
      await use(session);
    } finally {
      await session.dispose();
    }
  }, { scope: "worker" }],
  storageState: async ({ staff }, use) => {
    await use(staff.state);
  },
});

export { expect, requirePermissions };
export type { Session };
