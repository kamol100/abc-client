import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function paymentListParams(
    filter: string | null,
    canViewAllPayments: boolean,
    ownStaffId?: string | number | null,
): Record<string, string> | undefined {
    const params = filter ? Object.fromEntries(new URLSearchParams(filter)) : {};

    if (!canViewAllPayments) {
        const staffId = ownStaffId == null ? "" : String(ownStaffId).trim();
        params.staff_id = staffId === "" ? "0" : staffId;
    }

    return Object.keys(params).length > 0 ? params : undefined;
}

export const PaymentFilterSchema = (canViewAllPayments: boolean): FieldConfig[] => {
    return [
        {
            type: "dateRange",
            name: "payment_date",
            placeholder: "payment.payment_date.label",
        },
        {
            type: "text",
            name: "track_id",
            placeholder: "payment.invoice_id.placeholder",
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "staff_id",
            placeholder: "payment.collect_by.label",
            api: "/dropdown-staffs",
            valueMapping: { idKey: "id", labelKey: "name" },
            isDisabled: !canViewAllPayments,
        },
        {
            type: "dropdown",
            name: "client_id",
            placeholder: "payment.client.label",
            api: "/dropdown-clients",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "fund_id",
            placeholder: "payment.fund.label",
            api: "/dropdown-funds",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "zone_id",
            placeholder: "zone.name.label",
            api: "/dropdown-zones",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
    ];
};

export default PaymentFilterSchema;
