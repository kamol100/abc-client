"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import {
  TelegramZoneFormSchema,
  TelegramZoneRow,
} from "@/components/telegram-zones/telegram-zone-type";
import { TelegramZoneFormFieldSchema } from "@/components/telegram-zones/telegram-zone-form-schema";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<TelegramZoneRow> & { id: string };
};

const TelegramZoneForm: FC<Props> = ({
  mode = "create",
  api = "/telegram-zones",
  method = "POST",
  data = undefined,
}) => {
  return (
    <MyDialog
      size="xl"
      title={mode === "create" ? "telegram_zone.create_title" : "telegram_zone.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={TelegramZoneFormFieldSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={TelegramZoneFormSchema}
        method={method}
        queryKey="telegram-zones"
      />
    </MyDialog>
  );
};

export default TelegramZoneForm;
