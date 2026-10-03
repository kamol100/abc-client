import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ClientPackageCell from "@/components/clients/client-package-cell";
import { ClientRow } from "@/components/clients/client-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { count?: number }) => {
            if (key === "client.table.termination_days") return `(${options?.count}-days)`;
            if (key === "client.table.termination_expired_days") return `(expired ${options?.count}-days)`;
            return key;
        },
    }),
}));

const client = (terminationDate: string | null, status = 1): ClientRow => ({
    status,
    termination_date: terminationDate,
    package: { name: "Home 10" },
} as ClientRow);

describe("ClientPackageCell termination date", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 3, 23, 30, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows the formatted date and remaining days", () => {
        render(<ClientPackageCell client={client("05-Oct-26")} />);

        expect(screen.getByText("05-Oct-26 (2-days)")).toBeInTheDocument();
        expect(screen.getByText("05-Oct-26 (2-days)")).not.toHaveClass("text-destructive");
    });

    it("shows zero days when termination is today", () => {
        render(<ClientPackageCell client={client("03-Oct-26")} />);

        expect(screen.getByText("03-Oct-26 (0-days)")).toBeInTheDocument();
    });

    it("shows an expired date in the destructive color", () => {
        render(<ClientPackageCell client={client("01-Oct-26")} />);

        const date = screen.getByText("01-Oct-26 (expired 2-days)");
        expect(date).toHaveClass("text-destructive");
    });

    it("keeps the dash when there is no termination date", () => {
        render(<ClientPackageCell client={client(null)} />);

        const date = screen.getByText("—", { selector: ".font-semibold" });
        expect(date).toBeInTheDocument();
        expect(date).not.toHaveClass("text-destructive");
        expect(screen.getByText("Home 10")).toBeInTheDocument();
    });
});
