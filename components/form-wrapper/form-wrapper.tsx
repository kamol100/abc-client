"use client";

import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useFetch } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect, useRef } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";
import ActionButton from "@/components/action-button";
import { useDialogClose } from "@/components/dialog";
import {
    AccordionSection,
    FieldConfig,
    GRID_STYLES,
    HydratePolicy,
} from "@/components/form-wrapper/form-builder-type";

// --- Hydration helpers ---

function flattenFields(
    formSchema?: FieldConfig[] | AccordionSection[]
): FieldConfig[] {
    if (!formSchema?.length) return [];
    if ("form" in formSchema[0]) {
        return (formSchema as AccordionSection[]).flatMap((s) => s.form);
    }
    return formSchema as FieldConfig[];
}

function getSourceKey(field: FieldConfig): string {
    if ("valueKey" in field && field.valueKey) return field.valueKey;
    return field.name;
}

function isDataComplete(
    data: Record<string, unknown> | undefined,
    formSchema?: FieldConfig[] | AccordionSection[]
): boolean {
    if (!data) return false;
    if (!formSchema) return true;
    const fields = flattenFields(formSchema);
    return fields
        .filter((f) => f.permission !== false)
        .every((field) => getSourceKey(field) in data);
}

function stripLeadingSlash(str: string): string {
    return str.startsWith("/") ? str.slice(1) : str;
}

// --- Form Skeleton ---

function FormSkeleton({
    grids = 1,
    fieldCount = 4,
}: {
    grids?: number;
    fieldCount?: number;
}) {
    return (
        <div
            className={`grid gap-4 m-auto ${GRID_STYLES[grids] ?? GRID_STYLES[1]} w-full`}
        >
            {Array.from({ length: fieldCount }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            ))}
        </div>
    );
}

// --- Props ---

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
    hydrateOnEdit?: HydratePolicy;
    formSchema?: FieldConfig[] | AccordionSection[];
    transformToFormValues?: (
        data: Record<string, unknown>
    ) => Record<string, unknown>;
    grids?: number;
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
    hydrateOnEdit = "ifNeeded",
    formSchema,
    transformToFormValues,
    grids = 1,
}: FormWrapperProps) {
    const dialogClose = useDialogClose();
    const handleClose = onClose ?? dialogClose ?? (() => { });
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const submitRef = useRef<HTMLInputElement>(null);

    const entityId = (
        data as Record<string, unknown> & { id?: string | number }
    )?.id;

    // --- Hydration decision ---
    const shouldHydrate =
        mode === "edit" &&
        hydrateOnEdit !== "never" &&
        !!entityId &&
        !!api &&
        (hydrateOnEdit === "always" || !isDataComplete(data, formSchema));

    const detailUrl = api
        ? `${stripLeadingSlash(api)}/${entityId}`
        : "";

    const {
        data: detailResponse,
        isLoading: isHydrationLoading,
        isError: isHydrationError,
        error: hydrationError,
        refetch: retryHydration,
    } = useApiQuery<ApiResponse<Record<string, unknown>>>({
        queryKey: [queryKey, "detail", entityId],
        url: detailUrl,
        pagination: false,
        enabled: shouldHydrate,
        staleTime: 30_000,
    });

    const isHydrating = shouldHydrate && isHydrationLoading;
    const hydrationFailed = shouldHydrate && isHydrationError;

    // --- Form setup ---
    const form = useForm<FieldValues>({
        resolver: zodResolver(
            schema as unknown as Parameters<
                typeof zodResolver<FieldValues, unknown, FieldValues>
            >[0]
        ),
        mode: "onChange",
        defaultValues: data as Record<string, unknown>,
    });
    const { handleSubmit, reset } = form;

    // --- Hydrate form values on fetch success ---
    useEffect(() => {
        if (!shouldHydrate || !detailResponse?.data) return;
        const entityData = detailResponse.data as Record<string, unknown>;
        const values = transformToFormValues
            ? transformToFormValues(entityData)
            : entityData;
        reset(values);
    }, [shouldHydrate, detailResponse, transformToFormValues, reset]);

    // --- Hydration error toast ---
    useEffect(() => {
        if (hydrationFailed && hydrationError) {
            toast.error(parseApiError(hydrationError));
        }
    }, [hydrationFailed, hydrationError]);

    // --- Mutation ---
    let apiRoute = `${api}`;
    if (mode === "edit") {
        apiRoute = `${api}/${entityId}`;
    }

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

    // --- Save on change ---
    useEffect(() => {
        if (save) {
            submitRef.current?.click();
            setSaveOnChange(false);
        }
    }, [save, setSaveOnChange]);

    // --- Visible field count for skeleton ---
    const visibleFieldCount = flattenFields(formSchema).filter(
        (f) => f.permission !== false
    ).length;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
                {isHydrating ? (
                    <FormSkeleton
                        grids={grids}
                        fieldCount={visibleFieldCount || 4}
                    />
                ) : hydrationFailed ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <p className="text-sm text-destructive">
                            {t("failed_to_load_data")}
                        </p>
                        <div className="flex gap-2">
                            <ActionButton
                                action="cancel"
                                onClick={handleClose}
                            >
                                {t("cancel")}
                            </ActionButton>
                            <ActionButton
                                onClick={() => retryHydration()}
                            >
                                {t("refresh")}
                            </ActionButton>
                        </div>
                    </div>
                ) : (
                    children
                )}

                {!isHydrating && !hydrationFailed && (
                    <>
                        <input
                            type="submit"
                            className="hidden"
                            ref={submitRef}
                        />
                        {actionButton && (
                            <div
                                className={cn(
                                    "flex justify-center gap-4 mt-5",
                                    actionButtonClass
                                )}
                            >
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
                    </>
                )}
            </form>
        </Form>
    );
}
