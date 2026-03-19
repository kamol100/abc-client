"use client";

import MyButton from "@/components/my-button";
import SelectDropdown from "@/components/select-dropdown";
import { Form } from "@/components/ui/form";
import useApiMutation from "@/hooks/use-api-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import MikrotikCommandFormFieldSchema from "./mikrotik-command-form-schema";
import {
  MikrotikCommandFormInput,
  MikrotikCommandFormSchema,
  MikrotikCommandPayload,
} from "./mikrotik-command-type";

type MikrotikCommandFormProps = {
  onSuccess: (result: unknown) => void;
};

const MikrotikCommandForm: FC<MikrotikCommandFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();

  const form = useForm<MikrotikCommandFormInput>({
    resolver: zodResolver(MikrotikCommandFormSchema),
    mode: "onChange",
    defaultValues: {
      network_id: undefined,
      command: "",
    },
  });

  const selectedNetworkId = form.watch("network_id");
  const hasNetwork = Boolean(selectedNetworkId);
  const fields = MikrotikCommandFormFieldSchema();

  const { mutateAsync, isPending } = useApiMutation<unknown, MikrotikCommandPayload>(
    {
      url: "/mikrotik-command",
      method: "POST",
    }
  );

  const onSubmit = async (values: MikrotikCommandFormInput) => {
    const payload = MikrotikCommandFormSchema.parse(values);
    const response = await mutateAsync(payload);
    onSuccess(response);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            if (field.type !== "dropdown") return null;
            const isCommandField = field.name === "command";

            return (
              <SelectDropdown
                key={field.name}
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                api={field.api}
                options={field.options}
                isClearable={field.isClearable}
                isDisabled={isPending || (isCommandField && !hasNetwork)}
              />
            );
          })}
        </div>

        <div className="flex justify-end">
          <MyButton
            action="search"
            type="submit"
            size="default"
            variant="default"
            loading={isPending}
            title={t("mikrotik_command.run")}
          />
        </div>
      </form>
    </Form>
  );
};

export default MikrotikCommandForm;
