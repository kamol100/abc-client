import { describe, expect, it } from "vitest";
import { clientLoginUrl, resolveAuthGate, sessionExpiredPath } from "@/lib/auth/routes";

function gate(pathname: string, options?: { search?: string; isAuthenticated?: boolean; isPublicPath?: boolean }) {
  return resolveAuthGate({
    pathname,
    search: options?.search ?? "",
    isAuthenticated: options?.isAuthenticated ?? false,
    isPublicPath: options?.isPublicPath ?? false,
  });
}

describe("client login route", () => {
  it("serves the subscriber form at /login", () => {
    expect(gate("/login")).toEqual({ action: "next" });
    expect(gate("/login", { isAuthenticated: true })).toEqual({ action: "next" });
  });

  it("sends the old client login url to /login and keeps the query", () => {
    expect(gate("/client/login", { search: "?callbackUrl=%2Fclient%2Finvoices" })).toEqual({
      action: "redirect",
      pathname: "/login",
      search: "?callbackUrl=%2Fclient%2Finvoices",
    });
  });

  it("sends an anonymous client page to /login", () => {
    const params = new URLSearchParams();
    params.set("callbackUrl", "/client/invoices?status=due");

    expect(gate("/client/invoices", { search: "?status=due" })).toEqual({
      action: "redirect",
      pathname: "/login",
      search: `?${params.toString()}`,
    });
  });

  it("leaves a signed-in client inside the portal", () => {
    expect(gate("/client/dashboard", { isAuthenticated: true })).toEqual({ action: "next" });
  });
});

describe("staff auth routes", () => {
  it("keeps staff login on /admin", () => {
    expect(gate("/admin")).toEqual({ action: "next" });
    expect(gate("/admin", { isAuthenticated: true })).toEqual({
      action: "redirect",
      pathname: "/dashboard",
      search: "",
    });
  });

  it("sends an anonymous dashboard visit to /admin", () => {
    const params = new URLSearchParams();
    params.set("callbackUrl", "/dashboard");

    expect(gate("/dashboard")).toEqual({
      action: "redirect",
      pathname: "/admin",
      search: `?${params.toString()}`,
    });
  });

  it("does not send /login to the staff login", () => {
    expect(gate("/login")).not.toMatchObject({ pathname: "/admin" });
  });

  it("keeps public password reset pages open", () => {
    expect(gate("/forgot-password", { isPublicPath: true })).toEqual({ action: "next" });
    expect(gate("/reset-password", { isPublicPath: true })).toEqual({ action: "next" });
  });

  it("still protects other staff pages", () => {
    const params = new URLSearchParams();
    params.set("callbackUrl", "/clients");

    expect(gate("/clients")).toEqual({
      action: "redirect",
      pathname: "/admin",
      search: `?${params.toString()}`,
    });
  });
});

describe("clientLoginUrl", () => {
  it("keeps the company host instead of the AUTH_URL host", () => {
    expect(clientLoginUrl("http://vp.isp.test")).toBe("http://vp.isp.test/login");
    expect(clientLoginUrl("https://cp.isp.test")).toBe("https://cp.isp.test/login");
  });
});

describe("sessionExpiredPath", () => {
  it("returns the subscriber login for client expiry and staff login otherwise", () => {
    expect(sessionExpiredPath("/login")).toBe("/login");
    expect(sessionExpiredPath("/client/login")).toBe("/login");
    expect(sessionExpiredPath(null)).toBe("/admin");
    expect(sessionExpiredPath("/dashboard")).toBe("/admin");
  });
});
