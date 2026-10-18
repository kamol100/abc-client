import ClientFilterSchema from "@/components/clients/client-filter-schema";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ResellerClientFilterSchema = (): FieldConfig[] => {
    return [
        ...ClientFilterSchema(),
        {
            type: "dropdown",
            name: "reseller_id",
            placeholder: "client.reseller.all",
            permission: true,
            api: "/dropdown-resellers/company",
            isClearable: true,
        },
    ];
};

export default ResellerClientFilterSchema;
