
import { useTranslation } from "react-i18next";
import { FormBuilderType } from "../form-wrapper/form-builder-type";


export const DashboardFormSchema = (): FormBuilderType[] => {
    const { t } = useTranslation();

    const schema = [
        {
            type: "switch",
            name: "show_dashboard_header",
            label: 'show_dashboard_header',
            switchValue: 1,
            permission: true,
            saveOnChange: true
        },
    ];

    return schema;

};
export default DashboardFormSchema;