"use client";

import { format } from "date-fns";
import { ReactNode, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Card from "@/components/card";
import FormBuilder, { VisibleFormField } from "@/components/form-wrapper/form-builder";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { apiErrorText } from "@/lib/helper/helper";

const ALL_VALUE = "all";
const CLIENT_SCOPE_WITH_RESELLERS = "with_resellers";
const CLIENT_SCOPE_OWN = "own";
const CLIENT_DEFAULTS = { scope: CLIENT_SCOPE_WITH_RESELLERS, zone_id: "all", status: "all" };
const RESELLER_DEFAULTS = { reseller_id: "all" };

const selectionSchema = (message: string) =>
    z.union([z.literal(ALL_VALUE), z.coerce.number().int().positive()], {
        errorMap: () => ({ message }),
    });

const dateRangeSchema = z
    .object({
        from: z.date({
            required_error: "new_client_report.date_range.errors.required",
            invalid_type_error: "new_client_report.date_range.errors.invalid",
        }),
        to: z.date({
            required_error: "new_client_report.date_range.errors.required",
            invalid_type_error: "new_client_report.date_range.errors.invalid",
        }),
    })
    .superRefine((range, context) => {
        if (range.to.getTime() < range.from.getTime()) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: "new_client_report.date_range.errors.order",
                path: ["to"],
            });
        }
    });

const NewClientClientReportSchema = z.object({
    date_range: dateRangeSchema,
    scope: z.enum([CLIENT_SCOPE_WITH_RESELLERS, CLIENT_SCOPE_OWN], {
        required_error: "new_client_report.client.type.errors.required",
        invalid_type_error: "new_client_report.client.type.errors.invalid",
    }),
    zone_id: selectionSchema("new_client_report.client.zone.errors.required"),
    status: z.enum(["all", "active", "inactive"], {
        required_error: "new_client_report.client.status.errors.required",
        invalid_type_error: "new_client_report.client.status.errors.invalid",
    }),
});

const NewClientResellerReportSchema = z.object({
    date_range: dateRangeSchema,
    reseller_id: selectionSchema("new_client_report.reseller.reseller.errors.required"),
});

type DateRangeValue = {
    from?: Date;
    to?: Date;
};

export type NewClientReportValues = {
    date_range?: DateRangeValue;
    scope?: string;
    zone_id?: string | number;
    status?: string;
    reseller_id?: string | number;
};

export function currentMonthDateRange(now = new Date()): { from: Date; to: Date } {
    return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: now,
    };
}

function formatReportDate(value: Date | undefined): string | null {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
    return format(value, "yyyy-MM-dd");
}

export function newClientReportSearch(values: NewClientReportValues): string {
    const withResellers = values.scope === CLIENT_SCOPE_WITH_RESELLERS;
    const params = new URLSearchParams();
    const dateFrom = formatReportDate(values.date_range?.from);
    const dateTo = formatReportDate(values.date_range?.to);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    if (values.scope === CLIENT_SCOPE_WITH_RESELLERS) params.set("scope", CLIENT_SCOPE_WITH_RESELLERS);
    if (!withResellers && values.zone_id !== undefined && values.zone_id !== "" && values.zone_id !== ALL_VALUE) {
        params.set("zone_id", String(values.zone_id));
    }
    if (values.status !== undefined && values.status !== "" && values.status !== ALL_VALUE) {
        params.set("status", values.status);
    }
    if (values.reseller_id !== undefined && values.reseller_id !== "" && values.reseller_id !== ALL_VALUE) {
        params.set("reseller_id", String(values.reseller_id));
    }

    return params.toString();
}

function reportPath(kind: "clients" | "resellers", values: NewClientReportValues): string {
    const query = newClientReportSearch(values);
    return `/api/reports/new-clients/${kind}${query ? `?${query}` : ""}`;
}

