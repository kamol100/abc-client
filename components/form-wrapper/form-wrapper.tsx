"use client";

import { ReactNode, useMemo, useRef } from "react";
import { FieldValues } from "react-hook-form";
import { z } from "zod";
import { FormActionsProvider } from "@/components/form-builder/core/form-actions";
import { shownFields } from "@/components/form-builder/core/form-schema";
import { useEntityForm } from "@/components/form-builder/core/use-entity-form";
import { useEntityLoad } from "@/components/form-builder/core/use-entity-load";
import {
    useEntitySubmit,
    type FormCustomSave,
    type FormValidate,
} from "@/components/form-builder/core/use-entity-submit";
import { FieldOptionsProvider } from "@/components/form-builder/fields/field-shell";
import { FormFooter } from "@/components/form-builder/layout/form-footer";
import { FormLoadState } from "@/components/form-builder/layout/form-load-state";
import { useMyDialogClose } from "@/components/my-dialog";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
    AccordionSection,
    FormFieldConfig,
    HydratePolicy,
} from "@/components/form-wrapper/form-builder-type";

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
    /** After a successful save, before the dialog closes: the response `data` and the payload that was sent. */
    onSuccess?: (response: Record<string, unknown> | undefined, payload: FieldValues) => void;
    actionButton?: boolean;
    submitTitle?: string;
    /** Keep the submit button spinning at least this long after a valid submit, then close. */
    submitHoldMs?: number;
    actionButtonClass?: string;
    hydrateOnEdit?: HydratePolicy;
    formSchema?: FormFieldConfig[] | AccordionSection[];
    transformToFormValues?: (
        data: Record<string, unknown>
    ) => Record<string, unknown>;
    extraPayload?: Record<string, unknown>;
    transformPayload?: (values: FieldValues) => FieldValues;
    /** Runs after Zod validation and before the request. Return false to keep the draft and skip the request. */
    preparePayload?: (values: FieldValues) => Promise<FieldValues | false> | FieldValues | false;
    /** Block repeated submits while a mutation is in flight; opt in for transactional forms. */
    preventDuplicateSubmit?: boolean;
    /** Keep the entered values after a successful response. Defaults to resetting the form. */
    resetOnSuccess?: boolean;
    /** Skip the string query-key invalidation. Callers update the precise cache themselves. */
    skipInvalidate?: boolean;
    onSubmitError?: (error: unknown, payload: FieldValues) => void;
    grids?: number;
    fullPage?: boolean;
    /** A check against live data, after Zod passed. Return `{ fieldName: message }` to stop the save. */
    validate?: FormValidate;
    /** Save the form yourself, in place of the request to `api`. */
    onSubmit?: FormCustomSave;
    /** Put in front of every field id. Set it when another form on the page has the same field names. */
    idPrefix?: string;
    /** Keep room for one line of error under every field, so fields never move when an error shows. */
    reserveErrorSpace?: boolean;
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
    onSuccess,
    actionButton = true,
    submitTitle,
    submitHoldMs,
    actionButtonClass = "justify-between",
    hydrateOnEdit = "ifNeeded",
    formSchema,
    transformToFormValues,
    extraPayload,
    transformPayload,
    preparePayload,
    preventDuplicateSubmit = false,
    resetOnSuccess = true,
    skipInvalidate = false,
    onSubmitError,
    grids = 1,
    fullPage = false,
    idPrefix,
    reserveErrorSpace,
    validate,
    onSubmit,
}: FormWrapperProps) {
    // Closing: the caller's onClose, or the MyDialog this form sits in.
    const dialogClose = useMyDialogClose();
    const handleClose = onClose ?? dialogClose ?? (() => { });

    const form = useEntityForm(schema, data);

    const load = useEntityLoad({
        form,
        mode,
        api,
        data,
        queryKey,
        hydrateOnEdit,
        formSchema,
        transformToFormValues,
    });

    const submit = useEntitySubmit({
        form,
        api,
        mode,
        method,
        data,
        queryKey,
        isFormData,
        successMessage,
        onClose: handleClose,
        onSuccess,
        onSubmitError,
        preparePayload,
        transformPayload,
        extraPayload,
        preventDuplicateSubmit,
        resetOnSuccess,
        skipInvalidate,
        submitHoldMs,
        validate,
        customSave: onSubmit,
    });

    // Runs validation, then saves. The form's own submit and a field that asks for a
    // save (a switch with `saveOnChange`) both go through this.
    const submitForm = form.handleSubmit(submit.onSubmit);
    // Kept in a ref so the actions object below stays the same between renders.
    const submitFormRef = useRef(submitForm);
    submitFormRef.current = submitForm;
    const formActions = useMemo(() => ({ requestSave: () => void submitFormRef.current() }), []);

    const fieldOptions = useMemo(
        () => ({ idPrefix, reserveErrorSpace }),
        [idPrefix, reserveErrorSpace],
    );

    const formContent = (
        <FormLoadState
            isLoading={load.isLoading}
            failed={load.failed}
            grids={grids}
            fieldCount={shownFields(formSchema).length}
            onCancel={handleClose}
            onRetry={() => load.retry()}
        >
            {children}
        </FormLoadState>
    );

    // No footer while the record is loading or failed to load.
    const showFooter = !load.isLoading && !load.failed;

    return (
        <Form {...form}>
            <FieldOptionsProvider value={fieldOptions}>
                <FormActionsProvider value={formActions}>
                    <form
                        onSubmit={submitForm}
                        className={cn(fullPage && "flex flex-col flex-1 min-h-0")}
                    >
                        {fullPage ? (
                            <div className="flex-1 min-h-0 overflow-y-auto">
                                {formContent}
                            </div>
                        ) : (
                            formContent
                        )}
                        {showFooter && actionButton && (
                            <FormFooter
                                fullPage={fullPage}
                                className={actionButtonClass}
                                submitTitle={submitTitle}
                                isSaving={submit.isSaving}
                                onCancel={() => {
                                    submit.cancelHold();
                                    handleClose();
                                }}
                            />
                        )}
                    </form>
                </FormActionsProvider>
            </FieldOptionsProvider>
        </Form>
    );
}
