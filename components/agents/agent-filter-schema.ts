import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const AgentFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            placeholder: "agent.name.placeholder",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "phone",
            placeholder: "agent.phone.placeholder",
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: "agent.status.placeholder",
            options: [
                { value: "active", label: "agent.status.active" },
                { value: "inactive", label: "agent.status.inactive" },
            ],
            defaultValue: "active",
        },
    ];
};

export default AgentFilterSchema;
