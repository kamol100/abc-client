import { getCompanyPublicData } from "@/lib/api/api";
import { fetchHostName } from "@/app/layout";
import CompanyProvider from "@/context/company-provider";
import PublicTopNav from "@/app/(public)/public-top-nav";
import PublicFooter from "@/app/(public)/public-footer";
import type { CompanyPublicData } from "@/types/company-public-type";
import type { PropsWithChildren } from "react";

async function loadCompanyPublicData(): Promise<CompanyPublicData> {
  const host = await fetchHostName();
  return getCompanyPublicData(host);
}

export default async function PublicLayout({ children }: PropsWithChildren) {
  const company = await loadCompanyPublicData();

  return (
    <CompanyProvider initialCompany={company}>
      <div className="flex min-h-svh flex-col bg-background">
        <PublicTopNav />
        <main className="flex flex-1 flex-col">{children}</main>
        <PublicFooter />
      </div>
    </CompanyProvider>
  );
}
