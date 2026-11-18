"use client";

import { useEffect, useId } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Bold, Heading2, Italic, List, ListOrdered, Strikethrough } from "lucide-react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import MyButton from "@/components/my-button";
import { cn } from "@/lib/utils";

const extensions = [
  StarterKit.configure({
    underline: false,
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    link: { openOnClick: false, protocols: ["help"] },
  }),
  Image,
  Markdown,
];

const formats = [
  { key: "bold", Icon: Bold, run: (editor: Editor) => editor.chain().focus().toggleBold().run() },
  { key: "italic", Icon: Italic, run: (editor: Editor) => editor.chain().focus().toggleItalic().run() },
  { key: "strike", Icon: Strikethrough, run: (editor: Editor) => editor.chain().focus().toggleStrike().run() },
  { key: "bulletList", Icon: List, run: (editor: Editor) => editor.chain().focus().toggleBulletList().run() },
  { key: "orderedList", Icon: ListOrdered, run: (editor: Editor) => editor.chain().focus().toggleOrderedList().run() },
  { key: "heading", Icon: Heading2, run: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
] as const;

export function HelpMarkdownEditor({ name, body }: { name: string; body: boolean }) {
  const { t } = useTranslation();
  const labelId = useId();
  const errorId = useId();
  const { field, fieldState } = useController({ name });
  const value = typeof field.value === "string" ? field.value : "";
  const height = body ? "h-36" : "h-20";
  const editor = useEditor({
    extensions,
    content: value,
    contentType: "markdown",
    immediatelyRender: false,
    onUpdate: ({ editor }) => field.onChange(editor.isEmpty ? "" : editor.getMarkdown()),
    onBlur: field.onBlur,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelId,
        "aria-describedby": errorId,
        class: cn(height, "overflow-y-auto break-words px-3 py-2 text-sm outline-none [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:ps-2 [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_img]:aspect-video [&_img]:w-40 [&_img]:object-contain [&_ol]:list-decimal [&_ol]:ps-5 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:ps-5"),
      },
    },
  });
  const active = useEditorState({
    editor,
    selector: ({ editor }) => formats.map(({ key }) => editor?.isActive(key) ?? false),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== (editor.isEmpty ? "" : editor.getMarkdown())) {
      editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) field.ref(editor.view.dom);
  }, [editor, field.ref]);

  return (
    <div className="min-w-0 space-y-1">
      <span id={labelId} className="text-sm font-medium">{t(`help.management.fields.${name}`)}</span>
      <div className={cn("overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring", fieldState.invalid && "border-destructive")}>
        <div role="group" aria-label={t("help.management.formatting")} className="flex flex-wrap gap-1 border-b border-border p-1">
          {formats.map(({ key, Icon, run }, index) => (body || key !== "heading") && (
            <MyButton key={key} type="button" variant="ghost" size="icon" className="size-8 aria-pressed:bg-muted"
              aria-label={t(key === "heading" ? "help.management.format_heading" : `platform_support.message.format.${key}`)}
              aria-pressed={active?.[index] ?? false} disabled={!editor}
              onMouseDown={(event) => event.preventDefault()} onClick={() => editor && run(editor)}>
              <Icon className="size-4" aria-hidden />
            </MyButton>
          ))}
        </div>
        {editor ? <EditorContent editor={editor} /> : <div className={height} />}
      </div>
      <p id={errorId} className="min-h-4 text-xs text-destructive" aria-live="polite">
        {fieldState.error?.message ? t(fieldState.error.message) : null}
      </p>
    </div>
  );
}
