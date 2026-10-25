import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClientLoginForm } from "@/components/client-area/login-form";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("ClientLoginForm", () => {
  it("shows the company name on the divider when it is set", async () => {
    render(<ClientLoginForm companyName="Acme ISP" />);

    expect(await screen.findByText("Acme ISP")).toBeInTheDocument();
  });

  it("falls back to the credentials label when the company name is empty", async () => {
    render(<ClientLoginForm companyName="   " />);

    expect(await screen.findByText("login.continue_with_credentials")).toBeInTheDocument();
  });

  it("shows the company logo and a back link to the home page", async () => {
    render(<ClientLoginForm companyLogoUrl="https://cdn.example/logo.png" companyName="Acme ISP" />);

    const logo = await screen.findByRole("img", { name: "Company logo" });
    expect(logo).toHaveAttribute("src", "https://cdn.example/logo.png");

    const back = await screen.findByRole("link", { name: "client_login.back" });
    expect(back).toHaveAttribute("href", "/home");
    expect(back.querySelector("svg")).toBeInTheDocument();

    const login = screen.getByRole("button", { name: "client_login.submit" });
    expect(login.querySelector("svg")).toBeInTheDocument();
  });
});
