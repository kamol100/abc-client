import { render, screen } from "@testing-library/react";
import type { Column } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

const i18n = vi.hoisted(() => ({ language: "en" }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n }),
}));

const column = (sortable: boolean) =>
    ({
        getCanSort: () => sortable,
        getIsSorted: () => false,
        toggleSorting: vi.fn(),
        toggleVisibility: vi.fn(),
    }) as unknown as Column<unknown, unknown>;

describe("DataTableColumnHeader", () => {
    beforeEach(() => {
        i18n.language = "en";
    });

    // সর্ট করা যায় এবং যায় না, দুই ধরনের হেডারেই একই ছোট বড়-হাতের লেখার স্টাইল থাকে কি না যাচাই করি।
    it("Table column header: sortable and plain headers use the same small uppercase text", () => {
        render(
            <>
                <DataTableColumnHeader column={column(false)} title="plain.title" />
                <DataTableColumnHeader column={column(true)} title="sortable.title" />
            </>,
        );

        const plain = screen.getByText("plain.title");
        const sortable = screen.getByRole("button", { name: "sortable.title" });
        for (const header of [plain, sortable]) {
            expect(header).toHaveClass("text-[11px]", "font-semibold", "uppercase", "tracking-wider");
        }
    });

    // বাংলায় অক্ষরের ফাঁক (letter spacing) যোগ হয় না কি না যাচাই করি, কারণ তা বাংলা অক্ষর আলাদা করে দেয়।
    it("Table column header: Bengali headers get no letter spacing", () => {
        i18n.language = "bn";

        render(<DataTableColumnHeader column={column(false)} title="plain.title" />);

        expect(screen.getByText("plain.title")).toHaveClass("uppercase");
        expect(screen.getByText("plain.title")).not.toHaveClass("tracking-wider");
    });

    // ক্লায়েন্ট তালিকার ছোট হেডার লেখাগুলো ইংরেজি ও বাংলা দুই ফাইলেই আছে কি না যাচাই করি।
    it("Client table header labels: exist in both English and Bangla", () => {
        for (const lang of [en, bn]) {
            for (const key of ["client", "location", "package", "billing", "connection"] as const) {
                expect(lang.client.table[key]).toBeTruthy();
            }
        }
    });
});
