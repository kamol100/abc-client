"use client";

import { FC } from "react";
import { useFormContext } from "react-hook-form";
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
  telegramNotificationSections,
  TelegramFormFieldSchema,
} from "@/components/telegram/telegram-form-schema";
import { useProfile } from "@/context/app-provider";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<TelegramRow> & { id: string };
};

function TelegramNotificationOptions({ platform }: { platform: boolean }) {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const selected = new Set((watch("events") as string[] | undefined) ?? []);
  const sections = telegramNotificationSections(platform);

  const toggleOption = (key: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    setValue("events", Array.from(next), { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.id} className="space-y-3 rounded-md border p-3 sm:p-4">
          <div>
            <h2 className="text-sm font-medium">{t(section.title)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(section.description)}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {section.groups.map((group) => (
              <div key={`${section.id}-${group.title}`} className="rounded-md border p-3">
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
      ))}
    </div>
  );
}

const TelegramForm: FC<Props> = ({
  mode = "create",
  api = "/telegram",
  method = "POST",
  data = undefined,
}) => {
  const fields = TelegramFormFieldSchema();
  const { profile } = useProfile();
  const platform = profile.company?.platform === true;

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
            <TelegramNotificationOptions platform={platform} />
          </div>
        )}
      </FormBuilder>
    </MyDialog>
  );
};

export default TelegramForm;
