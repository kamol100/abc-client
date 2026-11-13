"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import {
    supportConvertFields,
    supportIssueFields,
    supportMessageFields,
    SupportConvertSchema,
    SupportIssueSchema,
    SupportMessageSchema,
} from "@/components/platform-support/support-form-schema";
import {
    addDraftImages,
    convertPayload,
    imageProgress,
    issueCreatePayload,
    markUploadResult,
    messagePayload,
    readUploadPayload,
    readyTokens,
    releasePreviewUrls,
    submitAttempt,
    supportContextPath,
    supportErrorKey,
    supportErrorParts,
    priorRequestDelivered,
    parseMessageWindow,
    resumedChatNeedsMessage,
    submissionAmbiguous,
    supportConflict,
    type DraftImage,
    type DraftSubmit,
} from "@/components/platform-support/support-model";
import { useFetch } from "@/app/actions";
import {
    deleteSupportUpload,
    supportAttachmentPath,
    supportImageErrorKey,
    uploadSupportImage,
    type SupportImageAudience,
} from "@/lib/platform-support/attachment-transport";
import { cn } from "@/lib/utils";

const PROGRESS_WIDTH = { 0: "w-0", 50: "w-1/2", 100: "w-full" } as const;

export function SupportText({ value }: { value: string | null | undefined }) {
    if (!value) return null;
    return <p className="whitespace-pre-wrap break-words text-sm text-foreground">{value}</p>;
}

