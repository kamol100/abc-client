import { Metadata } from "next";
import NocView from "@/components/noc/noc-view";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("noc.title"),
};

export default function NocPage() {
    return <NocView />;
}
