"use client";

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TelegramFormSchema,
  TelegramRow,
} from "@/components/telegram/telegram-type";
import {
  TELEGRAM_NOTIFICATION_GROUPS,
  TelegramFormFieldSchema,
} from "@/components/telegram/telegram-form-schema";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<TelegramRow> & { id: string };
};

function TelegramNotificationOptions() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  const toggleOption = (key: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  return (
    <section className="space-y-3 rounded-md border p-3 sm:p-4">
      <div>
        <h2 className="text-sm font-medium">{t("telegram.notifications.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("telegram.notifications.description")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TELEGRAM_NOTIFICATION_GROUPS.map((group) => (
          <div key={group.title} className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">{t(group.title)}</p>
            <div className="flex flex-col gap-2">
              {group.options.map((option) => {
                const inputId = `telegram-notification-${option.key}`;
                return (
                  <label
                    key={option.key}
                    htmlFor={inputId}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      id={inputId}
                      checked={selected.has(option.key)}
                      onCheckedChange={(checked) =>
                        toggleOption(option.key, checked === true)
                      }
                    />
                    <span>{t(option.label)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const TelegramForm: FC<Props> = ({
  mode = "create",
  api = "/telegram",
  method = "POST",
  data = undefined,
}) => {
  const fields = TelegramFormFieldSchema();

  return (
    <MyDialog
      size="3xl"
      title={mode === "create" ? "telegram.create_title" : "telegram.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={fields}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={TelegramFormSchema}
        method={method}
        queryKey="telegram"
      >
        {(renderField) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name}>{renderField(field)}</div>
              ))}
            </div>
            <TelegramNotificationOptions />
          </div>
        )}
      </FormBuilder>
    </MyDialog>
  );
};

export default TelegramForm;
