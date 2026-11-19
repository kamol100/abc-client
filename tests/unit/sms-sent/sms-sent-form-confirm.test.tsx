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

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({ hasPermission: () => false }),
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
  if (url.startsWith("/sms-gateway")) {
    return {
      success: true,
      data: {
        configured: true,
        provider: "isptik",
        status: "active",
        name: null,
        masked_send_url: null,
        masked_balance_url: null,
        rate: 1,
        billing_mode: "wallet",
        platform_rate: 1,
        wallet_required: true,
      },
    };
  }
  if (url === "/dropdown-sms-templates") {
    return {
      success: true,
      data: [
        { id: 1, name: "Invoice due", message: "Due", template_type: "invoice_due" },
        { id: 2, name: "Custom Other", message: "Hello", template_type: "custom_other" },
        { id: 3, name: "Custom Client", message: "Notice", template_type: "custom_client" },
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
  if (url === "/sms-template/3") {
    return {
      success: true,
      data: { id: 3, name: "Custom Client", message: "Notice", template_type: "custom_client" },
    };
  }
  return { success: true, data: [] };
});

const storeCalls = () =>
  vi.mocked(useFetch).mock.calls.filter(([args]) => (args as FetchArgs).url === "/sms-store");

const previewCalls = () =>
  vi.mocked(useFetch).mock.calls.filter(([args]) => (args as FetchArgs).url === "/sms-store/preview");

const phoneField = () => screen.queryByPlaceholderText("sms_sent.phone_number.placeholder");

const phoneFieldIsHidden = () => phoneField()?.closest("[aria-hidden='true']") != null;

describe("SmsSentForm confirmation", () => {
  it("hides the gateway and settings actions on the client dialog", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SmsSentForm mode="singleClient" clientId="client-1" phone="01700000000" />
      </QueryClientProvider>
    );

    expect(await screen.findByText("sms_sent.gateway.isptik")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "sms_sent.gateway.configured" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "settings.sections.sms.title" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "sms_sent.mode.live.title" })).toBeInTheDocument();
  });

  it("keeps the gateway action on the send page", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SmsSentForm />
      </QueryClientProvider>
    );

    expect(await screen.findByRole("button", { name: "sms_sent.gateway.configured" })).toBeInTheDocument();
  });

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

  it("prices the open client by public id before confirming", async () => {
    const user = userEvent.setup();
    const clientId = "a32940b3-8cf1-4783-b07a-c5a9382530b3";
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SmsSentForm mode="singleClient" clientId={clientId} phone="01700000000" />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("combobox", { hidden: true }));
    await user.click(await screen.findByText("Custom Client"));
    await waitFor(() =>
      expect(screen.getByPlaceholderText("sms_sent.sms_body.placeholder")).toHaveValue("Notice")
    );

    await user.click(screen.getByRole("button", { name: "sms_sent.send" }));
    const confirm = await screen.findByRole("button", { name: /sms_sent.confirm.submit/ });
    await waitFor(() => expect(confirm).toBeEnabled());

    expect(previewCalls().at(-1)?.[0]).toMatchObject({
      data: {
        clientIds: [clientId],
        phone: null,
        message: "Notice",
        mode: "live",
      },
    });
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