export function SupportImageDraft({
    images,
    onChange,
    audience,
    draftId,
    threadId,
    disabled = false,
}: {
    images: DraftImage[];
    onChange: (updater: (current: DraftImage[]) => DraftImage[]) => void;
    audience: SupportImageAudience;
    draftId?: string;
    threadId?: string;
    disabled?: boolean;
}) {
    const { t } = useTranslation();
    const inputId = useId();
    const { register, setValue } = useFormContext();
    const files = useRef(new Map<string, File>());
    const previews = useRef(new Map<string, string>());
    const inflight = useRef(new Set<string>());
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const [rejected, setRejected] = useState<{ name: string; errorKey: string }[]>([]);

    useEffect(() => {
        register("attachment_count");
    }, [register]);

    useEffect(() => {
        const countable = images.filter((image) => image.status !== "failed").length;
        setValue("attachment_count", countable, { shouldValidate: false });
    }, [images, setValue]);

    useEffect(() => {
        const urls = previews.current;
        return () => releasePreviewUrls(urls.values(), (url) => URL.revokeObjectURL(url));
    }, []);

    useEffect(() => {
        const pending = images.filter((image) => image.status === "pending" && !inflight.current.has(image.localId));
        for (const image of pending) {
            const file = files.current.get(image.localId);
            if (!file) continue;
            inflight.current.add(image.localId);
            onChangeRef.current((current) => current.map((item) => (
                item.localId === image.localId ? { ...item, status: "uploading" } : item
            )));
            void uploadSupportImage({
                audience,
                file,
                filename: file.name,
                draftId,
                threadId,
            }).then((result) => {
                inflight.current.delete(image.localId);
                const uploaded = readUploadPayload(result.body);
                const code = result.body && typeof result.body === "object"
                    ? (result.body as { error?: { code?: string } }).error?.code
                    : undefined;
                onChangeRef.current((current) => markUploadResult(
                    current,
                    image.localId,
                    result.ok && uploaded
                        ? { ok: true, uploadUuid: uploaded.uploadUuid, uploadToken: uploaded.uploadToken }
                        : { ok: false, errorKey: supportImageErrorKey(code) },
                ));
            });
        }
    }, [audience, draftId, images, threadId]);

    const rememberPreview = (localId: string, file: File) => {
        const existing = previews.current.get(localId);
        if (existing) return existing;
        const url = URL.createObjectURL(file);
        previews.current.set(localId, url);
        return url;
    };

    const onFiles = (list: FileList | null) => {
        const selected = [...(list ?? [])];
        if (selected.length === 0 || disabled) return;
        const incoming = selected.map((file) => ({
            localId: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
        }));
        const next = addDraftImages(images, incoming);
        incoming.forEach((file, index) => {
            if (!next.images.some((image) => image.localId === file.localId)) return;
            files.current.set(file.localId, selected[index]);
            rememberPreview(file.localId, selected[index]);
        });
        setRejected(next.errors);
        onChange(() => next.images);
    };

    const removeImage = async (image: DraftImage) => {
        if (image.uploadUuid) {
            const result = await deleteSupportUpload({ audience, uploadId: image.uploadUuid });
            if (!result.ok) {
                const code = result.body && typeof result.body === "object"
                    ? (result.body as { error?: { code?: string } }).error?.code
                    : undefined;
                onChange((current) => current.map((item) => (
                    item.localId === image.localId ? { ...item, errorKey: supportImageErrorKey(code) } : item
                )));
                return;
            }
        }
        const preview = previews.current.get(image.localId);
        if (preview) {
            URL.revokeObjectURL(preview);
            previews.current.delete(image.localId);
        }
        files.current.delete(image.localId);
        inflight.current.delete(image.localId);
        onChange((current) => current.filter((item) => item.localId !== image.localId));
    };

    const retryImage = (localId: string) => {
        inflight.current.delete(localId);
        onChange((current) => current.map((image) => (
            image.localId === localId ? { ...image, status: "pending", errorKey: undefined, uploadToken: undefined } : image
        )));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <label
                    htmlFor={inputId}
                    className={cn(
                        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground",
                        disabled && "pointer-events-none opacity-50",
                    )}
                >
                    <ImagePlus className="h-4 w-4" aria-hidden />
                    {t("platform_support.images.add")}
                </label>
                <input
                    id={inputId}
                    data-testid="support-image-input"
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    multiple
                    disabled={disabled}
                    onChange={(event) => {
                        onFiles(event.target.files);
                        event.target.value = "";
                    }}
                />
                <span className="text-xs text-muted-foreground">{t("platform_support.images.limit")}</span>
            </div>
            {rejected.map((error) => (
                <p key={`${error.name}-${error.errorKey}`} className="text-sm text-destructive" role="alert">
                    {error.name}: {t(error.errorKey)}
                </p>
            ))}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image) => {
                    const preview = previews.current.get(image.localId);
                    const progress = imageProgress(image.status);
                    return (
                        <li key={image.localId} data-testid={`support-image-${image.status}`} className="space-y-2 rounded-md border border-border p-2">
                            {preview ? (
                                // Local preview only. Sent images use the authenticated attachment route.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={preview} alt={image.name} className="h-24 w-full rounded-md object-cover" />
                            ) : (
                                <div className="flex h-24 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">{image.name}</div>
                            )}
                            <p className="truncate text-xs text-foreground">{image.name}</p>
                            <p className="text-xs text-muted-foreground">{t(`platform_support.images.${image.status}`)}</p>
                            <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                                <div className={cn("h-full bg-primary", PROGRESS_WIDTH[progress])} />
                            </div>
                            {image.errorKey && <p className="text-xs text-destructive">{t(image.errorKey)}</p>}
                            <div className="flex gap-2">
                                {image.status === "failed" && (
                                    <MyButton type="button" variant="outline" onClick={() => retryImage(image.localId)}>
                                        {t("platform_support.images.retry")}
                                    </MyButton>
                                )}
                                <MyButton type="button" variant="ghost" onClick={() => void removeImage(image)} aria-label={t("platform_support.images.remove")}>
                                    <X className="h-4 w-4" />
                                </MyButton>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function SupportAttachmentGallery({
    attachments,
    audience,
}: {
    attachments: { uuid: string; filename: string }[];
    audience: SupportImageAudience;
}) {
    const { t } = useTranslation();
    const [openId, setOpenId] = useState<string | null>(null);
    if (attachments.length === 0) return null;
    return (
        <ul className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
                const path = supportAttachmentPath(audience, attachment.uuid);
                if (!path) return null;
                return (
                    <li key={attachment.uuid}>
                        <MyDialog
                            open={openId === attachment.uuid}
                            onOpenChange={(open) => setOpenId(open ? attachment.uuid : null)}
                            title="platform_support.images.preview"
                            showFooter={false}
                            size="xl"
                            trigger={(
                                <button type="button" className="overflow-hidden rounded-md border border-border">
                                    {/* Authenticated same-origin image. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={path} alt={attachment.filename} className="h-20 w-20 object-cover" />
                                </button>
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={path} alt={attachment.filename} className="max-h-[70vh] w-full object-contain" />
                            <a href={path} download={attachment.filename} className="mt-3 inline-flex text-sm text-foreground underline">
                                {t("platform_support.images.download")}
                            </a>
                        </MyDialog>
                    </li>
                );
            })}
        </ul>
    );
}

export function SupportComposer({
    mode,
    api,
    threadId,
    draftId,
    version = 1,
    onAcknowledged,
    onConflict,
    onReconciled,
}: {
    mode: "issue" | "message" | "convert";
    api: string;
    threadId?: string;
    draftId?: string;
    version?: number;
    onAcknowledged?: (response: Record<string, unknown> | undefined) => void;
    onConflict?: () => void;
    onReconciled?: (messages: ReturnType<typeof parseMessageWindow>) => void;
}) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const [images, setImages] = useState<DraftImage[]>([]);
    const [notice, setNotice] = useState<string | null>(null);
    const [draft] = useState(() => draftId ?? crypto.randomUUID());
    const pendingRef = useRef<DraftSubmit | null>(null);
    const imagesRef = useRef(images);
    imagesRef.current = images;
    const versionRef = useRef(version);
    versionRef.current = version;
    const schema = mode === "issue" ? SupportIssueSchema : mode === "convert" ? SupportConvertSchema : SupportMessageSchema;
    const fields: FormFieldConfig[] = mode === "issue"
        ? supportIssueFields()
        : mode === "convert"
            ? supportConvertFields()
            : supportMessageFields();

    const preparePayload = async (values: FieldValues) => {
        if (imagesRef.current.some((image) => image.status === "pending" || image.status === "uploading")) {
            setNotice("platform_support.composer.wait_for_uploads");
            return false;
        }
        const body = String(values.body ?? values.subject ?? "");
        const tokens = readyTokens(imagesRef.current);
        const decision = submitAttempt(pendingRef.current, `${body}\n${tokens.join("\n")}`, tokens, crypto.randomUUID());
        if (decision.reconcileFirst && pendingRef.current && threadId) {
            const previousId = pendingRef.current.clientRequestId;
            const page = await useFetch({ url: `/platform-support/threads/${threadId}/messages?limit=50` });
            const window = parseMessageWindow(page?.data);
            if (!page?.success || !window) {
                setNotice("platform_support.composer.ambiguous");
                return false;
            }
            if (priorRequestDelivered(window.data, previousId)) {
                setNotice("platform_support.composer.already_sent");
                onReconciled?.(window);
            } else {
                setNotice("platform_support.composer.ambiguous");
            }
        } else if (decision.reconcileFirst) {
            setNotice("platform_support.composer.ambiguous");
        }
        pendingRef.current = decision.request;
        return values;
    };

    const transformPayload = (values: FieldValues) => {
        const pending = pendingRef.current;
        const requestId = pending?.clientRequestId ?? crypto.randomUUID();
        const tokens = pending?.tokens ?? readyTokens(imagesRef.current);
        const body = String(values.body ?? "");
        if (mode === "issue") {
            return issueCreatePayload({
                subject: String(values.subject ?? ""),
                category: String(values.category ?? ""),
                priority: String(values.priority ?? "normal"),
                body,
                tokens,
                clientRequestId: requestId,
                draftId: draft,
                path: supportContextPath(pathname),
            });
        }
        if (mode === "convert") {
            return convertPayload({
                subject: String(values.subject ?? ""),
                category: String(values.category ?? ""),
                priority: String(values.priority ?? "normal"),
                expectedVersion: versionRef.current,
                clientRequestId: requestId,
            });
        }
        return messagePayload({ body, tokens, clientRequestId: requestId });
    };

    return (
        <div className="space-y-3">
            {notice && (
                <p role="status" className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                    {t(notice)}
                </p>
            )}
            <FormBuilder
                formSchema={fields}
                schema={schema}
                api={api}
                method="POST"
                mode="create"
                skipInvalidate
                resetOnSuccess={mode !== "issue"}
                submitTitle="platform_support.composer.send"
                successMessage={mode === "convert" ? undefined : "platform_support.composer.sent"}
                data={mode === "message" ? { attachment_count: 0 } : { priority: "normal", category: "general", attachment_count: 0 }}
                preparePayload={preparePayload}
                transformPayload={transformPayload}
                onSubmitError={(error) => {
                    if (pendingRef.current && submissionAmbiguous(error)) {
                        pendingRef.current = { ...pendingRef.current, ambiguous: true };
                    }
                    if (supportConflict(error)) {
                        setNotice("platform_support.errors.version_conflict");
                        onConflict?.();
                        return;
                    }
                    setNotice(submissionAmbiguous(error)
                        ? "platform_support.composer.ambiguous"
                        : supportErrorKey(supportErrorParts(error).code));
                }}
                onSuccess={(response, payload) => {
                    if (response && payload && resumedChatNeedsMessage(response, payload)) {
                        setNotice("platform_support.chat.resumed_unsent");
                        return;
                    }
                    pendingRef.current = null;
                    setNotice(null);
                    setImages((current) => current.filter((image) => image.status === "failed"));
                    onAcknowledged?.(response);
                }}
            >
                {(renderField) => (
                    <div className="grid gap-4">
                        {fields.map((field) => (
                            <div key={field.name}>{renderField(field)}</div>
                        ))}
                        {mode !== "convert" && (
                            <SupportImageDraft
                                images={images}
                                onChange={setImages}
                                audience="requester"
                                draftId={mode === "issue" ? draft : undefined}
                                threadId={mode === "message" ? threadId : undefined}
                            />
                        )}
                    </div>
                )}
            </FormBuilder>
        </div>
    );
}
