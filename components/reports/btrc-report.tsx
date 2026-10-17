"use client";

import { ReactNode, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";
import Card from "@/components/card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormBuilder, { VisibleFormField } from "@/components/form-wrapper/form-builder";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
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

const BtrcClientReportSchema = z.object({
    scope: z.enum([CLIENT_SCOPE_WITH_RESELLERS, CLIENT_SCOPE_OWN], {
        required_error: "btrc.client.type.errors.required",
        invalid_type_error: "btrc.client.type.errors.invalid",
    }),
    zone_id: selectionSchema("btrc.client.zone.errors.required"),
    status: z.enum(["all", "active", "inactive"], {
        required_error: "btrc.client.status.errors.required",
        invalid_type_error: "btrc.client.status.errors.invalid",
    }),
});

const BtrcResellerReportSchema = z.object({
    reseller_id: selectionSchema("btrc.reseller.reseller.errors.required"),
});

type ReportValues = Record<string, string | number | undefined>;

export function btrcReportSearch(values: ReportValues): string {
    const withResellers = values.scope === CLIENT_SCOPE_WITH_RESELLERS;
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
        if (key === "scope" && value !== CLIENT_SCOPE_WITH_RESELLERS) return;
        if (key === "zone_id" && withResellers) return;
        if (value === undefined || value === "" || value === ALL_VALUE) return;
        params.set(key, String(value));
    });
    return params.toString();
}

function filenameFromDisposition(header: string | null, fallback: string): string {
    const match = header?.match(/filename\*?=(?:UTF-8''|"?)([^";]+)"?/i);
    if (!match?.[1]) return fallback;
    return decodeURIComponent(match[1].replaceAll('"', ""));
}

function reportValues(values: ReportValues): ReportValues {
    return {
        scope: values.scope,
        zone_id: values.zone_id,
        status: values.status,
        reseller_id: values.reseller_id,
    };
}

