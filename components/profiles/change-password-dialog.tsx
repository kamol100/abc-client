"use client";

import FormBuilder from "@/components/form-wrapper/form-builder";
import { MyDialog } from "@/components/my-dialog";
import ChangePasswordFormFieldSchema from "@/components/profiles/change-password-form-schema";
import {
  CHANGE_PASSWORD_DEFAULTS,
  ChangePasswordFormSchema,
} from "@/components/profiles/change-password-type";

type ChangePasswordVariant = "tenant" | "reseller";

const CHANGE_PASSWORD_API: Record<ChangePasswordVariant, string> = {
  tenant: "/auth/change-password",
  reseller: "/auth/change-reseller-password",
};

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ChangePasswordVariant;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  variant,
}: ChangePasswordDialogProps) {
  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="user_profile.change_password.title"
    >
      {open && (
        <FormBuilder
          formSchema={ChangePasswordFormFieldSchema()}
          grids={1}
          data={CHANGE_PASSWORD_DEFAULTS}
          api={CHANGE_PASSWORD_API[variant]}
          mode="create"
          schema={ChangePasswordFormSchema}
          method="PUT"
          queryKey="change-password"
          successMessage="user_profile.change_password.success"
        />
      )}
    </MyDialog>
  );
}

export default ChangePasswordDialog;
