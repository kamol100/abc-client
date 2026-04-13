import { expect, test } from "@playwright/test";

import {
  authPayload,
  buildAuthPayload,
  callBackendLoginApi,
} from "@/tests/e2e/helpers/auth";

type BackendLoginResponse = {
  success?: boolean;
  token?: string;
  message?: string;
};

test.describe("Backend auth API integration", () => {
  test("authenticates with valid credentials", async ({ request }) => {
    const response = await callBackendLoginApi(request, authPayload);
    const body = (await response.json()) as BackendLoginResponse;

    expect(response.ok()).toBeTruthy();
    expect(body.success ?? Boolean(body.token)).toBeTruthy();
    expect(typeof body.token).toBe("string");
    expect(body.token?.length ?? 0).toBeGreaterThan(10);
  });

  test("rejects invalid credentials", async ({ request }) => {
    const response = await callBackendLoginApi(
      request,
      buildAuthPayload({ password: "wrong-password" }),
    );
    const body = (await response.json()) as BackendLoginResponse;

    expect([200, 401, 403, 422]).toContain(response.status());
    expect(Boolean(body.token)).toBeFalsy();
    expect(body.success ?? false).toBeFalsy();
  });
});
