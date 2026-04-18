"use client";

import type { CompanyPublicData } from "@/types/company-public-type";

type PublicFooterProps = {
  company: CompanyPublicData;
};

export default function PublicFooter({ company }: PublicFooterProps) {

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between gap-3 px-4 text-xs text-muted-foreground">
        <div>
          <div className="truncate">{company.name ?? ""}</div>
          {company.address && (
            <div>{company?.address ?? ""}</div>
          )}
        </div>
        {company?.phone && (
          <span>{company?.phone}</span>
        )}
        {company?.email && (
          <span>{company?.email}</span>
        )}
      </div>
    </footer>
  );
}
