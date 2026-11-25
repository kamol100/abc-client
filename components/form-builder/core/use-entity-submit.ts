"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { buildPayload, toFormData } from "@/components/form-builder/core/payload";
import { entityIdOf, saveRequestOf } from "@/components/form-builder/core/request";
import useApiMutation from "@/hooks/use-api-mutation";
import { serverFieldErrors } from "@/lib/helper/helper";

type EntitySubmitOptions = {
    form: UseFormReturn<FieldValues>;
    api?: string;
    mode: "create" | "edit";
    method: "GET" | "POST" | "PUT";
    data?: Record<string, unknown>;
    queryKey: string;
    isFormData: boolean;
    successMessage?: string;
    /** Closes the form: the caller's `onClose`, or the surrounding dialog. */
    onClose: () => void;
    onSuccess?: (response: Record<string, unknown> | undefined, payload: FieldValues) => void;
    onSubmitError?: (error: unknown, payload: FieldValues) => void;
    preparePayload?: (values: FieldValues) => Promise<FieldValues | false> | FieldValues | false;
    transformPayload?: (values: FieldValues) => FieldValues;
    extraPayload?: Record<string, unknown>;
    preventDuplicateSubmit: boolean;
    resetOnSuccess: boolean;
    skipInvalidate: boolean;
    submitHoldMs?: number;
};

/**
 * Keeps the submit button busy for at least `holdMs` after a submit starts, then closes
 * the form. With no `holdMs` the form closes at once.
 */
function useSubmitHold(holdMs: number | undefined, onClose: () => void) {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const startedAtRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);
    const [holding, setHolding] = useState(false);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            clearTimer();
        };
    }, []);

    /** Call when the request is sent. */
    const start = () => {
        if (holdMs && holdMs > 0) {
            startedAtRef.current = Date.now();
            setHolding(true);
        }
    };

    /** Stop holding without closing (the save failed, or the user cancelled). */
    const cancel = () => {
        clearTimer();
        setHolding(false);
    };

    /** Close the form once the hold time has passed. */
    const closeWhenDone = () => {
        const remaining = Math.max(0, (holdMs ?? 0) - (Date.now() - startedAtRef.current));
        const finish = () => {
            if (!mountedRef.current) return;
            setHolding(false);
            onCloseRef.current();
        };

        if (remaining === 0) {
            finish();
            return;
        }
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            finish();
        }, remaining);
    };

    return { holding, start, cancel, closeWhenDone };
}

/**
 * Saves the form: builds the payload, sends the request, and handles the answer.
 *
 * On success: reset the form, toast, call `onSuccess`, then close.
 * On failure: keep the values, show server messages under their fields, call `onSubmitError`.
 */
export function useEntitySubmit({
    form,
    api,
    mode,
    method,
    data,
    queryKey,
    isFormData,
    successMessage,
    onClose,
    onSuccess,
    onSubmitError,
    preparePayload,
    transformPayload,
    extraPayload,
    preventDuplicateSubmit,
    resetOnSuccess,
    skipInvalidate,
    submitHoldMs,
}: EntitySubmitOptions) {
    const { t } = useTranslation();
    const { reset, setError } = form;
    const lastPayloadRef = useRef<FieldValues>({});
    const submittingRef = useRef(false);
    const hold = useSubmitHold(submitHoldMs, onClose);

    const request = saveRequestOf({ api, mode, method, entityId: entityIdOf(data) });

    const { mutate: sendRequest, isPending } = useApiMutation<
        { data?: Record<string, unknown>; message?: string },
        FieldValues | FormData
    >({
        url: request.url,
        method: request.method,
        invalidateKeys: skipInvalidate ? undefined : queryKey,
        successMessage,
        onSuccess: (responseData) => {
            submittingRef.current = false;
            if (resetOnSuccess) reset();
            if (!successMessage && responseData?.message) {
                toast.success(t(String(responseData.message)));
            }
            onSuccess?.(responseData as Record<string, unknown> | undefined, lastPayloadRef.current);
            hold.closeWhenDone();
        },
        // 422 field errors (Laravel `errors`) also show under the field, next to the toast.
        // Laravel names a nested value the way the form does (`items.0.qty`), so the
        // message lands under the right row. A name with no field on screen shows
        // nowhere but the toast, and is cleared by the next validation.
        onError: (error) => {
            submittingRef.current = false;
            hold.cancel();
            Object.entries(serverFieldErrors(error)).forEach(([field, message]) => {
                setError(field, { type: "server", message });
            });
            onSubmitError?.(error, lastPayloadRef.current);
        },
    });

    /** Runs after Zod validation passed. */
    const onSubmit = async (formValues: FieldValues) => {
        const alreadySaving = submittingRef.current || isPending || hold.holding;
        if (!api || (preventDuplicateSubmit && alreadySaving)) return;
        if (preventDuplicateSubmit) submittingRef.current = true;
        try {
            const prepared = preparePayload ? await preparePayload(formValues) : formValues;
            if (prepared === false) {
                submittingRef.current = false;
                return;
            }
            const payload = buildPayload(prepared, { transformPayload, extraPayload });

            lastPayloadRef.current = payload;
            hold.start();
            sendRequest(isFormData ? toFormData(payload) : payload);
        } catch (error) {
            submittingRef.current = false;
            throw error;
        }
    };

    return {
        onSubmit,
        /** True while the request is in flight or the submit hold is running. */
        isSaving: isPending || hold.holding,
        cancelHold: hold.cancel,
    };
}
