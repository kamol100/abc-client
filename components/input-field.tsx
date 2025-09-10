"use client";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

type Props = {
  labelText?: string;
  name: string;
  inputType?: string;
  errors?: any;
  labelCls?: string;
  placeholder?: string;
  mandatory?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  className?: string;
  toolTip?: string;
  description?: string;
};

const InputField: FC<Props> = ({
  labelText,
  name,
  inputType = "text",
  labelCls = "",
  placeholder = "",
  mandatory = false,
  readonly = false,
  disabled = false,
  className = "",
  toolTip = "",
  description,
}) => {
  const { control } = useFormContext();
  const { t } = useTranslation();

  return (
    <div >
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={labelCls}>
            {labelText && (
              <FormLabel>
                <span className="text-base font-medium">{t(labelText)}</span>
                {mandatory && <span className="ml-1 text-red-600">*</span>}
              </FormLabel>
            )}
            <FormControl className={className}>
              <Input
                {...field}
                type={inputType}
                readOnly={readonly}
                disabled={disabled}
                placeholder={t(placeholder)}
                value={field.value ?? ""}
              />
            </FormControl>
            {description && <FormDescription>{t(description)}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default InputField;
