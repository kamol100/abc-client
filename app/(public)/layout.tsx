import { getCompanyPublicData } from "@/lib/api/api";
import { fetchHostName } from "@/app/layout";
import CompanyProvider from "@/context/company-provider";
import PublicTopNav from "@/app/(public)/public-top-nav";
import PublicFooter from "@/app/(public)/public-footer";
import type { CompanyPublicData } from "@/types/company-public-type";
import type { PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { hostnameHasTenantSubdomain } from "@/lib/helper/helper";
import { Anek_Bangla, JetBrains_Mono } from "next/font/google";
import MotionRoot from "@/components/marketing/motion-root";
import { LIGHT_SKIN } from "@/components/marketing/skins";
import "@/components/marketing/marketing.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-jetbrains",
});

// Bangla glyphs only: Latin, digits and spaces stay in JetBrains Mono.
const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-bn",
});

/* Runs before the page paints. Motion: lets motion.css hold the page until MotionRoot has tagged it, and lets go after 3s if it never does.
 * Theme: the marketing site defaults to dark (ThemeProvider reads data-theme-default); applied here too so light never flashes first. */
const MOTION_HOLD = `(function(){var d=document.documentElement;d.classList.add("mkt-js");setTimeout(function(){d.classList.add("mkt-motion")},3000);d.dataset.themeDefault="dark";try{if(!localStorage.getItem("theme")){d.classList.remove("light");d.classList.add("dark")}}catch(e){}})();`;

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
      <div data-skin={LIGHT_SKIN} className={`mkt ${jetbrainsMono.variable} ${anekBangla.variable} flex min-h-svh flex-col`}>
        <script dangerouslySetInnerHTML={{ __html: MOTION_HOLD }} />
        {hasTenantSubdomain ? <ClientTopNav /> : <PublicTopNav />}
        <main className="flex flex-1 flex-col">{children}</main>
        <PublicFooter />
        <MotionRoot />
      </div>
    </CompanyProvider>
  );
}
