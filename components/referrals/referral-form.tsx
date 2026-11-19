"use client";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import FormBuilder from "@/components/form-wrapper/form-builder";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { parseReferralDecimal, previewCommission, referralMoney } from "@/components/referrals/referral-amount";
import {
  approvalFields, approvalFormSchema, assistedReferralSchema, captureFields,
  payoutFields, payoutFormSchema, referralCaptureSchema, rejectionFields, rejectionFormSchema,
} from "@/components/referrals/referral-form-schema";
import type { ReferralRow } from "@/components/referrals/referral-type";

export function ReferralCaptureForm({ assisted = false, demoId }: { assisted?: boolean; demoId?: number }) {
  const title = assisted ? "referral.actions.attribute" : "referral.actions.add";
  const fields = useMemo(() => captureFields(assisted, demoId !== undefined), [assisted, demoId]);
  const api = assisted ? "platform-referrals" : "referrals";

  return (
    <MyDialog title={title} trigger={<MyButton action="add" variant="default" title={title} />}>
      <FormBuilder
        formSchema={fields}
        schema={assisted ? assistedReferralSchema : referralCaptureSchema}
        data={demoId === undefined ? undefined : { demo_request_id: String(demoId) }}
        api={api}
        queryKey={api}
        mode="create"
        method="POST"
        successMessage="referral.saved"
      />
    </MyDialog>
  );
}

function ApprovalPreview({ row }: { row: ReferralRow }) {
  const { t, i18n } = useTranslation();
  const sale = parseReferralDecimal(useWatch({ name: "approved_sale_minor" }));
  const commission = sale === null ? null : previewCommission(sale, row);

  return (
    <p className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm" aria-live="polite">
      {t("referral.commission_preview", {
        amount: commission === null ? t("referral.unavailable") : referralMoney(commission, i18n.language),
      })}
    </p>
  );
}

const operationForms = {
  approve: { fields: approvalFields, schema: approvalFormSchema },
  reject: { fields: rejectionFields, schema: rejectionFormSchema },
  payout: { fields: payoutFields, schema: payoutFormSchema },
};

export function ReferralDecisionForm({ row, operation }: { row: ReferralRow; operation: keyof typeof operationForms }) {
  const { t, i18n } = useTranslation();
  const { fields, schema } = operationForms[operation];
  const label = `referral.actions.${operation}`;

  return (
    <MyDialog
      title={label}
      description={operation === "payout" ? "referral.payout_help" : undefined}
      trigger={<MyButton size="sm" variant={operation === "reject" ? "outline" : "default"} icon={false} title={label} />}
    >
      <p className="mb-3 break-words text-sm font-medium">{row.prospect_name}</p>
      {operation === "payout" && row.commission_amount_minor !== null && (
        <p className="mb-3 rounded-md bg-muted px-3 py-2 text-sm">
          {t("referral.payout_total", { amount: referralMoney(row.commission_amount_minor, i18n.language) })}
        </p>
      )}
      <FormBuilder
        formSchema={fields}
        schema={schema}
        data={operation === "payout" ? { paid_at: new Date() } : undefined}
        api={`platform-referrals/${row.uuid}/${operation}`}
        queryKey="platform-referrals,referrals"
        mode="create"
        method="POST"
        successMessage="referral.saved"
      >
        {operation === "approve"
          ? (renderField) => (
            <div className="space-y-2">
              {fields.map((field) => <div className={field.className} key={field.name}>{renderField(field)}</div>)}
              <ApprovalPreview row={row} />
            </div>
          )
          : undefined}
      </FormBuilder>
    </MyDialog>
  );
}
