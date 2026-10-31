import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useFetch } from "@/app/actions";
import SmsSentForm from "@/components/sms-sent/sms-sent-form";

vi.mock("@/app/actions", () => ({
  useFetch: vi.fn(),
  getData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/sms-send",
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

type FetchArgs = Parameters<typeof useFetch>[0];

let resolveStore: (value: unknown) => void = () => undefined;

vi.mocked(useFetch).mockImplementation(async ({ url }: FetchArgs) => {
  if (url === "/sms-store/preview") {
    return {
      success: true,
      data: {
        recipients: 1,
        total_units: 1,
        total_cost: 1,
        balance: 100,
        remaining_balance: 99,
        sufficient: true,
        scheduled_at: null,
        timezone: "Asia/Dhaka",
      },
    };
  }
  if (url === "/sms-store") {
    return new Promise((resolve) => {
      resolveStore = resolve;
    });
  }
  if (url.startsWith("/sms-rate")) return { success: true, data: { rate: 1 } };
  if (url === "/dropdown-sms-templates") {
    return {
      success: true,
      data: [
        { id: 1, name: "Invoice due", message: "Due", template_type: "invoice_due" },
        { id: 2, name: "Custom Other", message: "Hello", template_type: "custom_other" },
      ],
    };
  }
  if (url === "/sms-template/1") {
    return {
      success: true,
      data: { id: 1, name: "Invoice due", message: "Due", template_type: "invoice_due" },
    };
  }
  if (url === "/sms-template/2") {
    return {
      success: true,
      data: { id: 2, name: "Custom Other", message: "Hello", template_type: "custom_other" },
    };
  }
  return { success: true, data: [] };
});

const storeCalls = () =>
  vi.mocked(useFetch).mock.calls.filter(([args]) => (args as FetchArgs).url === "/sms-store");

const phoneField = () => screen.queryByPlaceholderText("sms_sent.phone_number.placeholder");

const phoneFieldIsHidden = () => phoneField()?.closest("[aria-hidden='true']") != null;

describe("SmsSentForm confirmation", () => {
  it("shows the template hint instead of the phone field until Custom Other is selected", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SmsSentForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole("note")).toHaveTextContent("sms_sent.phone_number.hint");
    expect(phoneFieldIsHidden()).toBe(true);
  });

  it("shows the phone field only for Custom Other and the hint for a regular template", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SmsSentForm mode="singleClient" clientId="client-1" phone="01700000000" />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("combobox", { hidden: true }));
    await user.click(await screen.findByText("Custom Other"));

    await waitFor(() => expect(phoneFieldIsHidden()).toBe(false));
    expect(screen.queryByRole("note")).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { hidden: true }));
    await user.click(await screen.findByText("Invoice due"));

    await waitFor(() => expect(phoneFieldIsHidden()).toBe(true));
    expect(screen.getByRole("note")).toHaveTextContent("sms_sent.phone_number.hint");
  });

  it("opens the confirmation dialog first and sends once after confirming", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SmsSentForm phone="01700000000" />
      </QueryClientProvider>
    );

    await user.type(screen.getByPlaceholderText("sms_sent.sms_body.placeholder"), "Hello");
    await user.click(screen.getByRole("button", { name: "sms_sent.send" }));

    const confirm = await screen.findByRole("button", { name: /sms_sent.confirm.submit/ });
    expect(storeCalls()).toHaveLength(0);

    await waitFor(() => expect(confirm).toBeEnabled());
    await user.click(confirm);
    await waitFor(() => expect(confirm).toBeDisabled());
    await user.click(confirm);

    expect(storeCalls()).toHaveLength(1);
    expect((storeCalls()[0][0] as FetchArgs).data).toMatchObject({
      phone: "01700000000",
      message: "Hello",
      mode: "live",
      send_now: false,
    });

    resolveStore({ success: true, data: { message: "queued" } });
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /sms_sent.confirm.submit/ })).not.toBeInTheDocument()
    );
  });
});
