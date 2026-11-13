import { SupportComposer, SupportImageDraft, SupportText } from "@/components/platform-support/support-composer";
import type { DraftImage } from "@/components/platform-support/support-model";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({}),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({ mutate, isPending: false }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/lib/platform-support/attachment-transport", () => ({
    uploadSupportImage: vi.fn(async () => ({ ok: true, status: 200, body: { data: { upload_uuid: "u", upload_token: "t" } } })),
    deleteSupportUpload: vi.fn(async () => ({ ok: true, status: 200, body: {} })),
    supportAttachmentPath: () => "/api/platform-support/attachments/u",
    supportImageErrorKey: () => "platform_support.errors.image_invalid",
}));

function FormHarness({ images, onChange }: { images: DraftImage[]; onChange: (updater: (current: DraftImage[]) => DraftImage[]) => void }) {
    const form = useForm({ defaultValues: { attachment_count: 0, body: "" } });
    return (
        <FormProvider {...form}>
            <SupportImageDraft images={images} onChange={onChange} audience="requester" draftId="draft-1" />
        </FormProvider>
    );
}

describe("platform support composer keyboard", () => {
    it("sends a chat with Enter and keeps Shift+Enter and IME composition available", async () => {
        mutate.mockClear();
        const user = userEvent.setup();
        render(<SupportComposer mode="message" api="messages" allowImages={false} sendOnEnter />);
        const message = screen.getByRole("textbox");

        await user.click(message);
        await user.keyboard("{Enter}");
        expect(await screen.findByText("platform_support.message.errors.required")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();

        await user.type(message, "First line{Shift>}{Enter}{/Shift}Second line");
        expect(message).toHaveValue("First line\nSecond line");
        expect(fireEvent.keyDown(message, { key: "Enter", isComposing: true })).toBe(true);
        expect(fireEvent.keyDown(message, { key: "Enter", repeat: true })).toBe(false);
        expect(mutate).not.toHaveBeenCalled();

        await user.keyboard("{Enter}{Enter}");
        await waitFor(() => expect(mutate).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ body: "First line\nSecond line" }),
        ));
    });

    it("keeps plain Enter as a newline in issue replies", async () => {
        mutate.mockClear();
        const user = userEvent.setup();
        render(<SupportComposer mode="message" api="messages" allowImages={false} />);
        const message = screen.getByRole("textbox");

        await user.type(message, "First line{Enter}Second line");
        expect(message).toHaveValue("First line\nSecond line");
        expect(mutate).not.toHaveBeenCalled();
    });
});

describe("platform support image composer", () => {
    it("renders message text without interpreting markup", () => {
        const { container } = render(<SupportText value={"<b>hello</b>\nnext"} />);
        expect(container.querySelector("b")).toBeNull();
        expect(container.querySelector("p")?.textContent).toBe("<b>hello</b>\nnext");
    });

    it("shows a failed upload beside a ready image and can remove the ready one before send", async () => {
        const user = userEvent.setup();
        const images: DraftImage[] = [
            { localId: "ready", name: "ready.png", bytes: 10, mime: "image/png", status: "ready", uploadToken: "token", uploadUuid: "11111111-1111-4111-8111-111111111111" },
            { localId: "failed", name: "failed.png", bytes: 10, mime: "image/png", status: "failed", errorKey: "platform_support.errors.image_invalid" },
        ];
        const onChange = vi.fn();
        render(<FormHarness images={images} onChange={onChange} />);

        expect(screen.getByTestId("support-image-ready")).toBeInTheDocument();
        expect(screen.getByTestId("support-image-failed")).toBeInTheDocument();
        expect(screen.getByText("platform_support.images.ready")).toBeInTheDocument();
        expect(screen.getByText("platform_support.images.failed")).toBeInTheDocument();

        await user.click(screen.getAllByRole("button", { name: "platform_support.images.remove" })[0]);
        await waitFor(() => expect(onChange).toHaveBeenCalled());
    });
});
