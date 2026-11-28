import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MissingInvoiceDialog, {
    type MissingInvoiceClient,
} from "@/components/invoices/missing-invoice-dialog";

const api = vi.hoisted(() => ({
    mutate: vi.fn(),
    query: {
        data: undefined as unknown,
        isLoading: false,
        isError: false,
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        // Values are appended so a test can read the count or the days in a label.
        t: (key: string, values?: Record<string, unknown>) =>
            values ? `${key} ${JSON.stringify(values)}` : key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => api.query,
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({ mutate: api.mutate, isPending: false }),
}));

vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
        open,
        title,
        onOpenChange,
    }: {
        children: ReactNode;
        open?: boolean;
        title?: string;
        onOpenChange?: (open: boolean) => void;
        footer?: (props: { close: () => void; loading: boolean }) => ReactNode;
    }) =>
        open ? (
            <section aria-label={title}>
                {children}
                {typeof footer === "function"
                    ? footer({ close: () => onOpenChange?.(false), loading: false })
                    : footer}
            </section>
        ) : null,
}));

function client(overrides: Partial<MissingInvoiceClient>): MissingInvoiceClient {
    return {
        uuid: "client-1",
        name: "Rahim",
        client_id: "C-1",
        phone: "01700000001",
        pppoe_username: "rahim",
        invoice_day: 5,
        package_name: "10 Mbps",
        package_price: 500,
        discount: 0,
        full_month_amount: 500,
        rest_of_month_amount: 167,
        ...overrides,
    };
}

function setList(clients: MissingInvoiceClient[], remainingDays = 10) {
    api.query = {
        data: { success: true, data: { month: "2026-05", remaining_days: remainingDays, clients } },
        isLoading: false,
        isError: false,
    };
}

function renderDialog() {
    render(
        <QueryClientProvider client={new QueryClient()}>
            <MissingInvoiceDialog open onOpenChange={vi.fn()} />
        </QueryClientProvider>,
    );
    return userEvent.setup();
}

const listDialog = () => screen.getByRole("region", { name: "invoice.missing.title" });
const confirmDialog = () => screen.getByRole("region", { name: "invoice.missing.confirm.title" });
const createButton = () => within(listDialog()).getByRole("button", { name: /invoice\.missing\.create/ });

