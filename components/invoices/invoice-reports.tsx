"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { CardContent } from "@/components/ui/card";
import Card from "../card";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceReports as InvoiceReportsType } from "./invoice-type";
import DisplayMoney from "../display-money";

type Props = {
    reports?: InvoiceReportsType | null;
    isLoading?: boolean;
};

const InvoiceReports: FC<Props> = ({ reports, isLoading = false }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return <Skeleton className="h-20 w-full" />;
    }

    return (
        <Card>
            <CardContent className="p-3 flex justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">
                        {t("invoice.reports.sub_total")}
                    </p>
                    <p className="font-semibold">
                        <DisplayMoney
                            amount={toNumber(reports?.total_amount)}
                            currency="BDT"
                            className="text-md font-semibold"
                            animate
                            duration={800}
                        />
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">
                        {t("invoice.reports.discount")}
                    </p>
                    <p className="font-semibold">
                        <DisplayMoney
                            amount={toNumber(reports?.discount)}
                            currency="BDT"
                            className="text-md font-semibold"
                            animate
                            duration={800}
                        />
                    </p>
                </div>
                <div className="flex justify-enter items-center">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            {t("invoice.reports.total")}
                        </p>
                        <p className="font-semibold">
                            <DisplayMoney
                                amount={toNumber(reports?.after_discount_amount)}
                                currency="BDT"
                                className="text-md font-semibold"
                                animate
                                duration={800}
                            />
                        </p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            {t("invoice.reports.paid")}
                        </p>
                        <p className="font-semibold">
                            <DisplayMoney
                                amount={toNumber(reports?.amount_paid)}
                                currency="BDT"
                                className="text-md font-semibold"
                                animate
                                duration={800}
                            />
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InvoiceReports;
