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
  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «serves the subscriber form at /login»।
  it("Login and protected pages: serves the subscriber form at /login", () => {
    expect(gate("/login")).toEqual({ action: "next" });
    expect(gate("/login", { isAuthenticated: true })).toEqual({ action: "next" });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends the old client login url to /login and keeps the query»।
  it("Login and protected pages: sends the old client login url to /login and keeps the query", () => {
    expect(gate("/client/login", { search: "?callbackUrl=%2Fclient%2Finvoices" })).toEqual({
      action: "redirect",
      pathname: "/login",
      search: "?callbackUrl=%2Fclient%2Finvoices",
    });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends an anonymous client page to /login»।
  it("Login and protected pages: sends an anonymous client page to /login", () => {
    const params = new URLSearchParams();
    params.set("callbackUrl", "/client/invoices?status=due");

    expect(gate("/client/invoices", { search: "?status=due" })).toEqual({
      action: "redirect",
      pathname: "/login",
      search: `?${params.toString()}`,
    });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves a signed-in client inside the portal»।
  it("Login and protected pages: leaves a signed-in client inside the portal", () => {
    expect(gate("/client/dashboard", { isAuthenticated: true })).toEqual({ action: "next" });
  });
});

describe("staff auth routes", () => {
  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps staff login on /admin»।
  it("Login and protected pages: keeps staff login on /admin", () => {
    expect(gate("/admin")).toEqual({ action: "next" });
    expect(gate("/admin", { isAuthenticated: true })).toEqual({
      action: "redirect",
      pathname: "/dashboard",
      search: "",
    });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends an anonymous dashboard visit to /admin»।
  it("Login and protected pages: sends an anonymous dashboard visit to /admin", () => {
    const params = new URLSearchParams();
    params.set("callbackUrl", "/dashboard");

    expect(gate("/dashboard")).toEqual({
      action: "redirect",
      pathname: "/admin",
      search: `?${params.toString()}`,
    });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not send /login to the staff login»।
  it("Login and protected pages: does not send /login to the staff login", () => {
    expect(gate("/login")).not.toMatchObject({ pathname: "/admin" });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps public password reset pages open»।
  it("Login and protected pages: keeps public password reset pages open", () => {
    expect(gate("/forgot-password", { isPublicPath: true })).toEqual({ action: "next" });
    expect(gate("/reset-password", { isPublicPath: true })).toEqual({ action: "next" });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «still protects other staff pages»।
  it("Login and protected pages: still protects other staff pages", () => {
    const params = new URLSearchParams();
    params.set("callbackUrl", "/clients");

    expect(gate("/clients")).toEqual({
      action: "redirect",
      pathname: "/admin",
      search: `?${params.toString()}`,
    });
  });
});

describe("home page", () => {
  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends a signed-in visitor from / and /home to the dashboard»।
  it("Login and protected pages: sends a signed-in visitor from / and /home to the dashboard", () => {
    const dashboard = { action: "redirect", pathname: "/dashboard", search: "" };

    expect(gate("/", { isAuthenticated: true, isPublicPath: true })).toEqual(dashboard);
    expect(gate("/home", { isAuthenticated: true, isPublicPath: true })).toEqual(dashboard);
    expect(gate("/home/", { isAuthenticated: true, isPublicPath: true })).toEqual(dashboard);
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves an anonymous visitor on the home page»।
  it("Login and protected pages: leaves an anonymous visitor on the home page", () => {
    expect(gate("/", { isPublicPath: true })).toEqual({ action: "next" });
    expect(gate("/home", { isPublicPath: true })).toEqual({ action: "next" });
  });

  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not redirect other public pages when the session is still active»।
  it("Login and protected pages: does not redirect other public pages when the session is still active", () => {
    expect(gate("/features", { isAuthenticated: true, isPublicPath: true })).toEqual({ action: "next" });
    expect(gate("/pricing", { isAuthenticated: true, isPublicPath: true })).toEqual({ action: "next" });
    expect(gate("/demo-request", { isAuthenticated: true, isPublicPath: true })).toEqual({ action: "next" });
    expect(gate("/pay", { isAuthenticated: true, isPublicPath: true })).toEqual({ action: "next" });
    expect(gate("/home/pricing", { isAuthenticated: true, isPublicPath: true })).toEqual({ action: "next" });
  });
});

describe("clientLoginUrl", () => {
  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the company host instead of the AUTH_URL host»।
  it("Login and protected pages: keeps the company host instead of the AUTH_URL host", () => {
    expect(clientLoginUrl("http://vp.isp.test")).toBe("http://vp.isp.test/login");
    expect(clientLoginUrl("https://cp.isp.test")).toBe("https://cp.isp.test/login");
  });
});

describe("sessionExpiredPath", () => {
  // লগইন ও প্রবেশাধিকার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns the subscriber login for client expiry and staff login otherwise»।
  it("Login and protected pages: returns the subscriber login for client expiry and staff login otherwise", () => {
    expect(sessionExpiredPath("/login")).toBe("/login");
    expect(sessionExpiredPath("/client/login")).toBe("/login");
    expect(sessionExpiredPath(null)).toBe("/admin");
    expect(sessionExpiredPath("/dashboard")).toBe("/admin");
  });
});
