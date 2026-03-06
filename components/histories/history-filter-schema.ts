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
            name: "staff_id",
            placeholder: "history.staff.placeholder",
            api: "/dropdown-staffs",
            isClearable: true,
        },
        {
            type: "text",
            name: "created_at",
            placeholder: "history.created_at.placeholder",
            watchForFilter: true,
        },
    ];
};

export default HistoryFilterSchema;
