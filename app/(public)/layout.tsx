import { getPublicData } from "@/lib/api/api";
import { fetchHostName } from "@/app/layout";
import CompanyProvider from "@/context/company-provider";
import type { CompanyPublicData } from "@/types/company-public-type";
import type { PropsWithChildren } from "react";

async function getCompanyPublicData(): Promise<CompanyPublicData> {
  const host = await fetchHostName();
  const res = await getPublicData(`/company-data?host=${host}`);
  return (res?.data as CompanyPublicData) ?? {};
}

export default async function PublicLayout({ children }: PropsWithChildren) {
  const company = await getCompanyPublicData();

  return (
    <CompanyProvider initialCompany={company}>{children}</CompanyProvider>
  );
}
