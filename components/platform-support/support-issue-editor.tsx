"use client";

import { useEffect, useId } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Bold, ImagePlus, Italic, List, ListOrdered, Strikethrough } from "lucide-react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import MyButton from "@/components/my-button";
import { encodeSupportRichMessage, supportRichTextClass } from "@/components/platform-support/support-rich-message";
import { cn } from "@/lib/utils";

const SupportDraftImage = Image.extend({
    addAttributes() {
        return { ...this.parent?.(), attachmentId: { default: null, rendered: false } };
    },
    // Image nodes only come from locally selected files handled by the upload flow.
    parseHTML: () => [],
    renderMarkdown: (node) => node.attrs?.attachmentId ? `![](support-draft:${node.attrs.attachmentId})` : "",
});

const extensions = [
    StarterKit.configure({
        link: false,
        underline: false,
        heading: { levels: [2, 3] },
    }),
    SupportDraftImage,
    Markdown,
];

const formatButtons = [
    { key: "bold", Icon: Bold, command: (editor: Editor) => editor.chain().focus().toggleBold().run() },
    { key: "italic", Icon: Italic, command: (editor: Editor) => editor.chain().focus().toggleItalic().run() },
    { key: "strike", Icon: Strikethrough, command: (editor: Editor) => editor.chain().focus().toggleStrike().run() },
    { key: "bulletList", Icon: List, command: (editor: Editor) => editor.chain().focus().toggleBulletList().run() },
    { key: "orderedList", Icon: ListOrdered, command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run() },
] as const;

export function SupportIssueEditor({ onEditor, onFiles, onAddImages }: {
    onEditor: (editor: Editor | null) => void;
    onFiles?: (files: File[]) => void;
    onAddImages?: () => void;
}) {
    const { t } = useTranslation();
    const labelId = useId();
    const errorId = useId();
    const { field, fieldState } = useController({ name: "body", defaultValue: "" });
    const editor = useEditor({
        extensions,
        immediatelyRender: false,
        onUpdate: ({ editor }) => field.onChange(editor.isEmpty ? "" : encodeSupportRichMessage(editor.getMarkdown())),
        onBlur: () => field.onBlur(),
        editorProps: {
            attributes: {
                role: "textbox",
                "aria-multiline": "true",
                "aria-labelledby": labelId,
                "aria-describedby": errorId,
                class: cn(supportRichTextClass, "min-h-24 max-h-64 overflow-y-auto px-3 py-2 outline-none [&_img]:h-24 [&_img]:w-40 [&_img]:object-contain"),
            },
            handlePaste: (_view, event) => {
                const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith("image/"));
                if (!onFiles || files.length === 0) return false;
                onFiles(files);
                return true;
            },
            handleDrop: (_view, event, _slice, moved) => {
                const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type.startsWith("image/"));
                if (moved || !onFiles || files.length === 0) return false;
                onFiles(files);
                return true;
            },
        },
    });
    const activeFormats = useEditorState({
        editor,
        selector: ({ editor }) => formatButtons.map(({ key }) => editor?.isActive(key) ?? false),
    });
    useEffect(() => {
        onEditor(editor);
        return () => onEditor(null);
    }, [editor, onEditor]);
    useEffect(() => {
        if (editor) field.ref(editor.view.dom);
    }, [editor, field.ref]);

    return (
        <div className="space-y-1.5">
            <span id={labelId} className="text-sm font-medium">{t("platform_support.message.label")}</span>
            <div className={cn("rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring", fieldState.invalid && "border-destructive")}>
                <div role="group" aria-label={t("platform_support.message.formatting")} className="flex flex-wrap gap-1 border-b border-border p-1">
                    {formatButtons.map(({ key, Icon, command }, index) => (
                        <MyButton key={key} type="button" variant="ghost" size="icon" className="size-8 aria-pressed:bg-muted"
                            aria-label={t(`platform_support.message.format.${key}`)} aria-pressed={activeFormats?.[index] ?? false}
                            disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor && command(editor)}>
                            <Icon className="size-4" aria-hidden />
                        </MyButton>
                    ))}
                    {onAddImages && (
                        <MyButton type="button" variant="ghost" className="h-8 px-2"
                            disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={onAddImages}>
                            <ImagePlus className="size-4" aria-hidden />
                            {t("platform_support.images.add")}
                        </MyButton>
                    )}
                </div>
                {editor ? <EditorContent editor={editor} /> : <div className="h-24" />}
            </div>
            <p id={errorId} className="min-h-4 text-xs text-destructive" aria-live="polite">
                {fieldState.error?.message ? t(fieldState.error.message) : null}
            </p>
        </div>
    );
}
