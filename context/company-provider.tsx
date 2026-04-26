"use client";

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import type { CompanyPublicData } from "@/types/company-public-type";
import { resolveApiAssetUrlWithFallback } from "@/lib/helper/helper";

const DEFAULT_LOGO = "/static/logo.png";

type CompanyContextValue = {
  company: CompanyPublicData;
  logoUrl: string;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

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
      logoUrl: resolveApiAssetUrlWithFallback(initialCompany.logo, DEFAULT_LOGO),
    }),
    [initialCompany]
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}
