import { Metadata } from "next";
import ResellerBillTable from "@/components/reseller-bills/reseller-bill-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("reseller_bill.title"),
};

export default function MyBillsPage() {
    return <ResellerBillTable />;
}
