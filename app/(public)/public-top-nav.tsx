"use client";

import type { CompanyPublicData } from "@/types/company-public-type";

type PublicTopNavProps = {
  company: CompanyPublicData;
  logoUrl: string;
};

export default function PublicTopNav({ company, logoUrl }: PublicTopNavProps) {

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2.5">
          <img
            src={logoUrl}
            alt={company.name ?? ""}
            className="h-7 w-auto object-contain"
          />
          {company.name && (
            <span className="text-sm font-semibold tracking-tight">
              {company.name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
