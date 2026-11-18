import { describe, expect, it } from "vitest";
import { encodeSupportRichMessage, renderSupportRichMessage, resolveSupportDraftImages } from "@/components/platform-support/support-rich-message";
import type { DraftImage, SupportAttachment } from "@/components/platform-support/support-model";

const uuid = "11111111-1111-4111-8111-111111111111";
const filename = 'demo" onerror="alert(1).png';
const attachment: SupportAttachment = { uuid, filename, mime: "image/png", bytes: 50, width: 20, height: 10 };

describe("platform support rich messages", () => {
    it("shows formatting and only loads images attached to the same message", () => {
        const draft: DraftImage = {
            localId: "beef", name: filename, mime: "image/png", bytes: 50, status: "ready", uploadUuid: uuid,
        };
        const body = resolveSupportDraftImages(encodeSupportRichMessage(
            "**Steps**\n\n![](support-draft:beef)\n\n![](support-attachment:dead)\n\n![](https://example.test/track.png)\n\n<img src=x onerror=alert(1)>",
        ), [draft]);

        const message = renderSupportRichMessage(body, [attachment], "platform");
        expect(message?.html).toContain("<strong>Steps</strong>");
        expect(message?.html).toContain(`src="/api/platform-support-admin/attachments/${uuid}"`);
        expect(message?.html).toContain('width="20" height="10"');
        expect(message?.html.match(/<img /g)).toHaveLength(1);
        expect(message?.html).not.toContain(' onerror="alert');
        expect(message?.attachments).toEqual([]);
    });

    it("preserves the legacy text path and leaves ordinary attachments in the gallery", () => {
        expect(renderSupportRichMessage("**ordinary text**", [attachment], "requester")).toBeNull();
        expect(renderSupportRichMessage(encodeSupportRichMessage("**formatted**"), [attachment], "requester")?.attachments)
            .toEqual([attachment]);
    });
});
