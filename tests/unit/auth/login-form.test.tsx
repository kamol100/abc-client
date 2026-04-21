import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/login/login-form";

const searchParamState = new Map<string, string | null>();
const signInMock = vi.fn();
const toastMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => searchParamState.get(key) ?? null,
  }),
}));

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    searchParamState.clear();
    signInMock.mockReset();
    toastMock.mockReset();
  });

  it("renders the credential fields", async () => {
    render(<LoginForm />);

    expect(await screen.findByText("login.title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("login.username.placeholder")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("login.password.placeholder")).toBeInTheDocument();
  });

  it("submits credentials through next-auth signIn", async () => {
    const user = userEvent.setup();
    searchParamState.set("callbackUrl", "/tickets");
    signInMock.mockResolvedValueOnce({});

    render(<LoginForm />);

    await screen.findByText("login.title");
    await user.type(screen.getByPlaceholderText("login.username.placeholder"), "admin");
    await user.type(screen.getByPlaceholderText("login.password.placeholder"), "secret12");
    await user.click(screen.getByRole("button", { name: "login.submit" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          api: "/auth/login",
          username: "admin",
          password: "secret12",
          host: "localhost",
          redirect: false,
          redirectTo: "/tickets",
        })
      );
    });
  });

  it("shows invalid credentials toast from auth error query", async () => {
    searchParamState.set("error", "CredentialsSignin");

    render(<LoginForm />);

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: "login.errors.invalid_credentials",
        variant: "destructive",
      });
    });
  });
});

