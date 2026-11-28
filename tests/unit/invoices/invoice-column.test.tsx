import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { useInvoiceColumns } from "@/components/invoices/invoice-column";
import { InvoiceRow } from "@/components/invoices/invoice-type";

// ClientViewLink reads the router (modal / drawer open over the current page).
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
    usePathname: () => "/list",
}));

// ClientViewLink prefetches the client detail, so the cell needs a query client, as in the app.
function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}


const permissions = vi.hoisted(() => ({
    allowed: true,
    newTab: false as boolean | number,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => name === "clients.show" && permissions.allowed,
    }),
    useSettings: () => ({
        settings: { client_view_open_on_new_tab: permissions.newTab },
    }),
}));

vi.mock("@/components/invoices/invoice-row-actions", () => ({
    default: () => null,
}));

const clientColumn = (columns: ColumnDef<InvoiceRow>[]) =>
    columns.find((column) => "accessorKey" in column && column.accessorKey === "client.name");

const renderClientCell = (client: InvoiceRow["client"]) => {
    const { result } = renderHook(() => useInvoiceColumns());
    const cell = clientColumn(result.current)?.cell;

    expect(typeof cell).toBe("function");
    if (typeof cell !== "function") return;

    return render(cell({ row: { original: { client } } } as never) as ReactElement, { wrapper: QueryWrapper });
};

describe("invoice client column", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «links the client name to the details page»।
    it("Invoice column: links the client name to the details page", () => {
        permissions.allowed = true;
        permissions.newTab = false;

        const view = renderClientCell({
            id: 12,
            uuid: "client-uuid",
            name: "Kamal",
        });

        const link = view?.getByRole("link", { name: "Kamal" });
        expect(link).toHaveAttribute("href", "/clients/view/client-uuid");
        expect(link).not.toHaveAttribute("target");
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «opens the details page in a new tab when that setting is on»।
    it("Invoice column: opens the details page in a new tab when that setting is on", () => {
        permissions.allowed = true;
        permissions.newTab = 1;

        const view = renderClientCell({
            id: 12,
            uuid: "client-uuid",
            name: "Kamal",
        });

        expect(view?.getByRole("link", { name: "Kamal" })).toHaveAttribute("target", "_blank");
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the name as text without view permission»।
    it("Invoice column: shows the name as text without view permission", () => {
        permissions.allowed = false;

        const view = renderClientCell({
            id: 12,
            uuid: "client-uuid",
            name: "Kamal",
        });

        expect(view?.queryByRole("link", { name: "Kamal" })).not.toBeInTheDocument();
        expect(view?.getByText("Kamal")).toBeInTheDocument();
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a dash when the invoice has no client»।
    it("Invoice column: shows a dash when the invoice has no client", () => {
        permissions.allowed = true;

        const view = renderClientCell(null);

        expect(view?.queryByRole("link")).not.toBeInTheDocument();
        expect(view?.getByText("—")).toBeInTheDocument();
    });
});

const renderAmountCell = (invoice: Partial<InvoiceRow>) => {
    const { result } = renderHook(() => useInvoiceColumns());
    const cell = result.current.find(
        (column) => "accessorKey" in column && column.accessorKey === "after_discount_amount",
    )?.cell;

    expect(typeof cell).toBe("function");
    if (typeof cell !== "function") return;

    return render(cell({ row: { original: invoice } } as never) as ReactElement, { wrapper: QueryWrapper });
};

describe("invoice amount column", () => {
    // আংশিক পরিশোধে আগে লাল ডিউ ব্যাজ, পরে সবুজ পেইড ব্যাজ দেখায় এবং মূল বিলের পরিমাণ দেখায় না কি না যাচাই করি।
    it("Invoice column: a partly paid invoice shows a red due badge, then a green paid badge, without the bill total", () => {
        const view = renderAmountCell({ after_discount_amount: 1000, amount_paid: 400 });

        const due = view?.getByText(/invoice\.filter\.status_due/);
        const paid = view?.getByText(/invoice\.reports\.paid/);
        expect(due).toHaveClass("theme-badge-danger");
        expect(due).toHaveTextContent("600.00/-");
        expect(paid).toHaveClass("theme-badge-success");
        expect(paid).toHaveTextContent("400.00/-");
        expect(due && paid && due.compareDocumentPosition(paid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(view?.container).not.toHaveTextContent("1,000.00/-");
    });

    // পুরো ডিউ বা পুরো পরিশোধিত ইনভয়েসে শুধু বিলের পরিমাণ দেখায়, কোনো ডিউ/পেইড ব্যাজ থাকে না কি না যাচাই করি।
    it("Invoice column: an unpaid or fully paid invoice shows only the bill total", () => {
        for (const amount_paid of [0, 1000]) {
            const view = renderAmountCell({ after_discount_amount: 1000, amount_paid });

            expect(view?.container).toHaveTextContent("1,000.00/-");
            expect(view?.queryByText(/invoice\.filter\.status_due/)).not.toBeInTheDocument();
            expect(view?.queryByText(/invoice\.reports\.paid/)).not.toBeInTheDocument();
            view?.unmount();
        }
    });
});
