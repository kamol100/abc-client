"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import {
  clientImageFields,
  type ClientImageFieldName,
} from "@/components/clients/client-form-schema";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ClientImageResult = {
  field: string;
  value: string | null;
};

type ImageFieldConfig = (typeof clientImageFields)[number];

function storedImage(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function imageFileError(file: File): "client.images.invalid_type" | "client.images.too_large" | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return "client.images.invalid_type";
  if (file.size > MAX_IMAGE_BYTES) return "client.images.too_large";
  return null;
}

function clientImageSrc(clientId: string, field: ClientImageFieldName, version: string): string {
  return `/api/clients/${encodeURIComponent(clientId)}/images/${field}?v=${encodeURIComponent(version)}`;
}

function ClientImageField({
  field,
  clientId,
  canModify,
}: {
  field: ImageFieldConfig;
  clientId?: string;
  canModify: boolean;
}) {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const watched = useWatch({ name: field.name });
  const stored = storedImage(watched);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [stored]);

  const upload = useApiMutation<ClientImageResult, FormData>({
    url: clientId ? `/clients/${clientId}/images/${field.name}` : "/clients",
    method: "POST",
    successMessage: "client.images.upload_success",
    defaultErrorMessage: "client.images.upload_failed",
    onSuccess: (data) => {
      if (typeof data?.value === "string" && data.value !== "") {
        setValue(field.name, data.value, { shouldDirty: false, shouldValidate: false });
      }
    },
  });

  const remove = useApiMutation<ClientImageResult>({
    url: clientId ? `/clients/${clientId}/images/${field.name}` : "/clients",
    method: "DELETE",
    successMessage: "client.images.remove_success",
    defaultErrorMessage: "client.images.remove_failed",
    onSuccess: () => {
      setValue(field.name, null, { shouldDirty: false, shouldValidate: false });
    },
  });

  const busy = upload.isPending || remove.isPending;
  const hasImage = Boolean(stored) && Boolean(clientId);
  const showPreview = hasImage && !broken;

  const openPicker = () => {
    if (!canModify || busy) return;
    inputRef.current?.click();
  };

  const uploadFile = async (file: File | null) => {
    if (!file || !clientId || !canModify || busyRef.current || busy) return;
    const errorKey = imageFileError(file);
    if (errorKey) {
      toast.error(t(errorKey));
      return;
    }

    busyRef.current = true;
    const body = new FormData();
    body.append("file", file);
    try {
      await upload.mutateAsync(body);
    } catch {
      // The mutation already shows the error toast.
    } finally {
      busyRef.current = false;
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0) ?? null;
    void uploadFile(file);
  };

  const onDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canModify || busy) return;
    setDragging(true);
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const file = event.dataTransfer.files.item(0);
    void uploadFile(file);
  };

  const confirmRemove = async (close: () => void) => {
    if (!clientId || busyRef.current) return;
    busyRef.current = true;
    try {
      await remove.mutateAsync();
      close();
    } catch {
      // The mutation already shows the error toast and keeps the preview.
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="min-w-0 space-y-2">
      <p className="text-sm font-medium">{t(field.label)}</p>
      <div className="relative">
        {showPreview && clientId && stored ? (
          <div className={cn("w-full overflow-hidden rounded-md border bg-muted", field.aspect)}>
            <img
              src={clientImageSrc(clientId, field.name, stored)}
              alt={t(field.label)}
              className="h-full w-full object-contain"
              onError={() => setBroken(true)}
            />
          </div>
        ) : (
          <button
            type="button"
            disabled={!canModify || busy}
            aria-label={t(field.label)}
            onClick={openPicker}
            onDragEnter={onDragOver}
            onDragOver={onDragOver}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 text-center text-sm text-muted-foreground",
              field.aspect,
              dragging && "border-primary bg-muted",
              (!canModify || busy) && "cursor-not-allowed opacity-70"
            )}
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span>
              {busy
                ? t("client.images.uploading")
                : clientId
                  ? t("client.images.empty")
                  : t("client.images.save_first")}
            </span>
          </button>
        )}

        {busy && showPreview && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {hasImage && canModify && (
          <MyButton
            type="button"
            action="cancel"
            size="icon"
            variant="outline"
            tooltip="client.images.remove"
            aria-label={t("client.images.remove")}
            disabled={busy}
            className="absolute right-1.5 top-1.5 z-10 size-7 bg-background"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setConfirmOpen(true);
            }}
          />
        )}
      </div>

      {broken && (
        <p className="text-xs text-destructive">{t("client.images.unavailable")}</p>
      )}

      <p className="text-xs text-muted-foreground">{t(field.hint)}</p>

      {canModify && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={onFileChange}
          disabled={busy}
        />
      )}

      {hasImage && canModify && (
        <MyButton
          type="button"
          action="edit"
          variant="outline"
          title="client.images.replace"
          disabled={busy}
          onClick={openPicker}
        />
      )}

      <MyDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="client.images.remove_title"
        description="client.images.remove_confirm"
        variant="destructive"
        size="sm"
        loading={remove.isPending}
        footer={({ close, loading }) => (
          <>
            <MyButton
              type="button"
              action="cancel"
              variant="outline"
              title="common.cancel"
              disabled={loading}
              onClick={close}
            />
            <MyButton
              type="button"
              action="delete"
              variant="destructive"
              title="common.delete"
              loading={loading}
              onClick={() => void confirmRemove(close)}
            />
          </>
        )}
      />
    </div>
  );
}

export default function ClientImageFields() {
  const params = useParams<{ id?: string }>();
  const clientId = typeof params?.id === "string" && params.id !== "" ? params.id : undefined;
  const { hasPermission } = usePermissions();
  const canModify = Boolean(clientId) && (
    hasPermission("clients.edit") || hasPermission("clients.image.upload")
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clientImageFields.map((field) => (
        <ClientImageField
          key={field.name}
          field={field}
          clientId={clientId}
          canModify={canModify}
        />
      ))}
    </div>
  );
}
