"use client";

import { useTranslation } from "react-i18next";
import { useCompany } from "@/context/company-provider";

export default function PublicFooter() {
  const { company } = useCompany();
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 max-w-7xl">
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <div className="truncate font-medium">{company.name ?? ""}</div>
          {company.address && <div>{company.address}</div>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {company.phone && <span>{company.phone}</span>}
          {company.email && <span>{company.email}</span>}
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-3 text-center text-xs text-muted-foreground sm:px-6">
          {t("marketing.footer.copyright", { name: company.name ?? "ISPTik", year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