function useReportDownload(kind: "clients" | "resellers", fallbackName: string) {
    const { t } = useTranslation();
    const pendingRef = useRef(false);
    const [pending, setPending] = useState(false);

    const download = async (values: ReportValues) => {
        if (pendingRef.current) return;
        pendingRef.current = true;
        setPending(true);
        try {
            const query = btrcReportSearch(values);
            const response = await fetch(`/api/reports/btrc/${kind}${query ? `?${query}` : ""}`);
            if (!response.ok) {
                const body: unknown = await response.json().catch(() => null);
                throw body ?? { message: "btrc.download_failed" };
            }
            const blob = await response.blob();
            const filename = filenameFromDisposition(response.headers.get("Content-Disposition"), fallbackName);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast.success(t("btrc.download_success"));
        } catch (error) {
            toast.error(apiErrorText(error, t, "btrc.download_failed"));
        } finally {
            pendingRef.current = false;
            setPending(false);
        }
    };

    return { pending, download };
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

function ReportDownloadButton({
    pending,
    onDownload,
}: {
    pending: boolean;
    onDownload: (values: ReportValues) => void;
}) {
    const form = useFormContext();

    return (
        <MyButton
            type="button"
            variant="default"
            size="default"
            icon={false}
            title="btrc.download"
            loading={pending}
            className="h-auto min-h-9 w-full whitespace-normal sm:w-auto"
            onClick={() => {
                void form.handleSubmit((values) => {
                    onDownload(reportValues(values));
                })();
            }}
        />
    );
}

function clientFields(zoneOptions: { value: string | number; label: string }[], loading: boolean): FieldConfig[] {
    return [
        {
            type: "dropdown",
            name: "scope",
            label: { labelText: "btrc.client.type.label" },
            placeholder: "btrc.client.type.placeholder",
            options: [
                { value: CLIENT_SCOPE_WITH_RESELLERS, label: "btrc.client.type.with_resellers" },
                { value: CLIENT_SCOPE_OWN, label: "btrc.client.type.own" },
            ],
            defaultValue: CLIENT_SCOPE_WITH_RESELLERS,
            isClearable: false,
        },
        {
            type: "dropdown",
            name: "status",
            label: { labelText: "btrc.client.status.label" },
            placeholder: "btrc.client.status.placeholder",
            options: [
                { value: "all", label: "btrc.client.status.all" },
                { value: "active", label: "btrc.client.status.active" },
                { value: "inactive", label: "btrc.client.status.inactive" },
            ],
            defaultValue: "all",
            isClearable: false,
        },
        {
            type: "dropdown",
            name: "zone_id",
            label: { labelText: "btrc.client.zone.label" },
            placeholder: "btrc.client.zone.placeholder",
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
        {
            type: "dropdown",
            name: "reseller_id",
            label: { labelText: "btrc.reseller.reseller.label" },
            placeholder: "btrc.reseller.reseller.placeholder",
            options: resellerOptions,
            defaultValue: "all",
            isClearable: false,
            isLoading: loading,
        },
    ];
}

function ClientReportSection() {
    const { t } = useTranslation();
    const { pending, download } = useReportDownload("clients", "BTRC_Clients_List.xls");
    const zonesQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["dropdown-zones", "btrc"],
        url: "dropdown-zones",
        pagination: false,
    });
    const zones = useMemo(() => namedOptions(zonesQuery.data?.data), [zonesQuery.data]);
    const zoneOptions = useMemo(
        () => [
            { value: "all", label: "btrc.client.zone.all" },
            ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
        ],
        [zones],
    );
    const formSchema = useMemo(
        () => clientFields(zoneOptions, zonesQuery.isLoading),
        [zoneOptions, zonesQuery.isLoading],
    );

    return (
        <ReportCard
            title={t("btrc.client.title")}
            error={zonesQuery.isError ? apiErrorText(zonesQuery.error, t) : null}
        >
            <FormBuilder
                formSchema={formSchema}
                schema={BtrcClientReportSchema}
                method="POST"
                mode="create"
                actionButton={false}
                data={CLIENT_DEFAULTS}
            >
                {(renderField) => (
                    <div className="grid grid-cols-1 gap-4">
                        {formSchema.map((field) => (
                            <VisibleFormField key={field.name} field={field}>
                                {renderField(field)}
                            </VisibleFormField>
                        ))}
                        <ReportDownloadButton pending={pending} onDownload={download} />
                    </div>
                )}
            </FormBuilder>
        </ReportCard>
    );
}

function ResellerReportSection() {
    const { t } = useTranslation();
    const { pending, download } = useReportDownload("resellers", "BTRC_Resellers_List.xls");
    const resellersQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["dropdown-resellers", "btrc"],
        url: "dropdown-resellers",
        pagination: false,
    });
    const resellers = useMemo(
        () => namedOptions(resellersQuery.data?.data),
        [resellersQuery.data],
    );
    const resellerOptions = useMemo(
        () => [
            { value: "all", label: "btrc.reseller.reseller.all" },
            ...resellers.map((reseller) => ({ value: reseller.id, label: reseller.name })),
        ],
        [resellers],
    );
    const formSchema = useMemo(
        () => resellerFields(resellerOptions, resellersQuery.isLoading),
        [resellerOptions, resellersQuery.isLoading],
    );

    return (
        <ReportCard
            title={t("btrc.reseller.title")}
            error={resellersQuery.isError ? apiErrorText(resellersQuery.error, t) : null}
        >
            <FormBuilder
                formSchema={formSchema}
                schema={BtrcResellerReportSchema}
                method="POST"
                mode="create"
                actionButton={false}
                data={RESELLER_DEFAULTS}
            >
                {(renderField) => (
                    <div className="grid grid-cols-1 gap-4">
                        {formSchema.map((field) => (
                            <div key={field.name}>{renderField(field)}</div>
                        ))}
                        <ReportDownloadButton pending={pending} onDownload={download} />
                    </div>
                )}
            </FormBuilder>
        </ReportCard>
    );
}

const BtrcReports = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold sm:text-2xl">{t("btrc.title")}</h1>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ClientReportSection />
                <ResellerReportSection />
            </div>
        </div>
    );
};

export default BtrcReports;
