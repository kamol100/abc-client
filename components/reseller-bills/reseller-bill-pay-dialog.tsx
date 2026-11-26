"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { MyDialog } from "@/components/my-dialog";
import {
    resellerBillDue,
    resellerBillPaySchema,
    type ResellerBillRow,
} from "@/components/reseller-bills/reseller-bill-type";
import { formatMoney } from "@/lib/helper/helper";

type Props = {
    bill: ResellerBillRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const fields: FormFieldConfig[] = [
    {
        type: "number",
        name: "amount",
        label: { labelText: "reseller_bill.pay.amount.label" },
        placeholder: "reseller_bill.pay.amount.placeholder",
    },
    {
        type: "textarea",
        name: "note",
        label: { labelText: "reseller_bill.pay.note.label" },
        placeholder: "reseller_bill.pay.note.placeholder",
        rows: 2,
    },
];

/** Pays one bill, in full or in part, from the reseller's own wallet. */
const ResellerBillPayDialog: FC<Props> = ({ bill, open, onOpenChange }) => {
    const { t } = useTranslation();
    const due = resellerBillDue(bill);
    const schema = useMemo(() => resellerBillPaySchema(due), [due]);

    return (
        <MyDialog open={open} onOpenChange={onOpenChange} title="reseller_bill.pay.title" size="md">
            <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border p-3 text-sm">
                <dt className="text-muted-foreground">{t("invoice.invoice_id")}</dt>
                <dd className="text-right font-medium">{bill.trackID ?? "—"}</dd>
                <dt className="text-muted-foreground">{t("reseller_bill.due")}</dt>
                <dd className="text-right font-semibold text-destructive">৳{formatMoney(due)}</dd>
            </dl>
            <FormBuilder
                formSchema={fields}
                grids={1}
                data={{ amount: "", note: "" }}
                api={`/reseller-invoices/${bill.id}/pay-from-wallet`}
                mode="create"
                method="POST"
                schema={schema}
                queryKey="reseller-invoices,my-wallet,wallets"
                submitTitle="reseller_bill.pay.submit"
                successMessage="reseller_bill.pay.success"
                preventDuplicateSubmit
                onClose={() => onOpenChange(false)}
                onSuccess={() => onOpenChange(false)}
            />
        </MyDialog>
    );
};

export default ResellerBillPayDialog;
