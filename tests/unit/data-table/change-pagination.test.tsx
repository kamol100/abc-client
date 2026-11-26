import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import ChangePagination from "@/components/change-pagination";

vi.mock("@/context/app-provider", () => ({
    useProfile: () => ({
        profile: { staff: { id: 4, item_per_page: 10 } },
    }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(),
}));

function renderPagination() {
    return render(
        <QueryClientProvider client={new QueryClient()}>
            <ChangePagination />
        </QueryClientProvider>,
    );
}

describe("ChangePagination labels", () => {
    beforeAll(() => {
        Element.prototype.hasPointerCapture = () => false;
        Element.prototype.setPointerCapture = () => undefined;
        Element.prototype.releasePointerCapture = () => undefined;
        Element.prototype.scrollIntoView = () => undefined;
    });

    // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the number alone on small screens and keeps / page in the open list»।
    it("Change pagination: shows the number alone on small screens and keeps / page in the open list", async () => {
        const user = userEvent.setup();
        renderPagination();

        const trigger = screen.getByRole("combobox", { name: "Results per page" });
        const closedNumber = trigger.querySelector(".md\\:hidden");
        const closedFullLabel = trigger.querySelector(".md\\:inline");

        expect(closedNumber).toHaveTextContent("10");
        expect(closedNumber).not.toHaveTextContent("/ page");
        expect(closedFullLabel).toHaveTextContent("10 / page");

        await user.click(trigger);

        expect(screen.getByRole("option", { name: "5 / page" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "10 / page" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "25 / page" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "50 / page" })).toBeInTheDocument();
    });
});
