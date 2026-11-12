import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    activationPreview,
    type ActivationInvoicePreview,
} from "@/components/clients/client-activation";
import ClientStatusToggle from "@/components/clients/client-status-toggle";

const harness = vi.hoisted(() => ({
    mutate: vi.fn(),
    isPending: false,
    options: null as {
        ignoreError?: (error: unknown) => boolean;
        onError?: (error: unknown) => void;
        onSuccess?: () => void;
    } | null,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { month?: string; count?: number }) => {
            if (options?.month) return `${key}:${options.month}`;
            if (typeof options?.count === "number") return `${key}:${options.count}`;
            return key;
        },
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: (options: typeof harness.options) => {
        harness.options = options;
        return { mutate: harness.mutate, isPending: harness.isPending };
    },
}));

vi.mock("@/components/form/DatePicker", () => ({
    default: () => <div data-testid="termination-date" />,
}));

vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
        title,
    }: {
        children?: ReactNode;
        footer?: (props: { close: () => void; loading: boolean }) => ReactNode;
        title?: string;
    }) => (
        <div role="dialog" aria-label={title}>
            {children}
            {footer?.({ close: () => undefined, loading: harness.isPending })}
        </div>
    ),
}));

const preview: ActivationInvoicePreview = {
    pppoe_username: "7744",
    client_name: "Activation Client",
    package_name: "Silver",
    package_price: 500,
    create_date: "2026-11-06",
    create_date_label: "6th Nov, 2026",
    month_label: "November, 26",
    remaining_days: 24,
    adjust_amount: 400,
    payment_deadline: 11,
    termination_date: null,
};

const billRequired = {
    success: false,
    error: {
        code: "internet_bill_required",
        message: "Generate the current month internet bill before activating this client.",
        preview,
    },
};

describe("client activation invoice", () => {
    beforeEach(() => {
        harness.mutate.mockReset();
        harness.mutate.mockImplementation((_variables, callbacks?: { onSettled?: () => void }) => {
            callbacks?.onSettled?.();
        });
        harness.isPending = false;
        harness.options = null;
    });

    it("reads the billing preview only for a missing internet bill", () => {
        expect(activationPreview(billRequired)).toEqual(preview);
        expect(activationPreview({ error: { code: "package_price_invalid" } })).toBeNull();
    });

    it("deactivates an active client without opening the bill", async () => {
        const user = userEvent.setup();
        render(<ClientStatusToggle clientId="client-1" initialStatus={1} />);

        await user.click(screen.getByRole("switch"));

        expect(harness.mutate).toHaveBeenCalledWith({ status: 0 }, expect.any(Object));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens the bill when activation needs an internet invoice", async () => {
        const user = userEvent.setup();
        render(<ClientStatusToggle clientId="client-1" initialStatus={0} />);

        expect(harness.options?.ignoreError?.(billRequired)).toBe(true);
        expect(harness.options?.ignoreError?.({ error: { message: "Mikrotik connection failed!" } })).toBe(false);

        await user.click(screen.getByRole("switch"));
        expect(harness.mutate).toHaveBeenCalledTimes(1);
        expect(harness.mutate).toHaveBeenCalledWith({ status: 1 }, expect.any(Object));

        act(() => {
            harness.options?.onError?.(billRequired);
        });

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("7744 | Activation Client | Silver | ৳500.00")).toBeInTheDocument();
        expect(screen.getByText("6th Nov, 2026")).toBeInTheDocument();
        expect(screen.getByLabelText(/client.activation.adjust:November, 26/)).toHaveValue("400");
        expect(screen.getByText("client.activation.remaining_days:24")).toBeInTheDocument();
        expect(screen.getByText("client.activation.amount_calculated")).toBeInTheDocument();
    });

    it("keeps the dialog open until a valid invoice is submitted", async () => {
        const user = userEvent.setup();
        render(<ClientStatusToggle clientId="client-1" initialStatus={0} />);
        await user.click(screen.getByRole("switch"));
        act(() => {
            harness.options?.onError?.(billRequired);
        });
        harness.mutate.mockClear();

        await user.click(screen.getByRole("button", { name: "client.activation.submit" }));

        expect(harness.mutate).not.toHaveBeenCalled();
        expect(screen.getByText("client.activation.note.errors.required")).toBeInTheDocument();
        expect(screen.getByRole("dialog")).toBeInTheDocument();

        const amount = screen.getByLabelText(/client.activation.adjust:November, 26/);
        await user.clear(amount);
        await user.type(amount, "250");
        expect(screen.getByText("client.activation.amount_edited")).toBeInTheDocument();

        await user.type(screen.getByLabelText(/client.activation.note_label/), "Rest of November");
        await user.click(screen.getByRole("button", { name: "client.activation.submit" }));

        expect(harness.mutate).toHaveBeenCalledWith({
            status: 1,
            invoice: {
                amount: 250,
                payment_deadline: 11,
                termination_date: null,
                note: "Rest of November",
            },
        }, expect.any(Object));

        act(() => {
            harness.options?.onError?.({ error: { message: "Mikrotik connection failed!" } });
        });
        expect(screen.getByRole("dialog")).toBeInTheDocument();

        act(() => {
            harness.options?.onSuccess?.();
        });
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("switch")).toBeChecked();
    });

    it("ignores a second activation click while the first request is still locked", async () => {
        const user = userEvent.setup();
        harness.mutate.mockImplementation(() => undefined);
        render(<ClientStatusToggle clientId="client-1" initialStatus={0} />);

        await user.click(screen.getByRole("switch"));
        await user.click(screen.getByRole("switch"));

        expect(harness.mutate).toHaveBeenCalledTimes(1);
    });
});
