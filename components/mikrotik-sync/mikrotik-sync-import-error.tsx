"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";

function messageFromApiError(error: unknown): string | undefined {
  if (error == null) return undefined;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

export function MikrotikSyncImportError({ error }: { error: unknown }) {
  const router = useRouter();
  const { t } = useTranslation();
  const displayMessage =
    messageFromApiError(error)?.trim() || t("mikrotik_sync.import_detail.load_failed");

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("mikrotik_sync.import_detail.error_title")}</h1>
        <p className="mb-4 text-destructive">{displayMessage}</p>
        <MyButton
          action="cancel"
          title={t("common.cancel")}
          onClick={() => router.push("/mikrotik-sync")}
        />
      </div>
    </div>
  );
}
