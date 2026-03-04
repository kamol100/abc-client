
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ActivityLogFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "log_name",
            placeholder: "activity_log.subject.label",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "description",
            placeholder: "activity_log.action_by.label",
            watchForFilter: true,
        },
    ];
};

export default ActivityLogFilterSchema;
