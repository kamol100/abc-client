"use client";

import { useEffect } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import type { FormSchema } from "@/components/form-builder/core/form-schema";
import { detailUrlOf, entityIdOf } from "@/components/form-builder/core/request";
import { isDataComplete } from "@/components/form-builder/core/values";
import type { HydratePolicy } from "@/components/form-wrapper/form-builder-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";

type EntityLoadOptions = {
    form: UseFormReturn<FieldValues>;
    mode: "create" | "edit";
    api?: string;
    data?: Record<string, unknown>;
    queryKey: string;
    /** "never": use `data` as it is. "always": fetch. "ifNeeded": fetch when `data` is missing a field. */
    hydrateOnEdit: HydratePolicy;
    formSchema?: FormSchema;
    /** Converts the fetched record to form values (dates, related ids, defaults). */
    transformToFormValues?: (data: Record<string, unknown>) => Record<string, unknown>;
};

/**
 * Edit mode: fetches the record from `GET {api}/{id}` when the form needs it, and
 * fills the form with it. Create mode does nothing.
 */
export function useEntityLoad({
    form,
    mode,
    api,
    data,
    queryKey,
    hydrateOnEdit,
    formSchema,
    transformToFormValues,
}: EntityLoadOptions) {
    const entityId = entityIdOf(data);

    const shouldLoad =
        mode === "edit" &&
        hydrateOnEdit !== "never" &&
        !!entityId &&
        !!api &&
        (hydrateOnEdit === "always" || !isDataComplete(data, formSchema));

    const {
        data: detailResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useApiQuery<ApiResponse<Record<string, unknown>>>({
        queryKey: [queryKey, "detail", entityId],
        url: detailUrlOf(api, entityId),
        pagination: false,
        enabled: shouldLoad,
        staleTime: 30_000,
    });

    const failed = shouldLoad && isError;
    const { reset } = form;

    // Fill the form once the record arrives.
    useEffect(() => {
        if (!shouldLoad || !detailResponse?.data) return;
        const record = detailResponse.data as Record<string, unknown>;
        reset(transformToFormValues ? transformToFormValues(record) : record);
    }, [shouldLoad, detailResponse, transformToFormValues, reset]);

    useEffect(() => {
        if (failed && error) {
            toast.error(parseApiError(error));
        }
    }, [failed, error]);

    return {
        isLoading: shouldLoad && isLoading,
        failed,
        retry: refetch,
    };
}
