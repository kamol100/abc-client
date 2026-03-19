"use client";

import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import SmsTemplateFormFieldSchema from "@/components/sms-templates/sms-template-form-schema";
import {
  SMS_TEMPLATE_TOKENS,
  SmsTemplateFormInput,
  SmsTemplateFormSchema,
  SmsTemplateRow,
} from "@/components/sms-templates/sms-template-type";
import { FC, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";

type SmsTemplateFormProps = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<SmsTemplateRow> & { id: number };
};

type SmsTemplateFormLayoutProps = {
  formFields: FormFieldConfig[];
  renderField: (field: FormFieldConfig) => ReactNode;
};

const SmsTemplateFormLayout: FC<SmsTemplateFormLayoutProps> = ({
  formFields,
  renderField,
}) => {
  const { t } = useTranslation();
  const { getValues, setValue } = useFormContext<SmsTemplateFormInput>();

  const nameField = formFields.find((field) => field.name === "name");
  const templateTypeField = formFields.find(
    (field) => field.name === "template_type",
  );
  const messageField = formFields.find((field) => field.name === "message");

  const insertToken = (token: string) => {
    const message = getValues("message") ?? "";
    const textArea = document.getElementById("message") as
      | HTMLTextAreaElement
      | null;

    const start = textArea?.selectionStart ?? message.length;
    const end = textArea?.selectionEnd ?? start;
    const nextMessage = `${message.slice(0, start)}${token}${message.slice(end)}`;

    setValue("message", nextMessage, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (textArea) {
      requestAnimationFrame(() => {
        const cursor = start + token.length;
        textArea.focus();
        textArea.setSelectionRange(cursor, cursor);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-4">
        {nameField ? renderField(nameField) : null}
        {templateTypeField ? renderField(templateTypeField) : null}
        {messageField ? renderField(messageField) : null}
      </div>

      <div className="space-y-3 rounded-md border bg-muted/40 p-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t("sms_template.tokens.title")}</p>
          <p className="text-xs text-muted-foreground">
            {t("sms_template.tokens.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {SMS_TEMPLATE_TOKENS.map((token) => (
            <MyButton
              key={token}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full justify-start px-2 font-mono text-xs hover:bg-muted"
              onClick={() => insertToken(token)}
            >
              {token}
            </MyButton>
          ))}
        </div>
      </div>
    </div>
  );
};

const SmsTemplateForm: FC<SmsTemplateFormProps> = ({
  mode = "create",
  api = "/sms-templates",
  method = "POST",
  data = undefined,
}) => {
  const formSchema = useMemo(() => SmsTemplateFormFieldSchema(), []);

  return (
    <MyDialog
      size="3xl"
      title={mode === "create" ? "sms_template.create_title" : "sms_template.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={formSchema}
        grids={1}
        data={data}
        api={api}
        mode={mode}
        schema={SmsTemplateFormSchema}
        method={method}
        queryKey="sms-templates"
      >
        {(renderField) => (
          <SmsTemplateFormLayout formFields={formSchema} renderField={renderField} />
        )}
      </FormBuilder>
    </MyDialog>
  );
};

export default SmsTemplateForm;
