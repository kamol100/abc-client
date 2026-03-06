import { Metadata } from "next";
import SubjectTable from "@/components/subjects/subject-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("subject.title_plural"),
};

export default function SubjectsPage() {
    return <SubjectTable />;
}
