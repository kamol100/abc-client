"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import Label from "@/components/label";
import MyButton, { type MyButtonActionType } from "@/components/my-button";
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
    successMessageKey: string;
    descriptionKey: string;
  }
> = {
  load: {
    apiUrl: "/mikrotik-sync/load",
    buttonKey: "mikrotik_sync.sync.actions.load",
    buttonAction: "import",
    successMessageKey: "mikrotik_sync.messages.load_success",
    descriptionKey: "mikrotik_sync.sync.descriptions.load",
  },
  resolve: {
    apiUrl: "/mikrotik-sync/resolve-all",
    buttonKey: "mikrotik_sync.sync.actions.all_sync",
    buttonAction: "sync",
    successMessageKey: "mikrotik_sync.messages.all_sync_success",
    descriptionKey: "mikrotik_sync.sync.descriptions.resolve",
  },
};

export default function MikrotikSyncForm({
  action = "load",
}: {
  action?: MikrotikSyncAction;
}) {
  const { t } = useTranslation();
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
    },
  });

  if (!networkField || networkField.type !== "dropdown") return null;

  return (
    <Card className="p-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutate(values))}
          className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div>
            <div className="flex items-center gap-2">
              <Label label={networkField.label} />
              <p className="text-sm font-normal text-muted-foreground">
                {t(config.descriptionKey)}
              </p>
            </div>
            <SelectDropdown
              name={networkField.name}
              api={networkField.api}
              placeholder={networkField.placeholder}
            />
          </div>
          <MyButton
            action={config.buttonAction}
            type="submit"
            size={"default"}
            loading={isPending}
            title={t(config.buttonKey)}
            className="w-full sm:w-auto"
          />
        </form>
      </Form>
    </Card>
  );
}
