import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FormFilter from "@/components/form-wrapper/form-filter";
import { useFilterForm } from "@/hooks/use-filter-form";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/components/ui/sidebar", () => ({
    useSidebar: () => ({ isMobile: false }),
}));

const fields: FieldConfig[] = [
    { type: "text", name: "search", placeholder: "search.placeholder" },
    { type: "text", name: "code", placeholder: "code.placeholder" },
];

function iconButton(name: string): HTMLElement {
    const icon = document.querySelector(`.lucide-${name}`);
    const button = icon?.closest("button");
    if (!button) {
        throw new Error(`Missing ${name} button`);
    }
    return button;
}

describe("FormFilter toggle", () => {
    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «resets applied filters when the fields are hidden»।
    it("Filter toggle reset: resets applied filters when the fields are hidden", async () => {
        const user = userEvent.setup();
        const setFilter = vi.fn();

        render(
            <FormFilter
                formSchema={fields}
                setFilter={setFilter}
                searchButton
            />,
        );

        await user.click(iconButton("funnel"));
        await user.type(screen.getByPlaceholderText("search.placeholder"), "acme");
        await user.type(screen.getByPlaceholderText("code.placeholder"), "42");
        await user.click(iconButton("search"));

        expect(setFilter).toHaveBeenLastCalledWith("search=acme&code=42");

        await user.click(iconButton("funnel"));

        expect(setFilter).toHaveBeenLastCalledWith("");
        expect(screen.queryByPlaceholderText("search.placeholder")).not.toBeInTheDocument();

        const callsBeforeShow = setFilter.mock.calls.length;
        await user.click(iconButton("funnel"));

        expect(setFilter.mock.calls.length).toBe(callsBeforeShow);
        expect(screen.getByPlaceholderText("search.placeholder")).toHaveValue("");
        expect(screen.getByPlaceholderText("code.placeholder")).toHaveValue("");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves an empty filter query unchanged when hiding the fields»।
    it("Filter toggle reset: leaves an empty filter query unchanged when hiding the fields", async () => {
        const user = userEvent.setup();
        const setFilter = vi.fn();

        render(
            <FormFilter
                formSchema={fields}
                setFilter={setFilter}
                searchButton
            />,
        );

        await user.click(iconButton("funnel"));
        await user.click(iconButton("funnel"));

        expect(setFilter).not.toHaveBeenCalled();
        expect(screen.queryByPlaceholderText("search.placeholder")).not.toBeInTheDocument();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps a page default filter when user filters are cleared»।
    it("Filter toggle reset: keeps a page default filter when user filters are cleared", async () => {
        const user = userEvent.setup();
        const setFilter = vi.fn();

        render(
            <FormFilter
                formSchema={fields}
                setFilter={setFilter}
                searchButton
                defaultFilter="status=active"
            />,
        );

        await user.click(iconButton("funnel"));
        await user.type(screen.getByPlaceholderText("search.placeholder"), "acme");
        await user.click(iconButton("search"));

        expect(setFilter).toHaveBeenLastCalledWith("search=acme&status=active");

        await user.click(iconButton("funnel"));

        expect(setFilter).toHaveBeenLastCalledWith("status=active");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not reset filters that stay visible»।
    it("Filter toggle reset: does not reset filters that stay visible", async () => {
        const user = userEvent.setup();
        const setFilter = vi.fn();

        render(
            <FormFilter
                formSchema={fields}
                setFilter={setFilter}
                searchButton
                forceOpen
            />,
        );

        await user.type(screen.getByPlaceholderText("search.placeholder"), "acme");
        await user.click(iconButton("search"));
        await user.click(iconButton("funnel"));

        expect(setFilter).toHaveBeenLastCalledWith("search=acme");
        expect(screen.getByPlaceholderText("search.placeholder")).toHaveValue("acme");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «resets a shared filter form when the fields are hidden»।
    it("Filter toggle reset: resets a shared filter form when the fields are hidden", async () => {
        const user = userEvent.setup();
        const setFilter = vi.fn();

        function SharedFilter() {
            const formHook = useFilterForm({ formSchema: fields, setFilter });
            return (
                <FormFilter
                    formSchema={fields}
                    setFilter={setFilter}
                    searchButton
                    formHook={formHook}
                />
            );
        }

        render(<SharedFilter />);

        await user.click(iconButton("funnel"));
        await user.type(screen.getByPlaceholderText("search.placeholder"), "acme");
        await user.click(iconButton("search"));
        await user.click(iconButton("funnel"));
        await user.click(iconButton("funnel"));

        expect(setFilter).toHaveBeenLastCalledWith("");
        expect(screen.getByPlaceholderText("search.placeholder")).toHaveValue("");
    });
});
