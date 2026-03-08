"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import Card from "@/components/card";
import Label from "@/components/label";
import SelectDropdown from "@/components/select-dropdown";
import { Form } from "@/components/ui/form";
import useApiMutation from "@/hooks/use-api-mutation";
import ReSyncFormFieldSchema from "@/components/re-sync/re-sync-form-schema";
import {
  ReSyncFormInput,
  ReSyncFormSchema,
  ReSyncPayload,
} from "@/components/re-sync/re-sync-type";

type ReSyncActionType = "load" | "resolve";

type ReSyncFormProps = {
  actionType?: ReSyncActionType;
};

const ACTION_CONFIG: Record<
  ReSyncActionType,
  {
    apiUrl: string;
    buttonKey: string;
    successMessageKey: string;
  }
> = {
  load: {
    apiUrl: "/client-sync",
    buttonKey: "re_sync.sync.actions.load",
    successMessageKey: "re_sync.messages.load_success",
  },
  resolve: {
    apiUrl: "/client-all-sync",
    buttonKey: "re_sync.sync.actions.all_sync",
    successMessageKey: "re_sync.messages.all_sync_success",
  },
};

export default function ReSyncForm({ actionType = "load" }: ReSyncFormProps) {
  const { t } = useTranslation();
  const form = useForm<ReSyncFormInput>({
    resolver: zodResolver(ReSyncFormSchema),
    mode: "onSubmit",
  });
  const config = ACTION_CONFIG[actionType];
  const [networkField] = ReSyncFormFieldSchema();

  const { mutate, isPending } = useApiMutation<unknown, ReSyncPayload>({
    url: config.apiUrl,
    method: "POST",
    invalidateKeys: "re-sync",
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
            <Label label={networkField.label} />
            <SelectDropdown
              name={networkField.name}
              api={networkField.api}
              placeholder={networkField.placeholder}
            />
          </div>
          <ActionButton
            action="save"
            type="submit"
            loading={isPending}
            title={t(config.buttonKey)}
            className="w-full sm:w-auto"
          />
        </form>
      </Form>
    </Card>
  );
}
