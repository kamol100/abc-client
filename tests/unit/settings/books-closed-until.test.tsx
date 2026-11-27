import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { addDays, format, subDays } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "@/components/settings/ui/settings-panel";

const state = vi.hoisted(() => ({
    settings: {} as Record<string, unknown>,
    mutateAsync: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({ settings: state.settings, updateSettings: vi.fn() }),
    usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({ mutateAsync: state.mutateAsync, isPending: false }),
}));

vi.mock("@/components/sms-sent/sms-gateway", () => ({
    useSmsGatewayStatus: () => ({ isLoading: false, status: "active" }),
}));

const booksRow = () => document.querySelector<HTMLElement>('[data-setting="books_closed_until"]')!;
const dateButton = () => document.getElementById("date-books_closed_until") as HTMLButtonElement;

describe("books closed until setting", () => {
    beforeEach(() => {
        state.settings = {};
        state.mutateAsync = vi.fn().mockResolvedValue({});
    });

    // খাতা বন্ধের তারিখ সেভ না থাকলে ক্যালেন্ডার বাটনে "Not set" দেখায় এবং পুরনো টেক্সট বক্সের এডিট বাটন থাকে না কি না যাচাই করি।
    it("Books closed until: show a calendar button reading Not set when no date is saved", () => {
        render(<SettingsPanel section="general" />);

        expect(dateButton().textContent).toContain("settings.common.not_set");
        expect(within(booksRow()).queryByRole("button", { name: /settings\.actions\.edit/ })).toBeNull();
    });

    // সেভ করা তারিখ পড়ার উপযোগী ফরম্যাটে দেখায় কি না যাচাই করি।
    it("Books closed until: show the saved date as day, month and year", () => {
        state.settings = { books_closed_until: "2026-10-31" };
        render(<SettingsPanel section="general" />);

        expect(dateButton().textContent).toContain("31 Oct 2026");
    });

    // ক্যালেন্ডারে গতকাল বেছে নিলে YYYY-MM-DD আকারে সেভ হয় এবং আজ ও পরের দিনগুলো বেছে নেওয়া যায় না কি না যাচাই করি।
    it("Books closed until: save yesterday when it is picked, and keep today and later days disabled", async () => {
        render(<SettingsPanel section="general" />);
        fireEvent.click(dateButton());

        const today = new Date();
        const yesterday = subDays(today, 1);
        const dayButton = (day: Date) =>
            document.querySelector<HTMLButtonElement>(`[data-day="${day.toLocaleDateString()}"]`) ??
            document.querySelector<HTMLButtonElement>(`[data-day="${format(day, "yyyy-MM-dd")}"] button`);

        expect(dayButton(today)?.disabled).toBe(true);
        // Days of the next month shown in the same grid are disabled too.
        expect(dayButton(addDays(today, 1))?.disabled).toBe(true);
        expect(dayButton(addDays(today, 2))?.disabled).toBe(true);

        // On the 1st of a month yesterday is in the previous month, which is not on screen.
        if (yesterday.getMonth() !== today.getMonth()) return;
        fireEvent.click(dayButton(yesterday)!);

        await waitFor(() =>
            expect(state.mutateAsync).toHaveBeenCalledWith({
                settings: { books_closed_until: format(yesterday, "yyyy-MM-dd") },
            }),
        );
    });

    // তারিখ মুছে দিলে null সেভ হয়, অর্থাৎ সব পিরিয়ড আবার খোলা হয় কি না যাচাই করি।
    it("Books closed until: save an empty value when the date is cleared", async () => {
        state.settings = { books_closed_until: "2026-10-31" };
        render(<SettingsPanel section="general" />);

        fireEvent.click(within(booksRow()).getByRole("button", { name: "common.clear" }));

        await waitFor(() =>
            expect(state.mutateAsync).toHaveBeenCalledWith({ settings: { books_closed_until: null } }),
        );
    });

    // লেবেলের পাশের তথ্য বাটনে ক্লিক করলে সেটিংয়ের ব্যাখ্যা (কী, কেন, প্রভাব, নোট) পপওভারে দেখায় কি না যাচাই করি।
    it("Books closed until: open the explanation when the info button is clicked", () => {
        render(<SettingsPanel section="general" />);

        expect(screen.queryByText("settings.fields.books_closed_until.info.why.text")).toBeNull();
        fireEvent.click(within(booksRow()).getByRole("button", { name: "settings.actions.about" }));

        for (const part of ["what", "why", "effect", "note"]) {
            expect(screen.getByText(`settings.fields.books_closed_until.info.${part}.title`)).toBeTruthy();
            expect(screen.getByText(`settings.fields.books_closed_until.info.${part}.text`)).toBeTruthy();
        }
    });
});
