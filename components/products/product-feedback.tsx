"use client";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/card";
import MyButton from "@/components/my-button";

export default function ProductFeedback({ denied = false, retry }: { denied?: boolean; retry?: () => void }) {
    const { t } = useTranslation();
    return (
        <Card className="flex min-h-60 flex-1 items-center justify-center gap-3 p-6" role="alert">
            <p className="text-sm text-muted-foreground">{t(denied ? "product.denied" : "product.load_error")}</p>
            {retry && <MyButton action="sync" variant="outline" title="product.retry" onClick={retry} />}
        </Card>
    );
}

export function ProductBackgroundError({ failed, retry }: { failed: boolean; retry: () => void }) {
    const { t } = useTranslation();
    useEffect(() => {
        if (!failed) return;
        const notification = toast.error(
            <div className="space-y-2">
                <p>{t("product.load_error")}</p>
                <MyButton action="sync" variant="outline" title="product.retry" onClick={retry} />
            </div>,
            { autoClose: false },
        );
        return () => { toast.dismiss(notification); };
    }, [failed, retry, t]);
    return null;
}
