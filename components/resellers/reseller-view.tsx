"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Boxes, Edit, UserRound, UsersRound } from "lucide-react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { usePermissions } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/card";
import ResellerBasicView from "@/components/resellers/reseller-basic-view";
import ResellerPackageTable from "@/components/resellers/reseller-package-table";
import ResellerClientTable from "@/components/resellers/reseller-client-table";
import ResellerViewSkeleton from "@/components/resellers/reseller-view-skeleton";
import { ResellerRow } from "@/components/resellers/reseller-type";

type Props = {
    resellerId: string;
};

type ViewTab = "profile" | "packages" | "clients";

const ResellerView: FC<Props> = ({ resellerId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [activeTab, setActiveTab] = useState<ViewTab>("profile");

    const { data, isLoading, isError } = useApiQuery<ApiResponse<ResellerRow>>({
        queryKey: ["resellers", "detail", resellerId],
        url: `resellers/${resellerId}`,
        pagination: false,
    });

    const reseller = data?.data;
    const clientTabAllowed = hasPermission("resellers.client");
    const isActive = Number(reseller?.status ?? 0) === 1;

    const tabs = useMemo(
        () =>
            [
                { key: "profile" as const, label: t("reseller.view.tabs.profile"), icon: UserRound, show: true },
                { key: "packages" as const, label: t("reseller.view.tabs.package"), icon: Boxes, show: true },
                { key: "clients" as const, label: t("reseller.view.tabs.client"), icon: UsersRound, show: clientTabAllowed },
            ].filter((item) => item.show),
        [clientTabAllowed, t]
    );

    if (isLoading) {
        return <ResellerViewSkeleton />;
    }

    if (isError) {
        return (
            <Card>
                <div className="p-6 text-center text-sm text-destructive">
                    {t("common.request_failed")}
                </div>
            </Card>
        );
    }

    if (!reseller) return null;

    return (
        <div className="space-y-4 overflow-auto pr-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <MyButton variant="default" size="icon" url="/resellers">
                        <ArrowLeft className="h-4 w-4" />
                    </MyButton>
                    <h1 className="text-lg sm:text-xl font-semibold">{t("reseller.view_title")}</h1>
                    <Badge variant={isActive ? "default" : "destructive"}>
                        {isActive ? t("common.active") : t("common.inactive")}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    {hasPermission("resellers.edit") && (
                        <MyButton action="edit" url={`/resellers/edit/${reseller.id}`}>
                            <Edit className="h-4 w-4" />
                            {t("reseller.actions.edit")}
                        </MyButton>
                    )}
                    <MyButton action="cancel" title="reseller.title_plural" url="/resellers" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isCurrent = activeTab === tab.key;
                    return (
                        <MyButton
                            key={tab.key}
                            action="edit"
                            variant={isCurrent ? "default" : "outline"}
                            className={isCurrent ? "" : "hover:bg-primary hover:text-primary-foreground"}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </MyButton>
                    );
                })}
            </div>

            {activeTab === "profile" && <ResellerBasicView reseller={reseller} />}
            {activeTab === "packages" && <ResellerPackageTable packages={reseller.package ?? []} />}
            {activeTab === "clients" && clientTabAllowed && (
                <ResellerClientTable resellerId={String(reseller.id)} />
            )}
        </div>
    );
};

export default ResellerView;
