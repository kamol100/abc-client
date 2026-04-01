"use client";

import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useFetch } from "@/app/actions";
import MyButton from "@/components/my-button";
import { parseApiError } from "@/lib/helper/helper";

type CompanyProfileAssetType = "logo" | "favicon";
type CompanyProfileAssetScope = "company" | "reseller";

type CompanyProfileLogoUploadProps = {
  type: CompanyProfileAssetType;
  companyId: string;
  scope: CompanyProfileAssetScope;
  value?: string | null;
};

type UploadResponse = {
  success?: boolean;
  data?: Record<string, unknown>;
  message?: string;
};

function toAssetUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API ?? "").trim().replace(/\/$/, "");
  if (!base) return trimmed;
  return `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

const CompanyProfileLogoUpload: FC<CompanyProfileLogoUploadProps> = ({
  type,
  companyId,
  scope,
  value,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => toAssetUrl(value));

  useEffect(() => {
    setPreviewUrl(toAssetUrl(value));
    setSelectedFile(null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadEndpoint = useMemo(
    () => `/${scope}-upload-image/${companyId}?_method=PUT`,
    [companyId, scope]
  );

  const { mutate: uploadAsset, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append(type, file);
      const response = (await useFetch({
        url: uploadEndpoint,
        method: "PUT",
        data: formData,
      })) as UploadResponse;

      if (!response?.success) {
        throw response;
      }
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      toast.success(t(`company_profile.${type}.messages.upload_success`));
      window.location.reload();
    },
    onError: (error) => {
      toast.error(
        String(
          parseApiError(error) ||
          t(`company_profile.${type}.messages.upload_failed`)
        )
      );
    },
  });

  const { mutate: deleteAsset, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = (await useFetch({
        url: uploadEndpoint,
        method: "DELETE",
        data: {
          [type]: [type],
        },
      })) as UploadResponse;

      if (!response?.success) {
        throw response;
      }
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      toast.success(t(`company_profile.${type}.messages.delete_success`));
      window.location.reload();
    },
    onError: (error) => {
      toast.error(
        String(
          parseApiError(error) ||
          t(`company_profile.${type}.messages.delete_failed`)
        )
      );
    },
  });

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{t(`company_profile.${type}.label`)}</p>

      <div className="rounded-md border p-3">
        <div className="flex items-center gap-3">
          <div
            className={`overflow-hidden rounded-md border bg-muted/20 flex items-center justify-center ${type === "favicon" ? "size-14" : "h-14 w-28"
              }`}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={t(`company_profile.${type}.label`)}
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {previewUrl
                ? t(`company_profile.${type}.messages.preview_ready`)
                : t(`company_profile.${type}.messages.empty`)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <MyButton
            type="button"
            variant="outline"
            action="edit"
            title={`company_profile.${type}.actions.choose`}
            onClick={() => fileInputRef.current?.click()}
          />

          <MyButton
            type="button"
            action="save"
            title={`company_profile.${type}.actions.upload`}
            loading={isUploading}
            disabled={!selectedFile || isDeleting}
            onClick={() => selectedFile && uploadAsset(selectedFile)}
          />

          <MyButton
            type="button"
            action="delete"
            variant="destructive"
            title={`company_profile.${type}.actions.delete`}
            loading={isDeleting}
            disabled={!previewUrl || isUploading}
            onClick={() => deleteAsset()}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileLogoUpload;
