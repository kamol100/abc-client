"use client";

import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { formatMoney } from "@/lib/helper/helper";
import { ResellerRow } from "@/components/resellers/reseller-type";

type Props = {
    reseller: ResellerRow;
};

type InfoRowProps = {
    label: string;
    value?: ReactNode;
};

const InfoRow: FC<InfoRowProps> = ({ label, value }) => (
    <div className="flex items-start gap-2 py-1.5 text-sm">
        <span className="w-40 shrink-0 text-muted-foreground font-medium">{label}</span>
        <span className="text-muted-foreground font-medium">:</span>
        <span className="min-w-0 break-words">{value}</span>
    </div>
);

const ResellerBasicView: FC<Props> = ({ reseller }) => {
    const { t } = useTranslation();

    const placeholder = t("reseller.view.not_available");
    const packageNames = (reseller.package ?? [])
        .map((item) => item?.name)
        .filter((name): name is string => Boolean(name))
        .join(", ");
    const upazilaNames = (reseller.upazilas ?? [])
        .map((item) => item?.name)
        .filter((name): name is string => Boolean(name))
        .join(", ");

    const billingType =
        reseller.billing_type === "postpaid"
            ? t("common.postpaid")
            : reseller.billing_type === "prepaid"
                ? t("common.prepaid")
                : reseller.billing_type || placeholder;

    const gender =
        reseller.gender === "male"
            ? t("common.male")
            : reseller.gender === "female"
                ? t("common.female")
                : reseller.gender || placeholder;

    const maritalStatus =
        Number(reseller.marital_status ?? 0) === 1
            ? t("common.married")
            : t("common.unmarried");

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
                <div className="border-b bg-muted/40 px-3 py-2.5">
                    <h2 className="text-base font-semibold">{t("reseller.view.profile_information")}</h2>
                </div>
                <div className="px-3 py-3">
                    <InfoRow label={t("reseller.view.reseller_id")} value={reseller.reseller_id || placeholder} />
                    <InfoRow label={t("reseller.name.label")} value={reseller.name || placeholder} />
                    <InfoRow label={t("common.phone")} value={reseller.phone || placeholder} />
                    <InfoRow label={t("common.email")} value={reseller.email || placeholder} />
                    <InfoRow label={t("reseller.zone.label")} value={reseller.zone?.name || placeholder} />
                    <InfoRow label={t("reseller.network.label")} value={reseller.network?.name || placeholder} />
                    <InfoRow label={t("reseller.package.label")} value={packageNames || placeholder} />
                    <InfoRow label={t("reseller.view.thana_upazila")} value={upazilaNames || placeholder} />
                    <InfoRow label={t("reseller.gender.label")} value={gender} />
                    <InfoRow label={t("reseller.marital_status.label")} value={maritalStatus} />
                    <InfoRow label={t("reseller.blood_group.label")} value={reseller.blood_group || placeholder} />
                </div>
            </Card>

            <Card>
                <div className="border-b bg-muted/40 px-3 py-2.5">
                    <h2 className="text-base font-semibold">{t("reseller.view.account_information")}</h2>
                </div>
                <div className="px-3 py-3">
                    <InfoRow label={t("common.username")} value={reseller.user?.username || reseller.username || placeholder} />
                    <InfoRow label={t("common.password")} value={reseller.password || placeholder} />
                    <InfoRow label={t("reseller.billing_type.label")} value={billingType} />
                    <InfoRow
                        label={t("reseller.auto_recharge.label")}
                        value={Number(reseller.auto_recharge ?? 0) === 1 ? t("common.yes") : t("common.no")}
                    />
                    <InfoRow label={t("reseller.over_due_amount.label")} value={formatMoney(reseller.over_due_amount)} />
                    <InfoRow label={t("reseller.terminate_hour.label")} value={reseller.terminate_hour ?? placeholder} />
                    <InfoRow label={t("reseller.terminate_minute.label")} value={reseller.terminate_minute ?? placeholder} />
                    <InfoRow label={t("reseller.serial_start_from.label")} value={reseller.serial_start_from ?? placeholder} />
                    <InfoRow label={t("reseller.prefix.label")} value={reseller.prefix || placeholder} />
                    <InfoRow label={t("reseller.date_of_birth.label")} value={reseller.date_of_birth || placeholder} />
                    <InfoRow label={t("reseller.join_date.label")} value={reseller.join_date || placeholder} />
                </div>
            </Card>

            <Card>
                <div className="border-b bg-muted/40 px-3 py-2.5">
                    <h2 className="text-base font-semibold">{t("reseller.view.additional_information")}</h2>
                </div>
                <div className="px-3 py-3">
                    <InfoRow label={t("reseller.company.label")} value={reseller.company || placeholder} />
                    <InfoRow label={t("reseller.company_phone.label")} value={reseller.company_phone || placeholder} />
                    <InfoRow label={t("reseller.company_address.label")} value={reseller.company_address || placeholder} />
                    <InfoRow label={t("reseller.father_name.label")} value={reseller.father_name || placeholder} />
                    <InfoRow label={t("reseller.mother_name.label")} value={reseller.mother_name || placeholder} />
                    <InfoRow label={t("reseller.present_address.label")} value={reseller.present_address || placeholder} />
                    <InfoRow label={t("reseller.permanent_address.label")} value={reseller.permanent_address || placeholder} />
                    <InfoRow label={t("reseller.social_media_account.label")} value={reseller.social_media_account || placeholder} />
                    <InfoRow label={t("reseller.nid.label")} value={reseller.nid || placeholder} />
                </div>
            </Card>
        </div>
    );
};

export default ResellerBasicView;
