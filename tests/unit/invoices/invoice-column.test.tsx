import { render, renderHook } from "@testing-library/react";
import type { ReactElement } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { useInvoiceColumns } from "@/components/invoices/invoice-column";
import { InvoiceRow } from "@/components/invoices/invoice-type";

const permissions = vi.hoisted(() => ({
    allowed: true,
    newTab: false as boolean | number,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
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

    return render(cell({ row: { original: { client } } } as never) as ReactElement);
};

describe("invoice client column", () => {
    it("links the client name to the details page", () => {
        permissions.allowed = true;
        permissions.newTab = false;

        const view = renderClientCell({
            id: 12,
            uuid: "client-uuid",
            name: "Kamal",
        });

        const link = view?.getByRole("link", { name: "Kamal" });
        expect(link).toHaveAttribute("href", "/clients/view/client-uuid");
        expect(link).toHaveAttribute("target", "_self");
    });

    it("opens the details page in a new tab when that setting is on", () => {
        permissions.allowed = true;
        permissions.newTab = 1;

        const view = renderClientCell({
            id: 12,
            uuid: "client-uuid",
            name: "Kamal",
        });

        expect(view?.getByRole("link", { name: "Kamal" })).toHaveAttribute("target", "_blank");
    });

    it("shows the name as text without view permission", () => {
        permissions.allowed = false;

        const view = renderClientCell({
            id: 12,
            uuid: "client-uuid",
            name: "Kamal",
        });

        expect(view?.queryByRole("link", { name: "Kamal" })).not.toBeInTheDocument();
        expect(view?.getByText("Kamal")).toBeInTheDocument();
    });

    it("shows a dash when the invoice has no client", () => {
        permissions.allowed = true;

        const view = renderClientCell(null);

        expect(view?.queryByRole("link")).not.toBeInTheDocument();
        expect(view?.getByText("—")).toBeInTheDocument();
    });
});
