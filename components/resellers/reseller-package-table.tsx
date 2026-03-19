"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import { useResellerPackageColumns } from "@/components/resellers/reseller-package-column";
import { ResellerPackageRow } from "@/components/resellers/reseller-type";

type Props = {
    packages: ResellerPackageRow[];
};

const ResellerPackageTable: FC<Props> = ({ packages }) => {
    const { t } = useTranslation();
    const columns = useResellerPackageColumns();

    return (
        <Card>
            <div className="border-b bg-muted/40 px-3 py-2.5">
                <h2 className="text-base font-semibold">{t("reseller.view.package_information")}</h2>
            </div>
            <div className="p-3">
                {packages.length > 0 ? (
                    <DataTable toolbar={false} data={packages} columns={columns} />
                ) : (
                    <div className="text-sm text-muted-foreground py-6 text-center">
                        {t("reseller.view.empty_packages")}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ResellerPackageTable;
