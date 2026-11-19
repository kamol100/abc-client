"use client";

import FormBuilder from "@/components/form-wrapper/form-builder";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { contractFields, contractFormSchema, enrollmentFields, sellerEnrollmentSchema } from "@/components/referrals/referral-form-schema";
import type { ReferralSeller } from "@/components/referrals/referral-type";
import useApiMutation from "@/hooks/use-api-mutation";

export function ReferralEnrollmentForm({ userUuid }: { userUuid?: string }) {
  return (
    <MyDialog title="referral.actions.enroll" trigger={<MyButton action="add" variant="default" title="referral.actions.enroll" />}>
      <FormBuilder
        formSchema={enrollmentFields}
        schema={sellerEnrollmentSchema}
        data={userUuid ? { user_uuid: userUuid } : undefined}
        api="platform-referral-sellers"
        queryKey="platform-referral-sellers"
        mode="create"
        method="POST"
        successMessage="referral.saved"
      />
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
