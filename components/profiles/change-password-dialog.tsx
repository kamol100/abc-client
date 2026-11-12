"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { MyDialog } from "@/components/my-dialog";
import ChangePasswordFormFieldSchema, {
  ChangeUsernameFormFieldSchema,
} from "@/components/profiles/change-password-form-schema";
import {
  CHANGE_PASSWORD_DEFAULTS,
  ChangePasswordFormSchema,
  ChangeUsernameFormSchema,
} from "@/components/profiles/change-password-type";
import { useProfile } from "@/context/app-provider";
import { cn } from "@/lib/utils";

type ChangePasswordVariant = "tenant" | "reseller";
type AccountSecurityTab = "password" | "username";

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
  const { profile, updateProfile } = useProfile();

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="user_profile.account_security.title"
    >
      {open && (
        <AccountSecurityPanel
          variant={variant}
          username={profile.username ?? ""}
          onUsernameUpdated={(username) => updateProfile({ username })}
        />
      )}
    </MyDialog>
  );
}

interface AccountSecurityPanelProps {
  variant: ChangePasswordVariant;
  username: string;
  onUsernameUpdated: (username: string) => void;
}

function AccountSecurityPanel({
  variant,
  username,
  onUsernameUpdated,
}: AccountSecurityPanelProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<AccountSecurityTab>("password");

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label={t("user_profile.account_security.title")}
        className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
      >
        <AccountSecurityTabButton
          selected={tab === "password"}
          onSelect={() => setTab("password")}
          label={t("user_profile.account_security.tabs.password")}
        />
        <AccountSecurityTabButton
          selected={tab === "username"}
          onSelect={() => setTab("username")}
          label={t("user_profile.account_security.tabs.username")}
        />
      </div>
      <div role="tabpanel" hidden={tab !== "password"}>
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
      </div>
      <div role="tabpanel" hidden={tab !== "username"}>
        <FormBuilder
          formSchema={ChangeUsernameFormFieldSchema()}
          grids={1}
          data={{ current_username: username, username: "" }}
          api="/auth/change-username"
          mode="create"
          schema={ChangeUsernameFormSchema}
          method="PUT"
          queryKey="staff-account"
          successMessage="user_profile.account_security.change_username.success"
          transformPayload={(values) => ({ username: values.username })}
          onSuccess={(response, payload) => {
            const saved = response?.username ?? payload.username;
            if (typeof saved === "string" && saved !== "") {
              onUsernameUpdated(saved);
            }
          }}
        />
      </div>
    </div>
  );
}

interface AccountSecurityTabButtonProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
}

function AccountSecurityTabButton({
  selected,
  onSelect,
  label,
}: AccountSecurityTabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground",
        selected && "bg-background text-foreground shadow-sm"
      )}
    >
      {label}
    </button>
  );
}

export default ChangePasswordDialog;
