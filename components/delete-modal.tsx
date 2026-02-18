"use client";

import { useFetch } from "@/app/actions";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { DialogWrapper } from "./dialog";
import { Button } from "./ui/button";
import ActionButton from "./action-button";

export type DeleteModalProps = {
    api_url: string;
    message?: string;
    confirmMessage?: string;
    keys?: string;
    redirectTo?: string;
    buttonText?: string;
    children?: ReactNode;
};

export function DeleteModal({
    api_url,
    message,
    confirmMessage,
    keys,
    redirectTo,
    buttonText,
    children,
}: DeleteModalProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutateAsync: deleteItem, isPending } = useMutation({
        mutationFn: async () => {
            const url = api_url.startsWith("/") ? api_url : `/${api_url}`;
            const result = await useFetch({ url, method: "DELETE" });
            if (!result?.success) throw result;
            return result;
        },
        onSuccess: () => {
            if (keys) {
                keys.split(",").forEach((key) =>
                    queryClient.invalidateQueries({ queryKey: [key.trim()] })
                );
            }
            if (redirectTo) router.push(redirectTo);
            toast.success(message ? t(message) : t("item_deleted_successfully"));
        },
        onError: (error: unknown) => {
            const errorMsg = parseApiError(error);
            toast.error(t(String(errorMsg || "delete_failed")));
        },
    });

    return (
        <DialogWrapper
            trigger={
                children ?? (
                    <ActionButton action="delete" icon={true}>
                        {children}
                    </ActionButton>
                )
            }
            title="confirm_delete"
            description={confirmMessage ?? "delete_confirmation_message"}
            variant="destructive"
            onConfirm={() => deleteItem()}
            confirmText={buttonText ?? "submit"}
            loading={isPending}
            size="sm"
        />
    );
}
