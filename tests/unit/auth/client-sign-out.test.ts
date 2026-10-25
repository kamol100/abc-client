import { beforeEach, describe, expect, it, vi } from "vitest";
import { signOutClient } from "@/lib/auth/client-sign-out";

const signOutMock = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

describe("signOutClient", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    signOutMock.mockResolvedValue({ url: "http://isp.test/login" });
    vi.stubGlobal("location", {
      origin: "http://vp.isp.test",
      assign: vi.fn(),
    });
  });

  it("clears the session and stays on the current host", async () => {
    await signOutClient();

    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(window.location.assign).toHaveBeenCalledWith("http://vp.isp.test/login");
  });
});
