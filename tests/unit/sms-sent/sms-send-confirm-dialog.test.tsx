import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "@/app/actions";
import { SmsSendConfirmDialog } from "@/components/sms-sent/sms-send-confirm-dialog";
import type { SmsSendMode, SmsSendQuote, SmsSentPayload } from "@/components/sms-sent/sms-sent-type";

vi.mock("@/app/actions", () => ({
  useFetch: vi.fn(),
  getData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) =>
      values?.time ? `${key} ${values.time}` : key,
    i18n: { language: "en" },
  }),
}));

const payload: SmsSentPayload = {
  phone: "01700000000",
  sms_body: "Hello",
  sms_template_id: null,
  message: "Hello",
  custom_message: "Hello",
  all_client: 0,
  status: null,
  clientIds: null,
  mode: "live",
};

const baseQuote: SmsSendQuote = {
  recipients: 2,
  total_units: 4,
  total_cost: 4,
  balance: 1000,
  remaining_balance: 996,
  sufficient: true,
  scheduled_at: null,
  timezone: "Asia/Dhaka",
};

function mockQuote(quote: Partial<SmsSendQuote> = {}) {
  vi.mocked(useFetch).mockResolvedValue({ success: true, data: { ...baseQuote, ...quote } });
}

function renderDialog({
  mode = "live",
  isSubmitting = false,
  onConfirm = vi.fn(),
}: { mode?: SmsSendMode; isSubmitting?: boolean; onConfirm?: (options: { sendNow: boolean }) => void } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <SmsSendConfirmDialog
        payload={payload}
        mode={mode}
        isSubmitting={isSubmitting}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />
    </QueryClientProvider>
  );

  return { onConfirm };
}

function rowValue(label: string) {
  return screen.getByText(label).closest("div")?.querySelector("dd .sr-only")?.textContent ?? "";
}

const confirmButton = () => screen.getByRole("button", { name: /sms_sent.confirm.(test_)?submit/ });

describe("SmsSendConfirmDialog", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
  });

  it("loads the quote from the preview endpoint and confirms a funded live send", async () => {
    mockQuote();
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    expect(await screen.findByText("sms_sent.confirm.recipients")).toBeInTheDocument();
    expect(useFetch).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/sms-store/preview", method: "POST" })
    );
    expect(rowValue("sms_sent.confirm.recipients")).toBe("2");
    expect(rowValue("sms_sent.sms_count.label")).toBe("4");
    expect(rowValue("sms_sent.confirm.wallet_balance")).toMatch(/1,000/);
    expect(rowValue("sms_sent.confirm.remaining_balance")).toMatch(/996/);
    expect(screen.queryByText("sms_sent.confirm.test_badge")).not.toBeInTheDocument();

    await user.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledWith({ sendNow: false });
  });

  it("blocks a live send when the wallet cannot cover the cost", async () => {
    mockQuote({ balance: 1, remaining_balance: -3, sufficient: false });
    renderDialog();

    expect(await screen.findByRole("alert")).toHaveTextContent("sms_sent.confirm.insufficient.title");
    expect(screen.queryByText("sms_sent.confirm.remaining_balance")).not.toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it("allows a test send without enough balance and marks it as test mode", async () => {
    mockQuote({ balance: 0, remaining_balance: -4, sufficient: false });
    const user = userEvent.setup();
    const { onConfirm } = renderDialog({ mode: "test" });

    expect(await screen.findByText("sms_sent.confirm.test_badge")).toBeInTheDocument();
    expect(screen.getByText("sms_sent.mode.test.not_charged")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledWith({ sendNow: false });
  });

  it("shows the upcoming invoice schedule in the app timezone and passes the send now choice", async () => {
    mockQuote({ scheduled_at: "2026-10-28T04:00:00+00:00", timezone: "Asia/Dhaka" });
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    expect(await screen.findByText(/sms_sent.confirm.schedule.time: 10:00 AM/)).toBeInTheDocument();
    const sendNow = screen.getByRole("checkbox", { name: "sms_sent.confirm.schedule.send_now" });
    expect(sendNow).not.toBeChecked();
    expect(screen.getByText("sms_sent.confirm.schedule.scheduled_hint 10:00 AM")).toBeInTheDocument();

    await user.click(sendNow);
    expect(screen.getByText("sms_sent.confirm.schedule.immediate_hint")).toBeInTheDocument();

    await user.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledWith({ sendNow: true });
  });

  it("hides the schedule once the configured time has passed", async () => {
    mockQuote({ scheduled_at: null });
    renderDialog();

    await screen.findByText("sms_sent.confirm.recipients");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("disables confirmation while the send is in progress", async () => {
    mockQuote();
    const user = userEvent.setup();
    const { onConfirm } = renderDialog({ isSubmitting: true });

    await screen.findByText("sms_sent.confirm.recipients");
    expect(confirmButton()).toBeDisabled();
    await user.click(confirmButton());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables confirmation when nothing would be sent", async () => {
    mockQuote({ recipients: 0, total_units: 0, total_cost: 0 });
    renderDialog();

    expect(await screen.findByText("sms_sent.confirm.no_recipients")).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });
});
