import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientSwitchDialog from "@/components/clients/client-switch-dialog";
import { ClientRow } from "@/components/clients/client-type";

const harness = vi.hoisted(() => ({
    mutateAsync: vi.fn(),
    mutation: null as { url?: string; method?: string; invalidateKeys?: string } | null,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: (options: { url?: string; method?: string; invalidateKeys?: string }) => {
        harness.mutation = options;
        return {
            mutateAsync: harness.mutateAsync,
            isPending: false,
        };
    },
}));

vi.mock("@/components/select-dropdown", () => ({
    default: function MockResellerSelect() {
        const { setValue } = useFormContext();
        return (
            <button type="button" onClick={() => setValue("reseller_id", 7)}>
                pick-reseller
            </button>
        );
    },
}));

vi.mock("@/components/ui/dialog", () => ({
    DialogTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
    DialogDescription: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
        open,
    }: {
        children?: ReactNode;
        footer?: (props: { close: () => void; loading: boolean }) => ReactNode;
        open?: boolean;
    }) =>
        open ? (
            <div>
                {children}
                {footer?.({ close: () => undefined, loading: false })}
            </div>
        ) : null,
}));

const client: ClientRow = {
    id: "client-uuid",
    name: "Karim",
    pppoe_username: "karim01",
    phone: "01700000000",
};

describe("ClientSwitchDialog", () => {
    beforeEach(() => {
        harness.mutateAsync.mockReset();
        harness.mutateAsync.mockResolvedValue({});
        harness.mutation = null;
    });

    it("keeps switch disabled until a reseller is selected, then moves the client", async () => {
        const user = userEvent.setup();
        render(<ClientSwitchDialog client={client} open onOpenChange={() => undefined} />);

        expect(screen.getByText("Karim")).toBeInTheDocument();
        expect(screen.getByText("karim01")).toBeInTheDocument();
        expect(screen.getByText("01700000000")).toBeInTheDocument();

        const switchButton = screen.getByRole("button", { name: "client.switch_reseller.submit" });
        expect(switchButton).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "pick-reseller" }));
        expect(switchButton).toBeEnabled();

        await user.click(switchButton);

        expect(harness.mutation).toMatchObject({
            url: "/clients/client-uuid/switch-reseller",
            method: "POST",
            invalidateKeys: "clients,reseller-clients",
        });
        expect(harness.mutateAsync).toHaveBeenCalledWith({ reseller_id: 7 });
    });
});
