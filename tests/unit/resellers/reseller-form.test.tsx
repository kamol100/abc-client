import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import { ResellerFormFieldSchema } from "@/components/resellers/reseller-form-schema";
import { getResellerFormSchema } from "@/components/resellers/reseller-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (value: string) => value,
    }),
}));

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(async ({ url }: { url: string }) => {
        if (url.includes("dropdown-agents")) {
            return { data: [{ id: 7, name: "Karim Agent" }] };
        }
        return { data: [] };
    }),
}));

const billingSection = ResellerFormFieldSchema().find(
    (section) => section.name === "reseller.sections.billing_information"
);

const renderBilling = (data?: Record<string, unknown>) => {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={client}>
            <AccordionFormBuilder
                formSchema={billingSection ? [billingSection] : []}
                grids={1}
                data={data}
                api="/resellers"
                mode={data ? "edit" : "create"}
                schema={getResellerFormSchema(data ? "edit" : "create")}
                method={data ? "PUT" : "POST"}
                hydrateOnEdit="never"
            />
        </QueryClientProvider>
    );
};

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

describe("reseller agent commission fields", () => {
    beforeEach(() => {
        vi.stubGlobal("ResizeObserver", ResizeObserverStub);
        vi.stubGlobal("matchMedia", (query: string) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
    });

    const openAgentMenu = async () => {
        const user = userEvent.setup();
        const agent = await screen.findByRole("combobox", { hidden: true });
        await user.click(agent);
        await user.click(await screen.findByText("Karim Agent"));
        return user;
    };

    it("hides commission fields until an agent is selected", async () => {
        renderBilling();

        expect(await screen.findByRole("combobox", { hidden: true })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("reseller.commission.placeholder")).not.toBeInTheDocument();
        expect(screen.queryByText("reseller.count_commission.label")).not.toBeInTheDocument();

        await openAgentMenu();

        expect(await screen.findByPlaceholderText("reseller.commission.placeholder")).toBeInTheDocument();
        expect(screen.getByText("reseller.count_commission.label")).toBeInTheDocument();
    });

    it("hides commission fields again when the agent is cleared", async () => {
        renderBilling();
        const user = await openAgentMenu();

        expect(await screen.findByPlaceholderText("reseller.commission.placeholder")).toBeInTheDocument();
        const clearAgent = document.querySelector(".select__clear-indicator");
        expect(clearAgent).toBeTruthy();
        await user.click(clearAgent as HTMLElement);

        await waitFor(() => {
            expect(screen.queryByPlaceholderText("reseller.commission.placeholder")).not.toBeInTheDocument();
            expect(screen.queryByText("reseller.count_commission.label")).not.toBeInTheDocument();
        });
    });

    it("shows the saved agent and commission when editing", async () => {
        renderBilling({
            id: "reseller-uuid",
            agent_id: 7,
            agent: { id: 7, name: "Karim Agent" },
            commission: 15,
            count_commission: true,
            billing_type: "prepaid",
            auto_recharge: 1,
        });

        expect(await screen.findByText("Karim Agent")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("reseller.commission.placeholder")).toHaveValue(15);
        expect(screen.getByRole("switch")).toBeChecked();
    });
});
