"use client";

import { FC } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { usePermissions, useProfile } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import CompanyProfileForm from "@/components/company-profile/company-profile-form";
import CompanyProfileLogoUpload from "@/components/company-profile/company-profile-logo-upload";
import { CompanyProfileRow } from "@/components/company-profile/company-profile-type";

type SessionUser = {
  reseller_id?: string | null;
};

type CompanyProfileClientProps = {
  companyId?: string;
};

const CompanyProfileClient: FC<CompanyProfileClientProps> = ({ companyId }) => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { hasPermission } = usePermissions();
  const { data: session } = useSession();

  const canAccess = hasPermission("company-settings.access");
  const canEdit = hasPermission("company-settings.edit");
  const resolvedCompanyId = companyId ?? profile?.company?.uuid ?? "";
  const isReseller = Boolean((session?.user as SessionUser | undefined)?.reseller_id);

  const profileEndpoint = isReseller
    ? `reseller/profile/${resolvedCompanyId}`
    : `company/profile/${resolvedCompanyId}`;

  const {
    data: companyResponse,
    isLoading,
    isError,
    refetch,
  } = useApiQuery<ApiResponse<CompanyProfileRow>>({
    queryKey: ["company-profile", resolvedCompanyId, isReseller ? "reseller" : "company"],
    url: profileEndpoint,
    pagination: false,
    enabled: canAccess && Boolean(resolvedCompanyId),
  });

  if (!canAccess) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">
          {t("company_profile.messages.no_access")}
        </p>
      </Card>
    );
  }

  if (!resolvedCompanyId) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          {t("company_profile.messages.company_not_found")}
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-5 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-28 w-full" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 space-y-3">
        <p className="text-sm text-destructive">
          {t("company_profile.messages.failed_to_load")}
        </p>
        <MyButton
          type="button"
          action="reset"
          title="company_profile.actions.retry"
          onClick={() => refetch()}
        />
      </Card>
    );
  }

  const company = companyResponse?.data;
  if (!company) return null;
  const uploadCompanyId = String(company.id ?? resolvedCompanyId);

  const normalizedStatus = String(company.status ?? "").toLowerCase();
  const isActive =
    normalizedStatus === "active" ||
    normalizedStatus === "1" ||
    normalizedStatus === "true";
  const isInactive =
    normalizedStatus === "inactive" ||
    normalizedStatus === "0" ||
    normalizedStatus === "false";

  return (
    <div className="space-y-4 pr-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">
          {t("company_profile.title")}
        </h1>
        <div className="flex items-center gap-2">
          {canEdit && (
            <CompanyProfileForm
              companyId={resolvedCompanyId}
              isReseller={isReseller}
              company={company}
            />
          )}
          <MyButton
            action="cancel"
            title="company_profile.actions.back_dashboard"
            url="/dashboard"
          />
        </div>
      </div>

      <Card className="p-4 sm:p-5 space-y-5">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="text-sm font-medium sm:w-40">
              {t("company_profile.status.label")}
            </span>
            <span
              className={`text-sm font-medium ${isActive
                ? "text-green-600"
                : isInactive
                  ? "text-destructive"
                  : "text-muted-foreground"
                }`}
            >
              {isActive
                ? t("common.active")
                : isInactive
                  ? t("common.inactive")
                  : "-"}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="text-sm font-medium sm:w-40">
              {t("company_profile.name.label")}
            </span>
            <span className="text-sm">{company.name || "-"}</span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="text-sm font-medium sm:w-40">
              {t("company_profile.phone.label")}
            </span>
            <span className="text-sm">{company.phone || "-"}</span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="text-sm font-medium sm:w-40">
              {t("company_profile.email.label")}
            </span>
            <span className="text-sm">{company.email || "-"}</span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="text-sm font-medium sm:w-40">
              {t("company_profile.address.label")}
            </span>
            <span className="text-sm">{company.address || "-"}</span>
          </div>
        </div>

        {canEdit && (
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompanyProfileLogoUpload
              type="logo"
              companyId={uploadCompanyId}
              scope={isReseller ? "reseller" : "company"}
              value={company.logo}
            />
            {/* <CompanyProfileLogoUpload
              type="favicon"
              companyId={uploadCompanyId}
              scope={isReseller ? "reseller" : "company"}
              value={company.favicon}
            /> */}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CompanyProfileClient;
