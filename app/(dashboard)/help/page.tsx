import { HelpCentre } from "@/components/help/help-centre";
import { loadHelpIndex } from "@/lib/help/pages";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("help.title"),
    description: t("help.description"),
  };
}

export default async function HelpPage() {
  const page = await loadHelpIndex();
  if (!page) notFound();
  return <HelpCentre cards={page.cards} />;
}
