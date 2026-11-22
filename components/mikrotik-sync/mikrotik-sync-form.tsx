"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Import, RefreshCw, type LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Label from "@/components/label";
import MyButton, { type MyButtonActionType } from "@/components/my-button";
import { MyDialog, useMyDialogClose } from "@/components/my-dialog";
import SelectDropdown from "@/components/select-dropdown";
import { MikrotikSyncNetworkFieldSchema } from "@/components/mikrotik-sync/mikrotik-sync-form-schema";
import {
  MikrotikSyncNetworkInput,
  MikrotikSyncNetworkPayload,
  MikrotikSyncNetworkSchema,
} from "@/components/mikrotik-sync/mikrotik-sync-type";
import { Form } from "@/components/ui/form";
import useApiMutation from "@/hooks/use-api-mutation";

type MikrotikSyncAction = "load" | "resolve";

const ACTION_CONFIG: Record<
  MikrotikSyncAction,
  {
    apiUrl: string;
    buttonKey: string;
    buttonAction: MyButtonActionType;
    icon: LucideIcon;
    successMessageKey: string;
    descriptionKey: string;
  }
> = {
  load: {
    apiUrl: "/mikrotik-sync/load",
    buttonKey: "mikrotik_sync.sync.actions.load",
    buttonAction: "import",
    icon: Import,
    successMessageKey: "mikrotik_sync.messages.load_success",
    descriptionKey: "mikrotik_sync.sync.descriptions.load",
  },
  resolve: {
    apiUrl: "/mikrotik-sync/resolve-all",
    buttonKey: "mikrotik_sync.sync.actions.all_sync",
    buttonAction: "sync",
    icon: RefreshCw,
    successMessageKey: "mikrotik_sync.messages.all_sync_success",
    descriptionKey: "mikrotik_sync.sync.descriptions.resolve",
  },
};

/** Network select + submit. Closes its dialog after a successful run. */
function MikrotikSyncForm({ action }: { action: MikrotikSyncAction }) {
  const { t } = useTranslation();
  const closeDialog = useMyDialogClose();
  const form = useForm<MikrotikSyncNetworkInput>({
    resolver: zodResolver(MikrotikSyncNetworkSchema),
    mode: "onSubmit",
  });
  const config = ACTION_CONFIG[action];
  const [networkField] = MikrotikSyncNetworkFieldSchema();
  const { mutate, isPending } = useApiMutation<unknown, MikrotikSyncNetworkPayload>({
    url: config.apiUrl,
    method: "POST",
    invalidateKeys: "mikrotik-sync",
    successMessage: config.successMessageKey,
    onSuccess: () => {
      form.reset();
      closeDialog?.();
    },
  });

  if (!networkField || networkField.type !== "dropdown") return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutate(values))} className="flex flex-col gap-4">
        <div>
          <Label label={networkField.label} />
          <SelectDropdown
            name={networkField.name}
            api={networkField.api}
            placeholder={networkField.placeholder}
          />
        </div>
        <div className="flex justify-end">
          <MyButton
            action={config.buttonAction}
            type="submit"
            size="default"
            variant="default"
            loading={isPending}
            title={t(config.buttonKey)}
            className="w-full sm:w-auto"
          />
        </div>
      </form>
    </Form>
  );
}

/**
 * Toolbar button that opens the Import (load) or All Sync (resolve) form in a
 * dialog. Icon only on phones, icon + label from md up.
 */
export default function MikrotikSyncActionButton({ action }: { action: MikrotikSyncAction }) {
  const { t } = useTranslation();
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  return (
    <MyDialog
      size="md"
      title={config.buttonKey}
      description={config.descriptionKey}
      trigger={
        <MyButton
          type="button"
          action={config.buttonAction}
          size="default"
          variant="outline"
          className="shrink-0 max-md:w-9 max-md:px-0"
          aria-label={t(config.buttonKey)}
        >
          <Icon aria-hidden />
          <span className="hidden md:inline">{t(config.buttonKey)}</span>
        </MyButton>
      }
    >
      <MikrotikSyncForm action={action} />
    </MyDialog>
  );
}
