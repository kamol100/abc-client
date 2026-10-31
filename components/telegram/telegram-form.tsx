"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import {
  TelegramFormSchema,
  TelegramRow,
} from "@/components/telegram/telegram-type";
import { TelegramFormFieldSchema } from "@/components/telegram/telegram-form-schema";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<TelegramRow> & { id: string };
};

const TelegramForm: FC<Props> = ({
  mode = "create",
  api = "/telegram",
  method = "POST",
  data = undefined,
}) => {
  return (
    <MyDialog
      size="2xl"
      title={mode === "create" ? "telegram.create_title" : "telegram.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={TelegramFormFieldSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={TelegramFormSchema}
        method={method}
        queryKey="telegram"
      />
    </MyDialog>
  );
};

export default TelegramForm;
