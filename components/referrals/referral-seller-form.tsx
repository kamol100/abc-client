"use client";

import FormBuilder from "@/components/form-wrapper/form-builder";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { contractFields, contractFormSchema, enrollmentFields, sellerEnrollmentSchema } from "@/components/referrals/referral-form-schema";
import type { ReferralSeller } from "@/components/referrals/referral-type";
import useApiMutation from "@/hooks/use-api-mutation";
import { CircleCheck, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import Label from "@/components/label";

export function ReferralCodeGenerator() {
  const { setValue, formState: { isSubmitting } } = useFormContext();
  const { t } = useTranslation();

  const generate = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const code = "REF-" + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
    setValue("code", code, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  return (
    <MyButton type="button" variant="outline" size="default" className="shrink-0" onClick={generate} disabled={isSubmitting}>
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      {t("referral.actions.generate_code")}
    </MyButton>
  );
}

export function ReferralEnrollmentForm({ userUuid, enrolled = false, sellerType }: {
  userUuid?: string;
  enrolled?: boolean;
  sellerType?: ReferralSeller["seller_type"] | null;
}) {
  const { t } = useTranslation();
  if (enrolled) {
    return (
      <MyButton disabled variant="outline">
        <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t(sellerType ? `referral.enrolled_as.${sellerType}` : "referral.enrolled")}
      </MyButton>
    );
  }
  return (
    <MyDialog title="referral.actions.enroll" trigger={<MyButton action="add" variant="default" title="referral.actions.enroll" />}>
      <FormBuilder
        formSchema={enrollmentFields}
        schema={sellerEnrollmentSchema}
        data={userUuid ? { user_uuid: userUuid } : undefined}
        api="platform-referral-sellers"
        queryKey="platform-referral-sellers,users"
        mode="create"
        method="POST"
        successMessage="referral.saved"
      >
        {(renderField) => (
          <div className="space-y-4">
            {enrollmentFields.map((field) => (
              <div key={field.name}>
                {field.name === "code" ? (
                  <div className="space-y-1">
                    <Label htmlFor={field.name} label={field.label} />
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">{renderField({ ...field, label: undefined })}</div>
                      <ReferralCodeGenerator />
                    </div>
                  </div>
                ) : renderField(field)}
              </div>
            ))}
          </div>
        )}
      </FormBuilder>
    </MyDialog>
  );
}

export function ReferralContractForm({ seller }: { seller: ReferralSeller }) {
  return (
    <MyDialog
      title="referral.actions.contract"
      trigger={<MyButton size="sm" variant="default" icon={false} title="referral.actions.contract" />}
    >
      <p className="mb-3 break-words text-sm font-medium">{seller.display_name}</p>
      <FormBuilder
        formSchema={contractFields}
        schema={contractFormSchema}
        api={`platform-referral-sellers/${seller.id}/contracts`}
        queryKey="platform-referral-sellers"
        mode="create"
        method="POST"
        successMessage="referral.saved"
      />
    </MyDialog>
  );
}

export function ReferralDeactivateForm({ seller }: { seller: ReferralSeller }) {
  const mutation = useApiMutation({
    url: `platform-referral-sellers/${seller.id}/deactivate`,
    method: "PATCH",
    invalidateKeys: "platform-referral-sellers",
    successMessage: "referral.saved",
  });

  return (
    <MyDialog
      title="referral.actions.deactivate"
      description="referral.deactivate_help"
      trigger={<MyButton size="sm" variant="outline" icon={false} title="referral.actions.deactivate" />}
      confirmText="referral.actions.deactivate"
      onConfirm={async () => { await mutation.mutateAsync(); }}
    />
  );
}
