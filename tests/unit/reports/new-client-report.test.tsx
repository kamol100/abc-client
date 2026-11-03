import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewClientReports, { currentMonthDateRange, newClientReportSearch } from "@/components/reports/new-client-report";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("react-toastify", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({
        data: { success: true, data: [] },
        isLoading: false,
        isError: false,
        error: null,
    }),
}));

const novemberStart = new Date(2026, 10, 1);
const novemberThird = new Date(2026, 10, 3);

describe("newClientReportSearch", () => {
    it("always sends the local calendar dates and omits All", () => {
        const dates = {
            date_range: { from: novemberStart, to: novemberThird },
        };

        expect(newClientReportSearch(dates)).toBe("date_from=2026-11-01&date_to=2026-11-03");
        expect(newClientReportSearch({ ...dates, zone_id: "all", status: "all" })).toBe(
            "date_from=2026-11-01&date_to=2026-11-03",
        );
        expect(newClientReportSearch({ ...dates, reseller_id: "all" })).toBe(
            "date_from=2026-11-01&date_to=2026-11-03",
        );
        expect(newClientReportSearch({ ...dates, scope: "own", zone_id: 2, status: "active" })).toBe(
            "date_from=2026-11-01&date_to=2026-11-03&zone_id=2&status=active",
        );
        expect(newClientReportSearch({ ...dates, reseller_id: 9 })).toBe(
            "date_from=2026-11-01&date_to=2026-11-03&reseller_id=9",
        );
        expect(format(novemberStart, "yyyy-MM-dd")).toBe("2026-11-01");
    });

    it("drops zone_id for the with-resellers scope", () => {
        const dates = {
            date_range: { from: novemberStart, to: novemberThird },
        };

        expect(newClientReportSearch({ ...dates, scope: "with_resellers", zone_id: 2, status: "all" })).toBe(
            "date_from=2026-11-01&date_to=2026-11-03&scope=with_resellers",
        );
        expect(newClientReportSearch({
            ...dates,
            scope: "with_resellers",
            zone_id: 2,
            status: "inactive",
        })).toBe("date_from=2026-11-01&date_to=2026-11-03&scope=with_resellers&status=inactive");
    });
});

describe("currentMonthDateRange", () => {
    it("uses the first day of the current month through today", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 10, 3, 9, 15, 0));

        const range = currentMonthDateRange();

        expect(format(range.from, "yyyy-MM-dd")).toBe("2026-11-01");
        expect(format(range.to, "yyyy-MM-dd")).toBe("2026-11-03");
        vi.useRealTimers();
    });
});

class ResizeObserverStub {
    observe() { }
    unobserve() { }
    disconnect() { }
}

describe("NewClientReports download", () => {
    beforeEach(() => {
        URL.createObjectURL = vi.fn(() => "blob:new-clients");
        URL.revokeObjectURL = vi.fn();
        vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    });

    it("opens the pdf in a new tab for the current month through today", async () => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date(2026, 10, 3, 9, 15, 0));
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const open = vi.fn();
        vi.stubGlobal("open", open);
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        render(
            <QueryClientProvider client={client}>
                <NewClientReports />
            </QueryClientProvider>,
        );

        const [clientButton] = screen.getAllByRole("button", { name: "new_client_report.download" });
        await user.click(clientButton);

        expect(open).toHaveBeenCalledWith(
            "/api/reports/new-clients/clients?date_from=2026-11-01&date_to=2026-11-03&scope=with_resellers",
            "_blank",
            "noopener",
        );
        vi.useRealTimers();
    });
});
