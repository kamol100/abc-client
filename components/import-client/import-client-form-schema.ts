import ClientFormFieldSchema from "@/components/clients/client-form-schema";
import type {
    AccordionSection,
    FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";

type Props = {
    mode?: "create" | "edit";
};

export function ImportClientFormFieldSchema({
    mode = "create",
}: Props): AccordionSection[] {
    const sections = ClientFormFieldSchema({ mode });
    const profileField: FormFieldConfig = {
        type: "text",
        name: "mikrotik_profile",
        label: { labelText: "import_client.mikrotik_profile.label" },
        placeholder: "import_client.mikrotik_profile.placeholder",
    };

    const basicSection = sections[0];
    if (!basicSection) return sections;

    return [
        {
            ...basicSection,
            form: [...basicSection.form, profileField],
        },
        ...sections.slice(1),
    ];
}

export default ImportClientFormFieldSchema;
