import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

// Read only the keys needed by this suite; never log environment values or tokens.
const keys = /^(E2E_(CP|MK|APP)_(BASE_URL|USERNAME|PASSWORD)|NEXTAPI_URL)$/;
for (const file of [".env.e2e.tenants.local", ".env.e2e", ".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || !keys.test(match[1]) || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
}

export type TenantName = "cp" | "mk";
export function tenantCredentials(tenant: TenantName) {
  const prefix = `E2E_${tenant.toUpperCase()}`;
  const value = (suffix: string) => {
    const result = process.env[`${prefix}_${suffix}`];
    if (!result) throw new Error(`Missing ${prefix}_${suffix}; load local tenant credentials.`);
    return result;
  };
  const baseURL = value("BASE_URL");
  if (new URL(baseURL).hostname !== `${tenant}.isp.test`) {
    throw new Error(`Client suite requires the registered ${tenant}.isp.test host.`);
  }
  return { baseURL, username: value("USERNAME"), password: value("PASSWORD") };
}

export function backendURL() {
  const origin = process.env.NEXTAPI_URL;
  if (!origin) throw new Error("NEXTAPI_URL is required for independent backend verification.");
  return `${origin.replace(/\/$/, "")}/api/v1/`;
}

const IsolatedFixtureSchema = z.object({
  isolatedDatabase: z.literal(true),
  fakeRouterAndNotifications: z.literal(true),
  tenant: z.enum(["cp", "mk"]),
  network: z.object({ id: z.number().int().positive(), name: z.string().min(1) }),
  package: z.object({ id: z.number().int().positive(), name: z.string().min(1) }),
  clientPayload: z.record(z.unknown()),
});
export function isolatedFixtures(tenant: TenantName) {
  const file = process.env.E2E_CLIENT_FIXTURE_FILE;
  if (process.env.E2E_CLIENT_MUTATIONS !== "1" || !file) {
    throw new Error("Isolated client tests require E2E_CLIENT_MUTATIONS=1 and E2E_CLIENT_FIXTURE_FILE; no live router/customer mutations permitted.");
  }
  const fixture = IsolatedFixtureSchema.parse(JSON.parse(readFileSync(resolve(file), "utf8")));
  if (fixture.tenant !== tenant) throw new Error("Isolated fixture tenant differs from selected test tenant.");
  if ("company_id" in fixture.clientPayload || "reseller_id" in fixture.clientPayload) {
    throw new Error("Client fixtures must not select authorization scope through writable tenant IDs.");
  }
  return fixture;
}
