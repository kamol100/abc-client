import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteModal } from "@/components/delete-modal";

const mutation = vi.hoisted(() => ({ mutateAsync: vi.fn() }));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({ mutateAsync: mutation.mutateAsync, isPending: false }),
}));

async function openDialog() {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));
    return user;
}

function confirmButton() {
    return screen.getByRole("button", { name: "common.delete" });
}

describe("DeleteModal reason", () => {
    beforeEach(() => {
        mutation.mutateAsync.mockReset();
        mutation.mutateAsync.mockResolvedValue(undefined);
    });

    it("sends the trimmed reason in the delete body", async () => {
        render(<DeleteModal api_url="/products-out/abc" withReason />);
        const user = await openDialog();

        await user.type(screen.getByRole("textbox"), "  Wrong client  ");
        await user.click(confirmButton());

        await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ reason: "Wrong client" }));
    });

    it("sends no body when the optional reason is left empty", async () => {
        render(<DeleteModal api_url="/products-out/abc" withReason />);
        const user = await openDialog();

        await user.type(screen.getByRole("textbox"), "   ");
        await user.click(confirmButton());

        await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith(undefined));
    });

    it("limits the reason to 500 characters", async () => {
        render(<DeleteModal api_url="/products-out/abc" withReason />);
        await openDialog();

        expect(screen.getByRole("textbox").getAttribute("maxlength")).toBe("500");
    });

    it("does not show a reason field unless asked", async () => {
        render(<DeleteModal api_url="/payments/abc" />);
        const user = await openDialog();

        expect(screen.queryByRole("textbox")).toBeNull();
        await user.click(confirmButton());
        await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith(undefined));
    });

    it("clears the reason when the dialog is closed and opened again", async () => {
        render(<DeleteModal api_url="/products-out/abc" withReason />);
        const user = await openDialog();
        await user.type(screen.getByRole("textbox"), "Draft reason");

        await user.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
        await user.click(screen.getByRole("button"));

        expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
    });
});
