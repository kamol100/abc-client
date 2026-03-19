"use client";

import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import useApiMutation from "@/hooks/use-api-mutation";
import { Form } from "@/components/ui/form";
import { FormLoader } from "@/components/loader";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useRef } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";
import MyButton from "@/components/my-button";
import { useMyDialogClose } from "@/components/my-dialog";
import {
    AccordionSection,
    FormFieldConfig,
    HydratePolicy,
} from "@/components/form-wrapper/form-builder-type";

// --- Hydration helpers ---

function flattenFields(
    formSchema?: FormFieldConfig[] | AccordionSection[]
): FormFieldConfig[] {
    if (!formSchema?.length) return [];
    if ("form" in formSchema[0]) {
        return (formSchema as AccordionSection[]).flatMap((s) => s.form);
    }
    return formSchema as FormFieldConfig[];
}

function getSourceKey(field: FormFieldConfig): string {
    if (field.type === "fieldArray") return field.name;
    if ("valueKey" in field && field.valueKey) return field.valueKey;
    return field.name;
}

function isDataComplete(
    data: Record<string, unknown> | undefined,
    formSchema?: FormFieldConfig[] | AccordionSection[]
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
    successMessage?: string;
    onClose?: () => void;
    actionButton?: boolean;
    saveOnChange?: boolean;
    setSaveOnChange?: (x: boolean) => void;
    actionButtonClass?: string;
    hydrateOnEdit?: HydratePolicy;
    formSchema?: FormFieldConfig[] | AccordionSection[];
    transformToFormValues?: (
        data: Record<string, unknown>
    ) => Record<string, unknown>;
    extraPayload?: Record<string, unknown>;
    transformPayload?: (values: FieldValues) => FieldValues;
    grids?: number;
    fullPage?: boolean;
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
    successMessage,
    onClose,
    actionButton = true,
    saveOnChange: save = false,
    setSaveOnChange = () => { },
    actionButtonClass = "justify-between",
    hydrateOnEdit = "ifNeeded",
    formSchema,
    transformToFormValues,
    extraPayload,
    transformPayload,
    grids = 1,
    fullPage = false,
}: FormWrapperProps) {
    const dialogClose = useMyDialogClose();
    const handleClose = onClose ?? dialogClose ?? (() => { });
    const { t } = useTranslation();
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

    console.log(detailResponse, 'detailResponse');

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

    const mutationMethod = mode === "edit" ? "PUT" : (method === "GET" ? "POST" : method);

    const { mutate: submitForm, isPending } = useApiMutation<
        { data?: Record<string, unknown>; message?: string },
        FieldValues | FormData
    >({
        url: apiRoute,
        method: mutationMethod as "POST" | "PUT" | "DELETE",
        invalidateKeys: queryKey,
        successMessage,
        onSuccess: (responseData) => {
            reset();
            if (!successMessage && responseData?.message) {
                toast.success(t(String(responseData.message)));
            }
            handleClose();
        },
    });

    const onSubmit = async (formValues: FieldValues) => {
        console.log(formValues, 'payload');
        const transformedValues = transformPayload
            ? transformPayload(formValues)
            : formValues;
        const payload =
            extraPayload && Object.keys(extraPayload).length > 0
                ? ({ ...transformedValues, ...extraPayload } as FieldValues)
                : transformedValues;

        if (isFormData) {
            const fd = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                fd.append(key, value as string);
            });
            submitForm(fd);
        } else {
            submitForm(payload);
        }
    };

    const onError = async (data: FieldValues) => {
        console.log(data, 'data');
    }

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

    const formContent = isHydrating ? (
        <FormLoader
            grids={grids}
            fieldCount={visibleFieldCount || 4}
        />
    ) : hydrationFailed ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-destructive">
                {t("common.failed_to_load_data")}
            </p>
            <div className="flex gap-2">
                <MyButton action="cancel" onClick={handleClose}>
                    {t("common.cancel")}
                </MyButton>
                <MyButton onClick={() => retryHydration()}>
                    {t("common.refresh")}
                </MyButton>
            </div>
        </div>
    ) : (
        children
    );

    const actionButtons = !isHydrating && !hydrationFailed && (
        <>
            <input type="submit" className="hidden" ref={submitRef} />
            {actionButton && (
                <div
                    className={cn(
                        "flex items-center gap-3 pt-4 mt-4 border-t bg-background",
                        fullPage ? "shrink-0" : "sticky bottom-0",
                        actionButtonClass
                    )}
                >
                    <MyButton
                        action="cancel"
                        type="button"
                        title={t("common.cancel")}
                        size="default"
                        onClick={handleClose}
                    />
                    <MyButton
                        action="save"
                        title={t("common.save")}
                        size="default"
                        type="submit"
                        variant="default"
                        loading={isPending}
                    />
                </div>
            )}
        </>
    );

    return (
        <Form {...form}>
            <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className={cn(fullPage && "flex flex-col flex-1 min-h-0")}
            >
                {fullPage ? (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {formContent}
                    </div>
                ) : (
                    formContent
                )}
                {actionButtons}
            </form>
        </Form>
    );
}
