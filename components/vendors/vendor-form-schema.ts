import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

const VendorFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: { labelText: t("vendor.name.label"), mandatory: true },
            placeholder: t("vendor.name.placeholder"),
        },
        {
            type: "text",
            name: "phone",
            label: { labelText: t("vendor.phone.label"), mandatory: true },
            placeholder: t("vendor.phone.placeholder"),
        },
        {
            type: "email",
            name: "email",
            label: { labelText: t("vendor.email.label") },
            placeholder: t("vendor.email.placeholder"),
        },
        {
            type: "textarea",
            name: "address",
            label: { labelText: t("vendor.address.label") },
            placeholder: t("vendor.address.placeholder"),
            rows: 3,
        },
    ];
};

export default VendorFormFieldSchema;
