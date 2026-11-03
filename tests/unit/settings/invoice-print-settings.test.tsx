import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { InvoicePrintSettingsPage } from "@/components/settings/invoice-print-settings";
import {
    DEFAULT_INVOICE_PRINT_SETTINGS,
    type InvoicePrintSettings,
} from "@/components/invoices/invoice-print-config";

const { queryState, mutateAsync } = vi.hoisted(() => ({
    queryState: {
        data: {
            success: true as const,
            data: {
                show_company_name: true,
                show_company_address: true,
                show_company_phone: true,
                show_client_id: true,
                show_client_name: true,
                show_client_pppoe_id: true,
                show_client_phone: true,
                show_date_time: true,
                show_item_amount_header: true,
                show_total_amount_in_words: true,
                show_thank_you: true,
                show_company_support_number: true,
                font_size: 28,
                font_weight: 700,
                content_spacing: "standard",
                mode: "basic",
            } as InvoicePrintSettings,
        },
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
    mutateAsync: vi.fn(async (payload: unknown) => payload),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({
        settings: {
            company: "VP Net",
            company_address: "Dhaka",
            company_phone: "22222222222",
        },
    }),
    usePermissions: () => ({
        hasPermission: (permission: string) => permission === "company-settings.edit",
    }),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => queryState,
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({
        mutateAsync,
        isPending: false,
    }),
}));

const customReceipt = () => document.querySelector("[data-receipt-variant='custom']");
const basicReceipt = () => document.querySelector("[data-receipt-variant='basic']");
const originalReceipt = () => document.querySelector("[data-receipt-variant='original']");

describe("Invoice print settings page", () => {
    beforeAll(() => {
        Element.prototype.hasPointerCapture = () => false;
        Element.prototype.setPointerCapture = () => undefined;
        Element.prototype.releasePointerCapture = () => undefined;
        Element.prototype.scrollIntoView = () => undefined;
    });

    beforeEach(() => {
        queryState.data = {
            success: true,
            data: { ...DEFAULT_INVOICE_PRINT_SETTINGS },
        };
        mutateAsync.mockClear();
        mutateAsync.mockImplementation(async (payload: unknown) => payload);
    });

    it("keeps the original receipt fixed while the customized preview follows the draft", async () => {
        const user = userEvent.setup();
        render(<InvoicePrintSettingsPage />);

        expect(await screen.findByText("settings.invoice_print.original_preview")).toBeInTheDocument();
        expect(screen.getByText("settings.invoice_print.custom_preview")).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "settings.invoice_print.modes.basic" })).toBeChecked();
        expect(screen.queryByRole("switch", { name: "settings.invoice_print.flags.show_company_name" })).not.toBeInTheDocument();
        expect(screen.getByRole("switch", { name: "settings.invoice_print.flags.show_thank_you" })).toBeChecked();
        expect(screen.getByLabelText("settings.invoice_print.font_size")).toBeInTheDocument();
        expect(basicReceipt()).toHaveTextContent("VP Net");
        expect(basicReceipt()).toHaveTextContent("670@01711000000");
        expect(basicReceipt()).toHaveTextContent("800.00");
        expect(basicReceipt()).toHaveTextContent("Eight Hundred");
        expect(basicReceipt()).toHaveStyle({ fontSize: "28px", fontWeight: "700" });
        expect(originalReceipt()).toHaveTextContent("VP Net");
        expect(originalReceipt()).not.toHaveTextContent("670@01711000000");
        expect(customReceipt()).not.toBeInTheDocument();

        await user.click(screen.getByRole("switch", { name: "settings.invoice_print.flags.show_total_amount_in_words" }));
        expect(basicReceipt()).not.toHaveTextContent("Eight Hundred");
        expect(originalReceipt()).not.toHaveTextContent("Eight Hundred");

        await user.click(screen.getByRole("radio", { name: "settings.invoice_print.modes.advanced" }));

        expect(screen.getByRole("switch", { name: "settings.invoice_print.flags.show_company_name" })).toBeInTheDocument();
        expect(basicReceipt()).not.toBeInTheDocument();
        expect(originalReceipt()).toHaveTextContent("VP Net");
        expect(customReceipt()).toHaveTextContent("VP Net");
        expect(originalReceipt()).not.toHaveTextContent("Seven Hundred Fifty");
        expect(customReceipt()).not.toHaveTextContent("Seven Hundred Fifty");

        await user.click(screen.getByRole("switch", { name: "settings.invoice_print.flags.show_company_name" }));

        expect(originalReceipt()).toHaveTextContent("VP Net");
        expect(customReceipt()).not.toHaveTextContent("VP Net");
        expect(customReceipt()).toHaveTextContent("Dhaka");

        await user.clear(screen.getByLabelText("settings.invoice_print.font_size"));
        await user.type(screen.getByLabelText("settings.invoice_print.font_size"), "36");

        expect(customReceipt()).toHaveStyle({ fontSize: "36px", fontWeight: "700" });
        expect(originalReceipt()).not.toHaveStyle({ fontSize: "36px" });
        expect(originalReceipt()?.className).toContain("px-[16px]");
        expect(customReceipt()).toHaveStyle({ paddingLeft: "16px", paddingRight: "16px" });

        await user.click(screen.getByLabelText("settings.invoice_print.content_spacing"));
        await user.click(await screen.findByRole("option", { name: "settings.invoice_print.content_spacing_options.full" }));

        expect(customReceipt()).toHaveStyle({ paddingLeft: "0px", paddingRight: "0px" });
        expect(originalReceipt()?.className).toContain("px-[16px]");

        await user.click(screen.getByRole("button", { name: "settings.invoice_print.save" }));

        expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
            mode: "advanced",
            show_company_name: false,
            show_total_amount_in_words: false,
            font_size: 36,
            font_weight: 700,
            content_spacing: "full",
        }));
    });

    it("resets the draft to the default configuration", async () => {
        const user = userEvent.setup();
        render(<InvoicePrintSettingsPage />);

        await user.click(await screen.findByRole("switch", { name: "settings.invoice_print.flags.show_thank_you" }));
        expect(basicReceipt()).not.toHaveTextContent("invoice.receipt.thank_you");
        expect(originalReceipt()).toHaveTextContent("invoice.receipt.thank_you");

        await user.click(screen.getByRole("button", { name: "settings.invoice_print.reset" }));

        expect(mutateAsync).toHaveBeenCalledWith(DEFAULT_INVOICE_PRINT_SETTINGS);
        expect(basicReceipt()).toHaveTextContent("invoice.receipt.thank_you");
    });
});