describe("Missing invoice dialog", () => {
    beforeEach(() => {
        api.mutate.mockReset();
        setList([
            client({ uuid: "client-1", name: "Rahim" }),
            client({ uuid: "client-2", name: "Karim", full_month_amount: 300, rest_of_month_amount: 100 }),
        ]);
    });

    // তালিকায় ইনভয়েস না থাকা ক্লায়েন্ট দেখায়, আর কাউকে নির্বাচন না করলে তৈরি বোতাম বন্ধ থাকে।
    it("Missing invoice dialog - no client selected: clients are listed and the create button is disabled", () => {
        renderDialog();

        expect(screen.getByText("Rahim")).toBeTruthy();
        expect(screen.getByText("Karim")).toBeTruthy();
        expect(createButton()).toHaveProperty("disabled", true);
    });

    // প্যাকেজের দাম ০ হলে সেই ক্লায়েন্টের সারিতে সতর্কবার্তা দেখায়, অন্য সারিতে দেখায় না।
    it("Missing invoice dialog - package price is 0: a warning is shown on that client only", () => {
        setList([
            client({ uuid: "client-1", name: "Rahim" }),
            client({
                uuid: "client-2",
                name: "Karim",
                package_price: 0,
                full_month_amount: 0,
                rest_of_month_amount: 0,
            }),
        ]);
        renderDialog();

        expect(screen.getAllByText("invoice.missing.no_price")).toHaveLength(1);
        expect(
            within(screen.getByText("Karim").closest("label") as HTMLElement).getByText("invoice.missing.no_price"),
        ).toBeTruthy();
    });

    // "সব নির্বাচন" সব ক্লায়েন্ট নির্বাচন করে, আবার চাপলে সব বাদ দেয়।
    it("Missing invoice dialog - select all: every client is selected, and cleared when unticked", async () => {
        const user = renderDialog();
        const selectAll = screen.getByRole("checkbox", { name: "invoice.missing.select_all" });

        await user.click(selectAll);

        expect(screen.getByRole("checkbox", { name: "Rahim" }).getAttribute("aria-checked")).toBe("true");
        expect(screen.getByRole("checkbox", { name: "Karim" }).getAttribute("aria-checked")).toBe("true");
        expect(createButton().textContent).toContain('"count":2');

        await user.click(selectAll);

        expect(screen.getByRole("checkbox", { name: "Rahim" }).getAttribute("aria-checked")).toBe("false");
        expect(createButton()).toHaveProperty("disabled", true);
    });

    // একজন ক্লায়েন্ট বেছে পুরো মাসের ইনভয়েস নিশ্চিত করলে শুধু সেই ক্লায়েন্ট ও "full_month" পাঠানো হয়।
    it("Missing invoice dialog - one client, full month confirmed: only that client is sent with the full month mode", async () => {
        const user = renderDialog();

        await user.click(screen.getByRole("checkbox", { name: "Karim" }));
        await user.click(createButton());
        await user.click(within(confirmDialog()).getByRole("button", { name: "invoice.missing.confirm.submit" }));

        expect(api.mutate).toHaveBeenCalledTimes(1);
        expect(api.mutate).toHaveBeenCalledWith({ client_ids: ["client-2"], mode: "full_month" });
    });

    // নিশ্চিতকরণ উইন্ডোতে দুই ধরনের মোট টাকা দেখায়; "মাসের বাকি দিন" বেছে নিলে সেই ধরন পাঠানো হয়।
    it("Missing invoice dialog - rest of month chosen: both totals are shown and the rest of month mode is sent", async () => {
        const user = renderDialog();

        await user.click(screen.getByRole("checkbox", { name: "invoice.missing.select_all" }));
        await user.click(createButton());

        const confirm = within(confirmDialog());
        expect(confirm.getByText("800")).toBeTruthy();
        expect(confirm.getByText("267")).toBeTruthy();

        await user.click(confirm.getByRole("radio", { name: "invoice.missing.mode.rest_of_month.label" }));
        await user.click(confirm.getByRole("button", { name: "invoice.missing.confirm.submit" }));

        expect(api.mutate).toHaveBeenCalledWith({
            client_ids: ["client-1", "client-2"],
            mode: "rest_of_month",
        });
    });

    // মাসে বিল করার দিন বাকি না থাকলে "মাসের বাকি দিন" বেছে নেওয়া যায় না।
    it("Missing invoice dialog - no billing days left: the rest of month option is disabled", async () => {
        setList([client({ rest_of_month_amount: 0 })], 0);
        const user = renderDialog();

        await user.click(screen.getByRole("checkbox", { name: "Rahim" }));
        await user.click(createButton());

        const confirm = within(confirmDialog());
        expect(
            confirm.getByRole("radio", { name: "invoice.missing.mode.rest_of_month.label" }),
        ).toHaveProperty("disabled", true);
        expect(confirm.getByText("invoice.missing.mode.rest_of_month.unavailable")).toBeTruthy();
    });

    // সব ক্লায়েন্টের ইনভয়েস থাকলে খালি বার্তা দেখায় এবং তৈরি বোতাম বন্ধ থাকে।
    it("Missing invoice dialog - no client is missing an invoice: the empty message is shown", () => {
        setList([]);
        renderDialog();

        expect(screen.getByText("invoice.missing.empty")).toBeTruthy();
        expect(createButton()).toHaveProperty("disabled", true);
        expect(screen.getByRole("checkbox", { name: "invoice.missing.select_all" })).toHaveProperty("disabled", true);
    });
});
