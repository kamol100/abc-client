import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { getHistoryColumns } from "@/components/histories/history-column";
import type { HistoryRow } from "@/components/histories/history-type";

const permissions = vi.hoisted(() => ({
    allowed: true,
    newTab: false as boolean | number,
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

const clientColumn = getHistoryColumns(() => undefined).find(
    (column) => "accessorKey" in column && column.accessorKey === "client.name",
);

const renderClientCell = (client: HistoryRow["client"]) => {
    const cell = clientColumn?.cell;

    expect(typeof cell).toBe("function");
    if (typeof cell !== "function") return;

    return render(cell({ row: { original: { client } } } as never) as ReactElement);
};

describe("history client column", () => {
    // ইতিহাসের তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «links the client name to the details page»।
    it("History column: links the client name to the details page", () => {
        permissions.allowed = true;
        permissions.newTab = false;

        const view = renderClientCell({
            uuid: "client-uuid",
            name: "Kamal",
        });

        const link = view?.getByRole("link", { name: "Kamal" });
        expect(link).toHaveAttribute("href", "/clients/view/client-uuid");
        expect(link).toHaveAttribute("target", "_self");
    });

    // ইতিহাসের তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «opens the details page in a new tab when that setting is on»।
    it("History column: opens the details page in a new tab when that setting is on", () => {
        permissions.allowed = true;
        permissions.newTab = 1;

        const view = renderClientCell({
            uuid: "client-uuid",
            name: "Kamal",
        });

        expect(view?.getByRole("link", { name: "Kamal" })).toHaveAttribute("target", "_blank");
    });

    // ইতিহাসের তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the name as text without view permission»।
    it("History column: shows the name as text without view permission", () => {
        permissions.allowed = false;

        const view = renderClientCell({
            uuid: "client-uuid",
            name: "Kamal",
        });

        expect(view?.queryByRole("link")).toBeNull();
        expect(view?.getByText("Kamal")).toBeTruthy();
    });

    // ইতিহাসের তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a dash when the history has no client»।
    it("History column: shows a dash when the history has no client", () => {
        permissions.allowed = true;

        const view = renderClientCell(null);

        expect(view?.getByText("—")).toBeTruthy();
    });
});
