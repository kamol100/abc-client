"use client";

import { useRouter } from "next/navigation";
import MyButton from "@/components/my-button";
import { useTranslation } from "react-i18next";

function messageFromApiError(error: unknown): string | undefined {
    if (error == null) return undefined;
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message: unknown }).message;
        return typeof message === "string" ? message : undefined;
    }
    return undefined;
}

interface ImportClientImportErrorProps {
    error: unknown;
}

export function ImportClientImportError({ error }: ImportClientImportErrorProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const apiMessage = messageFromApiError(error);
    const displayMessage =
        apiMessage?.trim() || t("import_client.import_detail.load_failed");

    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    {t("import_client.import_detail.error_title")}
                </h1>
                <p className="text-destructive mb-4">{displayMessage}</p>
                <MyButton
                    action="cancel"
                    title={t("common.cancel")}
                    onClick={() => router.push("/import-client")}
                />
            </div>
        </div>
    );
}
