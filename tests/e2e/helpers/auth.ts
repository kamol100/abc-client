import { expect, type APIRequestContext, type Page } from "@playwright/test";

type LoginOverrides = Partial<{
  host: string;
  username: string;
  password: string;
}>;

type BackendAuthResponse = {
  success?: boolean;
  token?: string;
  message?: string;
};

export const backendBaseUrl =
  process.env.PLAYWRIGHT_BACKEND_BASE_URL ?? "http://localhost:8000";

export const authPayload = {
  host: process.env.PLAYWRIGHT_AUTH_HOST ?? "localhost",
  username: process.env.PLAYWRIGHT_AUTH_USERNAME ?? "kamol",
  password: process.env.PLAYWRIGHT_AUTH_PASSWORD ?? "12345678",
};

export const authenticatedStorageStatePath = "playwright/.auth/user.json";

export function buildAuthPayload(
  overrides: LoginOverrides = {},
): typeof authPayload {
  return {
    ...authPayload,
    ...overrides,
  };
}

export function buildAdminLoginUrl(callbackUrl = "/dashboard"): string {
  const encoded = encodeURIComponent(callbackUrl);
  return `/admin?callbackUrl=${encoded}`;
}

export async function loginFromUI(
  page: Page,
  options: {
    callbackUrl?: string;
    credentials?: LoginOverrides;
  } = {},
) {
  const credentials = buildAuthPayload(options.credentials);
  const callbackUrl = options.callbackUrl ?? "/dashboard";

  await page.goto(buildAdminLoginUrl(callbackUrl));
  await page.locator("#username").fill(credentials.username);
  await page.locator("#password").fill(credentials.password);
  await page.locator("button[type='submit']").click();
}

export async function expectLoginSuccessRedirect(
  page: Page,
  expectedPath: string,
) {
  const expectedPattern = new RegExp(
    `${expectedPath.replace("/", "\\/")}(\\?.*)?$`,
  );
  await expect(page).toHaveURL(expectedPattern, { timeout: 30000 });
  const currentUrl = new URL(page.url());
  expect(currentUrl.searchParams.has("error")).toBeFalsy();
}

export async function expectRedirectToLoginWithCallback(
  page: Page,
  callbackPath: string,
) {
  await page.waitForURL((url) => url.pathname === "/admin", { timeout: 15000 });
  const currentUrl = new URL(page.url());
  expect(currentUrl.pathname).toBe("/admin");
  expect(currentUrl.searchParams.get("callbackUrl")).toBe(callbackPath);
}

export async function callBackendLoginApi(
  request: APIRequestContext,
  overrides: LoginOverrides = {},
) {
  const payload = buildAuthPayload(overrides);
  const loginUrl = `${backendBaseUrl}/api/v1/auth/login?host=${encodeURIComponent(
    payload.host,
  )}`;

  return request.post(loginUrl, {
    data: payload,
    headers: {
      "Content-type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });
}

export async function getBackendAccessToken(
  request: APIRequestContext,
  overrides: LoginOverrides = {},
): Promise<string> {
  const response = await callBackendLoginApi(request, overrides);
  const body = (await response.json()) as BackendAuthResponse;

  if (!response.ok() || !body.token) {
    throw new Error(
      `Unable to authenticate against backend API. status=${response.status()}`,
    );
  }

  return body.token;
}
