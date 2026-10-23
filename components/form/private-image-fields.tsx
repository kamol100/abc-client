"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import {
  privateImageFileError,
  privateImageSrc,
  storedPrivateImage,
  type PrivateImageFieldName,
} from "@/lib/images/private-image";
import { cn } from "@/lib/utils";

type PrivateImageResult = {
  field: string;
  value: string | null;
};

export type PrivateImageFieldConfig = {
  name: PrivateImageFieldName;
  label: string;
  hint: string;
  aspect: string;
};

type PrivateImageFieldsProps = {
  fields: readonly PrivateImageFieldConfig[];
  resource: "clients" | "staffs";
  editPermission: string;
  uploadPermission: string;
  messagePrefix: string;
};

function PrivateImageField({
  field,
  recordId,
  resource,
  canModify,
  messagePrefix,
}: {
  field: PrivateImageFieldConfig;
  recordId?: string;
  resource: "clients" | "staffs";
  canModify: boolean;
  messagePrefix: string;
}) {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const watched = useWatch({ name: field.name });
  const stored = storedPrivateImage(watched);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const message = (key: string) => `${messagePrefix}.${key}`;

  useEffect(() => {
    setBroken(false);
  }, [stored]);

  const upload = useApiMutation<PrivateImageResult, FormData>({
    url: recordId ? `/${resource}/${recordId}/images/${field.name}` : `/${resource}`,
    method: "POST",
    successMessage: message("upload_success"),
    defaultErrorMessage: message("upload_failed"),
    onSuccess: (data) => {
      if (typeof data?.value === "string" && data.value !== "") {
        setValue(field.name, data.value, { shouldDirty: false, shouldValidate: false });
      }
    },
  });

  const remove = useApiMutation<PrivateImageResult>({
    url: recordId ? `/${resource}/${recordId}/images/${field.name}` : `/${resource}`,
    method: "DELETE",
    successMessage: message("remove_success"),
    defaultErrorMessage: message("remove_failed"),
    onSuccess: () => {
      setValue(field.name, null, { shouldDirty: false, shouldValidate: false });
    },
  });

  const busy = upload.isPending || remove.isPending;
  const hasImage = Boolean(stored) && Boolean(recordId);
  const showPreview = hasImage && !broken;

  const openPicker = () => {
    if (!canModify || busy) return;
    inputRef.current?.click();
  };

  const uploadFile = async (file: File | null) => {
    if (!file || !recordId || !canModify || busyRef.current || busy) return;
    const errorKey = privateImageFileError(file);
    if (errorKey) {
      toast.error(t(message(errorKey)));
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
    if (!recordId || busyRef.current) return;
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
        {showPreview && recordId && stored ? (
          <div className={cn("w-full overflow-hidden rounded-md border bg-muted", field.aspect)}>
            <img
              src={privateImageSrc(resource, recordId, field.name, stored)}
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
                ? t(message("uploading"))
                : recordId
                  ? t(message("empty"))
                  : t(message("save_first"))}
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
            tooltip={message("remove")}
            aria-label={t(message("remove"))}
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
        <p className="text-xs text-destructive">{t(message("unavailable"))}</p>
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
          title={message("replace")}
          disabled={busy}
          onClick={openPicker}
        />
      )}

      <MyDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={message("remove_title")}
        description={message("remove_confirm")}
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

export default function PrivateImageFields({
  fields,
  resource,
  editPermission,
  uploadPermission,
  messagePrefix,
}: PrivateImageFieldsProps) {
  const params = useParams<{ id?: string }>();
  const recordId = typeof params?.id === "string" && params.id !== "" ? params.id : undefined;
  const { hasPermission } = usePermissions();
  const canModify = Boolean(recordId) && (
    hasPermission(editPermission) || hasPermission(uploadPermission)
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => (
        <PrivateImageField
          key={field.name}
          field={field}
          recordId={recordId}
          resource={resource}
          canModify={canModify}
          messagePrefix={messagePrefix}
        />
      ))}
    </div>
  );
}
