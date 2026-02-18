"use client";

import { useFetch } from "@/app/actions";
import { Form } from "@/components/ui/form";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";
import ActionButton from "../action-button";
import { useDialogClose } from "../dialog";

type FormWrapperProps = {
    children?: ReactNode;
    data?: Record<string, unknown>;
    schema: z.ZodType;
    mode?: "create" | "edit";
    method?: "GET" | "POST" | "PUT";
    isOpen?: boolean;
    setOpen?: (value: boolean) => void;
    api?: string;
    isFormData?: boolean;
    queryKey?: string;
    onClose?: () => void;
    actionButton?: boolean;
    saveOnChange?: boolean;
    setSaveOnChange?: (x: boolean) => void;
    actionButtonClass?: string;
};

export default function FormWrapper({
    children,
    data,
    schema,
    mode = "create",
    method = "POST",
    api,
    isFormData = false,
    queryKey = "data",
    onClose,
    actionButton = true,
    saveOnChange: save = false,
    setSaveOnChange = () => { },
    actionButtonClass = "justify-between",
}: FormWrapperProps) {
    const dialogClose = useDialogClose();
    const handleClose = onClose ?? dialogClose ?? (() => { });

    const form = useForm<FieldValues>({
        resolver: zodResolver(schema as unknown as Parameters<typeof zodResolver<FieldValues, unknown, FieldValues>>[0]),
        mode: "onChange",
        defaultValues: data as Record<string, unknown>,
    });
    const { handleSubmit, reset } = form;
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const submitRef = useRef<HTMLInputElement>(null);

    let apiRoute = `${api}`;
    if (mode === "edit") {
        apiRoute = `${api}/${(data as Record<string, unknown> & { id?: string | number })?.id}`;
    }

    const fetchData = async () => {
        const result = await useFetch({ url: apiRoute });
        if (!result?.success) {
            toast.error(parseApiError(result));
            return [];
        }
        return result;
    };

    const { isLoading } = useQuery({
        queryKey: [queryKey],
        queryFn: fetchData,
        enabled: method === "GET",
        retry: 2,
    });

    const { mutate: submitForm, isPending } = useMutation({
        mutationFn: async (formData: FieldValues | FormData) => {
            const result = await useFetch({
                url: apiRoute,
                data: formData,
                method: mode === "edit" ? "PUT" : method,
            });
            if (!result.success) throw result;
            return result?.data;
        },
        onSuccess: (responseData: Record<string, unknown> | undefined) => {
            reset();
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            if (responseData?.message) {
                toast.success(t(String(responseData.message)));
            }
            handleClose();
        },
        onError: (error: unknown) => {
            toast.error(t(String(parseApiError(error))));
        },
    });

    const onSubmit = async (formValues: FieldValues) => {
        if (isFormData) {
            const fd = new FormData();
            Object.entries(formValues).forEach(([key, value]) => {
                fd.append(key, value as string);
            });
            submitForm(fd);
        } else {
            submitForm(formValues);
        }
    };

    useEffect(() => {
        if (save) {
            submitRef.current?.click();
            setSaveOnChange(false);
        }
    }, [save, setSaveOnChange]);

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
                {isLoading && <Loader2 className="animate-spin" />}
                {children}

                <input type="submit" className="hidden" ref={submitRef} />
                {actionButton && (
                    <div className={cn("flex justify-center gap-4 mt-5", actionButtonClass)}>
                        <ActionButton
                            action="cancel"
                            title={t("cancel")}
                            size="default"
                            onClick={handleClose}
                        />
                        <ActionButton
                            action="save"
                            title={t("save")}
                            size="default"
                            type="submit"
                            variant="default"
                            loading={isPending}
                        />
                    </div>
                )}
            </form>
        </Form>
    );
}