function isDateRange(value: unknown): value is DateRangeValue {
    if (!value || typeof value !== "object") return false;
    const range = value as { from?: unknown; to?: unknown };
    const fromIsDate = range.from === undefined || range.from instanceof Date;
    const toIsDate = range.to === undefined || range.to instanceof Date;
    return fromIsDate && toIsDate;
}

function formScalar(value: unknown): string | number | undefined {
    if (typeof value === "string" || typeof value === "number") return value;
    return undefined;
}

function reportValues(values: object): NewClientReportValues {
    const record = values as {
        date_range?: unknown;
        scope?: unknown;
        zone_id?: unknown;
        status?: unknown;
        reseller_id?: unknown;
    };
    const scope = formScalar(record.scope);
    const status = formScalar(record.status);

    return {
        date_range: isDateRange(record.date_range) ? record.date_range : undefined,
        scope: typeof scope === "string" ? scope : undefined,
        zone_id: formScalar(record.zone_id),
        status: typeof status === "string" ? status : undefined,
        reseller_id: formScalar(record.reseller_id),
    };
}

type NamedOption = {
    id: string | number;
    name: string;
};

function namedOptions(data: unknown): NamedOption[] {
    if (!Array.isArray(data)) return [];

    return data.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as { id?: unknown; name?: unknown };
        if (typeof record.name !== "string") return [];
        if (typeof record.id !== "string" && typeof record.id !== "number") return [];
        return [{ id: record.id, name: record.name }];
    });
}

function ReportCard({
    title,
    error,
    children,
}: {
    title: string;
    error?: string | null;
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {children}
            </CardContent>
        </Card>
    );
}

function ReportDownloadButton({ kind }: { kind: "clients" | "resellers" }) {
    const form = useFormContext();

    return (
        <MyButton
            type="button"
            variant="default"
            size="default"
            icon={false}
            title="new_client_report.download"
            className="h-auto min-h-9 w-full whitespace-normal sm:w-auto"
            onClick={() => {
                const values = reportValues(form.getValues());
                if (!values.date_range?.from || !values.date_range?.to || values.date_range.to < values.date_range.from) {
                    void form.trigger();
                    return;
                }
                window.open(reportPath(kind, values), "_blank", "noopener");
            }}
        />
    );
}

function dateRangeField(): FieldConfig {
    return {
        type: "dateRange",
        name: "date_range",
        label: { labelText: "new_client_report.date_range.label" },
        placeholder: "new_client_report.date_range.placeholder",
        required: true,
    };
}

function clientFields(zoneOptions: { value: string | number; label: string }[], loading: boolean): FieldConfig[] {
    return [
        dateRangeField(),
        {
            type: "dropdown",
            name: "scope",
            label: { labelText: "new_client_report.client.type.label" },
            placeholder: "new_client_report.client.type.placeholder",
            options: [
                { value: CLIENT_SCOPE_WITH_RESELLERS, label: "new_client_report.client.type.with_resellers" },
                { value: CLIENT_SCOPE_OWN, label: "new_client_report.client.type.own" },
            ],
            defaultValue: CLIENT_SCOPE_WITH_RESELLERS,
            isClearable: false,
        },
        {
            type: "dropdown",
            name: "status",
            label: { labelText: "new_client_report.client.status.label" },
            placeholder: "new_client_report.client.status.placeholder",
            options: [
                { value: "all", label: "new_client_report.client.status.all" },
                { value: "active", label: "new_client_report.client.status.active" },
                { value: "inactive", label: "new_client_report.client.status.inactive" },
            ],
            defaultValue: "all",
            isClearable: false,
            visibleWhen: { field: "scope", equals: CLIENT_SCOPE_OWN, resetValue: "all" },
        },
        {
            type: "dropdown",
            name: "zone_id",
            label: { labelText: "new_client_report.client.zone.label" },
            placeholder: "new_client_report.client.zone.placeholder",
            options: zoneOptions,
            defaultValue: "all",
            isClearable: false,
            isLoading: loading,
            visibleWhen: { field: "scope", equals: CLIENT_SCOPE_OWN, resetValue: "all" },
        },
    ];
}

