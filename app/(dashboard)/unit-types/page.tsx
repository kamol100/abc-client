import { Metadata } from "next";
import UnitTypeTable from "@/components/unit-type/unit-type-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("unit_type.title_plural"),
};

export default function UnitTypesPage() {
    return <UnitTypeTable />;
}
