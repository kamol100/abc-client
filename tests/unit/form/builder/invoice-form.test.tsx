/**
 * The invoice form, with its line items.
 *
 * Recorded before the hand-written line editor is replaced by the form builder's
 * field array, so the move can be compared against the same markup and the same
 * payload.
 */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InvoiceForm from "@/components/invoices/invoice-form";
import { fieldById, inputById, mockApi, renderWithClient, stubBrowserApis, writeRequests } from "./harness";

vi.hoisted(() => {
    process.env.TZ = "Asia/Dhaka";
});

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, values?: Record<string, unknown>) =>
            values && "index" in values ? `${key} ${values.index}` : key,
        i18n: { language: "en" },
    }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({ hasPermission: () => true }),
    useProfile: () => ({ profile: { staff: null } }),
}));

const invoiceRecord = {
    id: 5,
    create_date: "2026-11-20",
    due_date: "2026-11-30",
    invoice_type: { id: 2, name: "Monthly bill" },
    client: { id: 9, name: "Karim" },
    discount: 10,
    status: "due",
    note: "November",
    lines: [
        { uuid: "l-1", description: "Internet 10 Mbps", amount: 500, quantity: 2, discount: 5, order: 0, total_amount: 1000 },
        { uuid: "l-2", description: "Router rent", amount: 100, quantity: 1, discount: 0, order: 1, total_amount: 100 },
    ],
};

const serveInvoice = () =>
    mockApi((request) => {
        if (request.method === "GET" && request.url === "/invoices/5") return { success: true, data: invoiceRecord };
        if (request.url === "/dropdown-invoice-types") return { success: true, data: [{ id: 2, name: "Monthly bill" }] };
        if (request.url === "/dropdown-clients") return { success: true, data: [{ id: 9, name: "Karim" }] };
        return undefined;
    });

/** Generated ids differ between runs of a changed tree; they are not markup. */
function stableDom(root: HTMLElement): HTMLElement {
    const copy = root.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("*").forEach((element) => {
        for (const attribute of Array.from(element.attributes)) {
            if (/^(radix-|_r_|:r)|(_r_\w+_)/.test(attribute.value)) element.setAttribute(attribute.name, "generated-id");
        }
    });
    return copy;
}

const linesBlock = () => {
    const heading = screen.getByText("invoice.lines.title");
    return heading.parentElement?.parentElement as HTMLElement;
};

describe("invoice form", () => {
    beforeEach(() => {
        stubBrowserApis();
        serveInvoice();
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-11-25T06:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «edit: draws the saved lines, and their markup»।
    it("Invoice form: edit: draws the saved lines, and their markup", async () => {
        renderWithClient(<InvoiceForm mode="edit" data={{ id: 5 }} />);

        await waitFor(() => expect(inputById("lines.1.description")).toHaveValue("Router rent"));
        expect(inputById("lines.0.amount")).toHaveValue(500);
        expect(inputById("lines.0.total_amount")).toHaveValue(1000);
        expect(inputById("lines.0.total_amount")).toHaveAttribute("readonly");

        expect(stableDom(linesBlock())).toMatchSnapshot();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «edit: sends the record back with its lines»।
    it("Invoice form: edit: sends the record back with its lines", async () => {
        renderWithClient(<InvoiceForm mode="edit" data={{ id: 5 }} />);
        await waitFor(() => expect(inputById("lines.1.description")).toHaveValue("Router rent"));
        await screen.findByText("Karim");

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "common.save" }));

        await waitFor(() => expect(writeRequests()).toHaveLength(1));
        expect(writeRequests()[0]).toMatchSnapshot();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «recomputes a line total when amount or quantity changes»।
    it("Invoice form: recomputes a line total when amount or quantity changes", async () => {
        renderWithClient(<InvoiceForm mode="edit" data={{ id: 5 }} />);
        await waitFor(() => expect(inputById("lines.0.amount")).toHaveValue(500));

        const user = userEvent.setup();
        await user.clear(inputById("lines.0.quantity"));
        await user.type(inputById("lines.0.quantity"), "3");

        await waitFor(() => expect(inputById("lines.0.total_amount")).toHaveValue(1500));
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds a line with the default values and removes a line»।
    it("Invoice form: adds a line with the default values and removes a line", async () => {
        renderWithClient(<InvoiceForm mode="edit" data={{ id: 5 }} />);
        await waitFor(() => expect(inputById("lines.1.description")).toHaveValue("Router rent"));

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "invoice.lines.add" }));
        await waitFor(() => expect(fieldById("lines.2.description")).toBeInTheDocument());
        expect(inputById("lines.2.quantity")).toHaveValue(1);
        expect(inputById("lines.2.total_amount")).toHaveValue(0);

        // Each row has two remove buttons: one for phones, one for wider screens.
        const removeButtons = screen.getAllByRole("button", { name: "invoice.lines.remove" });
        await user.click(removeButtons[0]);

        await waitFor(() => expect(fieldById("lines.2.description")).toBeNull());
        expect(inputById("lines.0.description")).toHaveValue("Router rent");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «cannot remove the last line»।
    it("Invoice form: cannot remove the last line", async () => {
        renderWithClient(<InvoiceForm mode="create" />);
        await waitFor(() => expect(fieldById("lines.0.description")).toBeInTheDocument());

        screen
            .getAllByRole("button", { name: "invoice.lines.remove" })
            .forEach((button) => expect(button).toBeDisabled());
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «create: starts with one empty line»।
    it("Invoice form: create: starts with one empty line", async () => {
        renderWithClient(<InvoiceForm mode="create" />);

        await waitFor(() => expect(fieldById("lines.0.description")).toBeInTheDocument());
        expect(fieldById("lines.1.description")).toBeNull();
        expect(inputById("lines.0.quantity")).toHaveValue(1);
    });
});