function resellerFields(
    resellerOptions: { value: string | number; label: string }[],
    loading: boolean,
): FieldConfig[] {
    return [
        dateRangeField(),
        {
            type: "dropdown",
            name: "reseller_id",
            label: { labelText: "new_client_report.reseller.reseller.label" },
            placeholder: "new_client_report.reseller.reseller.placeholder",
            options: resellerOptions,
            defaultValue: "all",
            isClearable: false,
            isLoading: loading,
        },
    ];
}

function ClientReportSection() {
    const { t } = useTranslation();
    const [defaultRange] = useState(currentMonthDateRange);
    const zonesQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["dropdown-zones", "new-clients"],
        url: "dropdown-zones",
        pagination: false,
    });
    const zones = useMemo(() => namedOptions(zonesQuery.data?.data), [zonesQuery.data]);
    const zoneOptions = useMemo(
        () => [
            { value: "all", label: "new_client_report.client.zone.all" },
            ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
        ],
        [zones],
    );
    const formSchema = useMemo(
        () => clientFields(zoneOptions, zonesQuery.isLoading),
        [zoneOptions, zonesQuery.isLoading],
    );
    const defaults = useMemo(
        () => ({ date_range: defaultRange, ...CLIENT_DEFAULTS }),
        [defaultRange],
    );

    return (
        <ReportCard
            title={t("new_client_report.client.title")}
            error={zonesQuery.isError ? apiErrorText(zonesQuery.error, t) : null}
        >
            <FormBuilder
                formSchema={formSchema}
                schema={NewClientClientReportSchema}
                method="POST"
                mode="create"
                actionButton={false}
                data={defaults}
            >
                {(renderField) => (
                    <div className="grid grid-cols-1 gap-4">
                        {formSchema.map((field) => (
                            <VisibleFormField key={field.name} field={field}>
                                {renderField(field)}
                            </VisibleFormField>
                        ))}
                        <ReportDownloadButton kind="clients" />
                    </div>
                )}
            </FormBuilder>
        </ReportCard>
    );
}

function ResellerReportSection() {
    const { t } = useTranslation();
    const [defaultRange] = useState(currentMonthDateRange);
    const resellersQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["dropdown-resellers", "new-clients"],
        url: "dropdown-resellers",
        pagination: false,
    });
    const resellers = useMemo(
        () => namedOptions(resellersQuery.data?.data),
        [resellersQuery.data],
    );
    const resellerOptions = useMemo(
        () => [
            { value: "all", label: "new_client_report.reseller.reseller.all" },
            ...resellers.map((reseller) => ({ value: reseller.id, label: reseller.name })),
        ],
        [resellers],
    );
    const formSchema = useMemo(
        () => resellerFields(resellerOptions, resellersQuery.isLoading),
        [resellerOptions, resellersQuery.isLoading],
    );
    const defaults = useMemo(
        () => ({ date_range: defaultRange, ...RESELLER_DEFAULTS }),
        [defaultRange],
    );

    return (
        <ReportCard
            title={t("new_client_report.reseller.title")}
            error={resellersQuery.isError ? apiErrorText(resellersQuery.error, t) : null}
        >
            <FormBuilder
                formSchema={formSchema}
                schema={NewClientResellerReportSchema}
                method="POST"
                mode="create"
                actionButton={false}
                data={defaults}
            >
                {(renderField) => (
                    <div className="grid grid-cols-1 gap-4">
                        {formSchema.map((field) => (
                            <div key={field.name}>{renderField(field)}</div>
                        ))}
                        <ReportDownloadButton kind="resellers" />
                    </div>
                )}
            </FormBuilder>
        </ReportCard>
    );
}

const NewClientReports = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold sm:text-2xl">{t("new_client_report.title")}</h1>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ClientReportSection />
                <ResellerReportSection />
            </div>
        </div>
    );
};

export default NewClientReports;
