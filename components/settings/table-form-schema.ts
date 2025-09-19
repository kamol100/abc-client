
import { useTranslation } from "react-i18next";
import { FormBuilderType } from "../form-wrapper/form-builder-type";


export const TableFormSchema = (): FormBuilderType[] => {
    const { t } = useTranslation();

    const schema = [
        {
            type: "switch",
            name: "show_table_header",
            label: 'show_table_header',
            switchValue: 1,
            permission: true,
            saveOnChange: true
        },
    ];

    return schema;

};
export default TableFormSchema;