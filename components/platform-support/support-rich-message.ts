import MarkdownIt from "markdown-it";
import { supportAttachmentPath, type SupportImageAudience } from "@/lib/platform-support/attachment-transport";
import type { DraftImage, SupportAttachment } from "@/components/platform-support/support-model";

export const supportRichTextClass = "break-words text-sm leading-relaxed text-foreground [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:list-disc [&_ul]:ps-5";

const RICH_MESSAGE_PREFIX = "[platform-support:markdown:v1]\n";
const DRAFT_IMAGE = /!\[\]\(support-draft:([\da-f-]+)\)/gi;
const parser = new MarkdownIt({ html: false, breaks: true });
parser.disable(["link", "autolink"]);
type RichMessageEnvironment = {
    attachments: Map<string, SupportAttachment>;
    inlineIds: Set<string>;
    audience: SupportImageAudience;
};
parser.renderer.rules.image = (tokens, index, _options, env) => {
    const context = env as RichMessageEnvironment | undefined;
    if (!context) return "";
    const token = tokens[index];
    const id = String(token.attrGet("src") ?? "").match(/^support-attachment:([\da-f-]+)$/i)?.[1];
    const attachment = id ? context.attachments.get(id) : undefined;
    const path = attachment ? supportAttachmentPath(context.audience, attachment.uuid) : null;
    if (!attachment || !path) return "";
    context.inlineIds.add(attachment.uuid);
    const alt = parser.utils.escapeHtml(attachment.filename);
    const dimensions = attachment.width > 0 && attachment.height > 0
        && Number.isSafeInteger(attachment.width) && Number.isSafeInteger(attachment.height)
        ? ` width="${attachment.width}" height="${attachment.height}"` : "";
    return `<img src="${path}" alt="${alt}"${dimensions} />`;
};

export function encodeSupportRichMessage(markdown: string): string {
    const body = markdown.trim();
    return body ? RICH_MESSAGE_PREFIX + body : "";
}

export function resolveSupportDraftImages(body: string, images: readonly DraftImage[]): string {
    // Only replace editor-generated image destinations. Ordinary text stays intact.
    return body.replace(DRAFT_IMAGE, (_match, id: string) => {
        const image = images.find((item) => item.localId === id && item.status === "ready");
        return image?.uploadUuid ? `![](support-attachment:${image.uploadUuid})` : "";
    });
}

export function supportInlineDraftImages(body: string, images: readonly DraftImage[]): DraftImage[] {
    const ids = new Set(Array.from(body.matchAll(DRAFT_IMAGE), (match) => match[1]));
    return images.filter((image) => ids.has(image.localId));
}

export function renderSupportRichMessage(
    body: string | null,
    attachments: readonly SupportAttachment[],
    audience: SupportImageAudience,
) {
    if (!body?.startsWith(RICH_MESSAGE_PREFIX)) return null;
    const inlineIds = new Set<string>();
    const html = parser.render(body.slice(RICH_MESSAGE_PREFIX.length), {
        attachments: new Map(attachments.map((attachment) => [attachment.uuid, attachment])),
        inlineIds,
        audience,
    });
    return { html, attachments: attachments.filter((attachment) => !inlineIds.has(attachment.uuid)) };
}
