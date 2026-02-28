import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

const VendorFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: { labelText: t("vendor_name"), mandatory: true },
            placeholder: t("vendor_name"),
        },
        {
            type: "text",
            name: "phone",
            label: { labelText: t("phone"), mandatory: true },
            placeholder: t("phone"),
        },
        {
            type: "email",
            name: "email",
            label: { labelText: t("email") },
            placeholder: t("email"),
        },
        {
            type: "textarea",
            name: "address",
            label: { labelText: t("address") },
            placeholder: t("address"),
            rows: 3,
        },
    ];
};

export default VendorFormFieldSchema;
