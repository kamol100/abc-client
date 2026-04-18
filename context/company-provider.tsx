"use client";

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import PublicFooter from "@/app/(public)/public-footer";
import PublicPageContainer from "@/app/(public)/public-page-container";
import PublicTopNav from "@/app/(public)/public-top-nav";
import type { CompanyPublicData } from "@/types/company-public-type";

const DEFAULT_LOGO = "/static/logo.png";

type CompanyContextValue = {
  company: CompanyPublicData;
  logoUrl: string;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

function toAbsoluteUrl(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = (process.env.NEXT_PUBLIC_API ?? "").trim().replace(/\/$/, "");
  return base ? `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}` : trimmed;
}

export function useCompany(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within <CompanyProvider>");
  }
  return context;
}

export function useSafeCompany(): CompanyContextValue | null {
  return useContext(CompanyContext);
}

type CompanyProviderProps = PropsWithChildren<{
  initialCompany: CompanyPublicData;
}>;

export default function CompanyProvider({
  children,
  initialCompany,
}: CompanyProviderProps) {
  const contextValue = useMemo<CompanyContextValue>(
    () => ({
      company: initialCompany,
      logoUrl: toAbsoluteUrl(initialCompany.logo) ?? DEFAULT_LOGO,
    }),
    [initialCompany]
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      <div className="flex min-h-svh flex-col bg-background">
        <PublicTopNav
          company={contextValue.company}
          logoUrl={contextValue.logoUrl}
        />
        <PublicPageContainer>{children}</PublicPageContainer>
        <PublicFooter company={contextValue.company} />
      </div>
    </CompanyContext.Provider>
  );
}
