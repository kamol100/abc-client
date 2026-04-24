import DemoRequestTable from "@/components/demo-requests/demo-request-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function DemoRequestsPage() {
    return <DemoRequestTable />;
}

export const metadata: Metadata = {
    title: t("admin_demo_request.title"),
    description: t("admin_demo_request.title"),
};
