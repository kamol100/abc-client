import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const SubjectFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("subject.name.label"),
                mandatory: true,
            },
            placeholder: t("subject.name.placeholder"),
        },
    ];
};

export default SubjectFormFieldSchema;
