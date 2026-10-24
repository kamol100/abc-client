import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm, ResetPasswordForm } from "@/components/login/password-reset-forms";
import { isPublicPathname } from "@/lib/auth/public-routes";
import {
  EMAIL_NOT_FOUND_MESSAGE,
  publicApiMessage,
} from "@/lib/auth/password-reset";

const searchParamState = new Map<string, string | null>();
const { postPublicDataMock } = vi.hoisted(() => ({
  postPublicDataMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => searchParamState.get(key) ?? null,
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

vi.mock("@/lib/api/api", () => ({
  postPublicData: (...args: unknown[]) => postPublicDataMock(...args),
}));

describe("password reset routes", () => {
  it("keeps the forgot and reset pages public", () => {
    expect(isPublicPathname("/forgot-password")).toBe(true);
    expect(isPublicPathname("/reset-password")).toBe(true);
    expect(isPublicPathname("/dashboard")).toBe(false);
  });
});

describe("publicApiMessage", () => {
  it("reads the email-not-found error exactly", () => {
    expect(publicApiMessage({ error: EMAIL_NOT_FOUND_MESSAGE }, "fallback")).toBe(
      EMAIL_NOT_FOUND_MESSAGE
    );
  });
});

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    postPublicDataMock.mockReset();
  });

  it("validates the email before calling the api", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.click(screen.getByRole("button", { name: "password_reset.submit_forgot" }));
    expect(await screen.findByText("password_reset.email.errors.required")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("password_reset.email.placeholder"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "password_reset.submit_forgot" }));
    expect(await screen.findByText("password_reset.email.errors.invalid")).toBeInTheDocument();
    expect(postPublicDataMock).not.toHaveBeenCalled();
  });

  it("submits the email and host, then shows the confirmation", async () => {
    const user = userEvent.setup();
    postPublicDataMock.mockResolvedValueOnce({
      success: true,
      data: "A link to reset your password has been sent to your email.",
    });

    render(<ForgotPasswordForm />);
    await user.type(screen.getByPlaceholderText("password_reset.email.placeholder"), "user@resetco.test");
    await user.click(screen.getByRole("button", { name: "password_reset.submit_forgot" }));

    await waitFor(() => {
      expect(postPublicDataMock).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "user@resetco.test",
        host: "localhost",
      });
    });
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("A link to reset your password has been sent to your email.");
    expect(status).toHaveClass("text-green-600");
    expect(status.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "password_reset.back_to_login" })).toHaveAttribute(
      "href",
      "/admin"
    );
  });

  it("shows the email-not-found message from the api", async () => {
    const user = userEvent.setup();
    postPublicDataMock.mockResolvedValueOnce({
      success: false,
      error: EMAIL_NOT_FOUND_MESSAGE,
    });

    render(<ForgotPasswordForm />);
    await user.type(screen.getByPlaceholderText("password_reset.email.placeholder"), "missing@example.com");
    await user.click(screen.getByRole("button", { name: "password_reset.submit_forgot" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(EMAIL_NOT_FOUND_MESSAGE);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("disables the submit button while the request is in flight", async () => {
    const user = userEvent.setup();
    let release: (value: unknown) => void = () => undefined;
    postPublicDataMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        })
    );

    render(<ForgotPasswordForm />);
    await user.type(screen.getByPlaceholderText("password_reset.email.placeholder"), "user@resetco.test");
    const button = screen.getByRole("button", { name: "password_reset.submit_forgot" });
    const pending = user.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    await user.click(button);
    expect(postPublicDataMock).toHaveBeenCalledTimes(1);

    release({ success: true, data: "sent" });
    await pending;
  });
});

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    searchParamState.clear();
    postPublicDataMock.mockReset();
  });

  it("explains an incomplete link without showing the token", () => {
    searchParamState.set("token", "super-secret-token");

    render(<ResetPasswordForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("password_reset.errors.incomplete_link");
    expect(screen.queryByText("super-secret-token")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "password_reset.request_again" })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it("requires the confirmation to match before submit", async () => {
    const user = userEvent.setup();
    searchParamState.set("token", "reset-token");
    searchParamState.set("email", "user@resetco.test");

    render(<ResetPasswordForm />);
    await user.type(screen.getByPlaceholderText("password_reset.password.placeholder"), "new-secret-pass");
    await user.type(
      screen.getByPlaceholderText("password_reset.password_confirmation.placeholder"),
      "different-pass"
    );
    await user.click(screen.getByRole("button", { name: "password_reset.submit_reset" }));

    expect(await screen.findByText("password_reset.password.errors.mismatch")).toBeInTheDocument();
    expect(postPublicDataMock).not.toHaveBeenCalled();
  });

  it("submits the token and shows a login link after success", async () => {
    const user = userEvent.setup();
    searchParamState.set("token", "reset-token");
    searchParamState.set("email", "user@resetco.test");
    postPublicDataMock.mockResolvedValueOnce({
      success: true,
      data: "Your password has been reset successfully.",
    });

    render(<ResetPasswordForm />);
    await user.type(screen.getByPlaceholderText("password_reset.password.placeholder"), "new-secret-pass");
    await user.type(
      screen.getByPlaceholderText("password_reset.password_confirmation.placeholder"),
      "new-secret-pass"
    );
    await user.click(screen.getByRole("button", { name: "password_reset.submit_reset" }));

    await waitFor(() => {
      expect(postPublicDataMock).toHaveBeenCalledWith("/auth/reset-password", {
        token: "reset-token",
        email: "user@resetco.test",
        password: "new-secret-pass",
        password_confirmation: "new-secret-pass",
        host: "localhost",
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Your password has been reset successfully."
    );
    expect(screen.getByRole("link", { name: "password_reset.back_to_login" })).toHaveAttribute(
      "href",
      "/admin"
    );
  });

  it("shows an invalid token error and a link to request another email", async () => {
    const user = userEvent.setup();
    searchParamState.set("token", "expired-token");
    searchParamState.set("email", "user@resetco.test");
    postPublicDataMock.mockResolvedValueOnce({
      success: false,
      error: "This password reset link is invalid or has expired. Please request a new one.",
    });

    render(<ResetPasswordForm />);
    await user.type(screen.getByPlaceholderText("password_reset.password.placeholder"), "new-secret-pass");
    await user.type(
      screen.getByPlaceholderText("password_reset.password_confirmation.placeholder"),
      "new-secret-pass"
    );
    await user.click(screen.getByRole("button", { name: "password_reset.submit_reset" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This password reset link is invalid or has expired. Please request a new one."
    );
    expect(screen.queryByText("expired-token")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "password_reset.request_again" })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });
});
