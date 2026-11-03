import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ModuleDetail from "@/components/marketing/modules/module-detail";
import { MODULE_IDS, type ModuleId } from "@/components/marketing/modules/module-types";
import { MODULES } from "@/components/marketing/modules/registry";
import { t } from "@/lib/i18n/server";

type Props = { params: Promise<{ module: string }> };

const isModule = (id: string): id is ModuleId =>
  (MODULE_IDS as readonly string[]).includes(id) && MODULES[id as ModuleId] !== undefined;

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULE_IDS.filter((id) => MODULES[id]).map((module) => ({ module }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  if (!isModule(module)) return {};
  return {
    title: t(`module_pages.${module}.meta_title`),
    description: t(`module_pages.${module}.meta_description`),
  };
}

export default async function ModuleRoute({ params }: Props) {
  const { module } = await params;
  if (!isModule(module)) notFound();
  return <ModuleDetail id={module} />;
}
