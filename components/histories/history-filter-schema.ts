import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const HistoryFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "description",
            placeholder: "history.description.placeholder",
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "client_id",
            placeholder: "history.client.placeholder",
            api: "/dropdown-clients",
            isClearable: true,
        },
        {
            type: "dropdown",
            name: "staff_id",
            placeholder: "history.staff.placeholder",
            api: "/dropdown-staffs",
            isClearable: true,
        },
        {
            type: "dateRange",
            name: "created_at",
            placeholder: "history.created_at.placeholder",
            closeOnSelectDate: false,
        },
    ];
};

export default HistoryFilterSchema;
