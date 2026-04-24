"use client";

import { MyDialog } from "@/components/my-dialog";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { DemoRequestRowSchema, type DemoRequestRow } from "@/components/demo-requests/demo-request-type";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

type Props = {
    demoRequestId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const DETAIL_FIELD_KEYS = [
    "full_name",
    "isp_name",
    "email",
    "website",
    "phone",
    "user_count",
    "whatsapp",
    "office_address",
] as const satisfies readonly (keyof DemoRequestRow)[];

function formatOptionalString(value: string | null | undefined, empty: string): string {
    if (value === null || value === undefined || value === "") return empty;
    return value;
}

export function DemoRequestViewDialog({ demoRequestId, open, onOpenChange }: Props) {
    const { t } = useTranslation();
    const empty = t("admin_demo_request.empty_value");

    const { data, isPending, isError, error } = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["demo-request-detail", demoRequestId],
        url: `demo-requests/${demoRequestId}`,
        pagination: false,
        enabled: open,
    });

    const parsed = data?.data !== undefined ? DemoRequestRowSchema.safeParse(data.data) : null;
    const row = parsed?.success ? parsed.data : null;

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            size="2xl"
            showFooter={false}
            title="admin_demo_request.view_title"
            loading={isPending}
        >
            {isError && (
                <p className="text-destructive text-sm">
                    {error?.message ?? t("admin_demo_request.load_error")}
                </p>
            )}
            {isPending && (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-full" />
                    ))}
                </div>
            )}
            {!isPending && !isError && row && (
                <dl className="grid gap-3 sm:grid-cols-2">
                    {DETAIL_FIELD_KEYS.map((key) => (
                        <div key={key} className="space-y-1">
                            <dt className="text-muted-foreground text-sm">
                                {t(`admin_demo_request.fields.${key}.label`)}
                            </dt>
                            <dd className="text-sm font-medium">
                                {formatOptionalString(row[key] as string | null | undefined, empty)}
                            </dd>
                        </div>
                    ))}
                    <div className="space-y-1">
                        <dt className="text-muted-foreground text-sm">
                            {t("admin_demo_request.fields.terms_accepted.label")}
                        </dt>
                        <dd className="text-sm font-medium">
                            {row.terms_accepted === true
                                ? t("admin_demo_request.terms_accepted.yes")
                                : row.terms_accepted === false
                                  ? t("admin_demo_request.terms_accepted.no")
                                  : empty}
                        </dd>
                    </div>
                    <div className="space-y-1">
                        <dt className="text-muted-foreground text-sm">
                            {t("admin_demo_request.fields.status.label")}
                        </dt>
                        <dd className="text-sm font-medium">
                            {t(`admin_demo_request.status.${row.status}`)}
                        </dd>
                    </div>
                    <div className="space-y-1">
                        <dt className="text-muted-foreground text-sm">
                            {t("admin_demo_request.fields.created_at.label")}
                        </dt>
                        <dd className="text-sm font-medium">
                            {formatOptionalString(row.created_at ?? null, empty)}
                        </dd>
                    </div>
                    <div className="space-y-1">
                        <dt className="text-muted-foreground text-sm">
                            {t("admin_demo_request.fields.updated_at.label")}
                        </dt>
                        <dd className="text-sm font-medium">
                            {formatOptionalString(row.updated_at ?? null, empty)}
                        </dd>
                    </div>
                </dl>
            )}
            {!isPending && !isError && data && !row && (
                <p className="text-destructive text-sm">{t("admin_demo_request.load_error")}</p>
            )}
        </MyDialog>
    );
}
