import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnuActionsMenu } from "@/components/onu/onu-actions-cell";
import OnuRebootDialog from "@/components/onu/onu-reboot-dialog";
import type { OnuRow } from "@/components/onu/onu-type";

const state = vi.hoisted(() => ({ permissions: [] as string[] }));
const mutateAsync = vi.fn();
const useApiMutationMock = vi.fn((_options: unknown) => ({ mutateAsync, isPending: false }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, values?: Record<string, unknown>) => (values?.name ? `${key}:${values.name}` : key),
    }),
}));
vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({ hasPermission: (name: string) => state.permissions.includes(name) }),
}));
vi.mock("@/hooks/use-api-mutation", () => ({ default: (options: unknown) => useApiMutationMock(options) }));
// Radix menus need real pointer events: render the menu flat.
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div role="menu">{children}</div>,
    DropdownMenuItem: ({ children, disabled, onSelect }: { children: ReactNode; disabled?: boolean; onSelect?: () => void }) => (
        <button type="button" role="menuitem" disabled={disabled} onClick={() => onSelect?.()}>
            {children}
        </button>
    ),
    DropdownMenuSeparator: () => <hr />,
}));
vi.mock("@/components/onu/onu-bind-dialog", () => ({
    default: ({ open }: { open: boolean }) => (open ? <div>bind-dialog-open</div> : null),
}));

const onu = (status: OnuRow["status"]) => ({
    id: "onu-uuid-1",
    name: "EPON0/1:1",
    serial: null,
    mac: "02:4A:11:5C:7E:01",
    description: null,
    status,
    client: null,
    client_bound: false,
    client_binding: null,
});

describe("OnuActionsMenu", () => {
    beforeEach(() => {
        state.permissions = [];
    });

    it("shows a dash without onus.edit and onus.reboot", () => {
        render(<OnuActionsMenu onu={onu("online")} />);
        expect(screen.getByText("—")).toBeInTheDocument();
        expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    });

    it("offers reboot with onus.reboot only and opens the confirmation", () => {
        state.permissions = ["onus.reboot"];
        render(<OnuActionsMenu onu={onu("online")} />);
        expect(screen.queryByRole("menuitem", { name: /onu.bind.button/ })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("menuitem", { name: /onu.reboot.button/ }));
        expect(screen.getByText("onu.reboot.title")).toBeInTheDocument();
    });

    it("disables reboot while the OLT needs a new connection test", () => {
        state.permissions = ["onus.reboot"];
        render(<OnuActionsMenu onu={onu("online")} rebootBlocked />);
        expect(screen.getByRole("menuitem", { name: /onu.reboot.button/ })).toBeDisabled();
        expect(screen.getByText("onu.reboot.retest_short")).toBeInTheDocument();
    });

    it("disables reboot when the ONU status is from an old poll", () => {
        state.permissions = ["onus.reboot"];
        render(<OnuActionsMenu onu={{ ...onu("online"), status_known: false }} />);
        expect(screen.getByRole("menuitem", { name: /onu.reboot.button/ })).toBeDisabled();
        expect(screen.getByText("onu.reboot.unknown_short")).toBeInTheDocument();
    });

    it("disables reboot for an offline ONU and keeps bind for onus.edit", () => {
        state.permissions = ["onus.edit", "onus.reboot"];
        render(<OnuActionsMenu onu={onu("los")} />);
        expect(screen.getByRole("menuitem", { name: /onu.reboot.button/ })).toBeDisabled();
        fireEvent.click(screen.getByRole("menuitem", { name: /onu.bind.button/ }));
        expect(screen.getByText("bind-dialog-open")).toBeInTheDocument();
    });
});

describe("OnuRebootDialog", () => {
    beforeEach(() => {
        mutateAsync.mockReset().mockResolvedValue({ message: "ok" });
        useApiMutationMock.mockClear();
    });

    it("posts to the reboot endpoint after confirmation and closes", async () => {
        const onOpenChange = vi.fn();
        render(<OnuRebootDialog onu={onu("online")} open onOpenChange={onOpenChange} />);

        expect(screen.getByText("onu.reboot.confirm:02:4A:11:5C:7E:01")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /onu.reboot.confirm_button/ }));

        await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
        expect(mutateAsync).toHaveBeenCalledTimes(1);
        expect(useApiMutationMock).toHaveBeenCalledWith(
            expect.objectContaining({ url: "/onus/onu-uuid-1/reboot", method: "POST", invalidateKeys: "onus", successMessage: "onu.reboot.success" })
        );
    });

    it("stays open when the API refuses (the hook shows the toast)", async () => {
        mutateAsync.mockRejectedValue({ success: false, status: 422 });
        const onOpenChange = vi.fn();
        render(<OnuRebootDialog onu={onu("online")} open onOpenChange={onOpenChange} />);

        fireEvent.click(screen.getByRole("button", { name: /onu.reboot.confirm_button/ }));

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
});
