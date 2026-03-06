import { Metadata } from "next";
import TagTable from "@/components/tags/tag-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("tag.title_plural"),
};

export default function TagsPage() {
    return <TagTable />;
}
