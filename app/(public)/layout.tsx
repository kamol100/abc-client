import { getCompanyPublicData } from "@/lib/api/api";
import { fetchHostName } from "@/app/layout";
import CompanyProvider from "@/context/company-provider";
import PublicTopNav from "@/app/(public)/public-top-nav";
import PublicFooter from "@/app/(public)/public-footer";
import type { CompanyPublicData } from "@/types/company-public-type";
import type { PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { hostnameHasTenantSubdomain } from "@/lib/helper/helper";

async function loadCompanyPublicData(): Promise<CompanyPublicData> {
  const host = await fetchHostName();
  return getCompanyPublicData(host);
}

const ClientTopNav = dynamic(() => import("@/app/(public)/client-top-nav"));
export default async function PublicLayout({ children }: PropsWithChildren) {
  const host = await fetchHostName();
  const company = await loadCompanyPublicData();
  const hasTenantSubdomain = hostnameHasTenantSubdomain(host);

  return (
    <CompanyProvider initialCompany={company}>
      <div className="flex min-h-svh flex-col bg-background">
        {hasTenantSubdomain ? <ClientTopNav /> : <PublicTopNav />}
        <main className="flex flex-1 flex-col">{children}</main>
        <PublicFooter />
      </div>
    </CompanyProvider>
  );
}
