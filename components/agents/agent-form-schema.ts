import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const AgentFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            label: { labelText: "agent.name.label", mandatory: true },
            placeholder: "agent.name.placeholder",
        },
        {
            type: "text",
            name: "phone",
            label: { labelText: "agent.phone.label" },
            placeholder: "agent.phone.placeholder",
        },
        {
            type: "number",
            name: "commission",
            label: { labelText: "agent.commission.label", mandatory: true },
            placeholder: "agent.commission.placeholder",
        },
        {
            type: "dropdown",
            name: "status",
            label: { labelText: "agent.status.label", mandatory: true },
            placeholder: "agent.status.placeholder",
            options: [
                { value: "active", label: "agent.status.active" },
                { value: "inactive", label: "agent.status.inactive" },
            ],
            defaultValue: "active",
        },
        {
            type: "textarea",
            name: "note",
            label: { labelText: "agent.note.label" },
            placeholder: "agent.note.placeholder",
            rows: 3,
        },
    ];
};

export default AgentFormFieldSchema;
