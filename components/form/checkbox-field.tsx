import { Checkbox } from "@/components/ui/checkbox"; // shadcn checkbox
import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";
import Label from "../label";

type CheckboxOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

type CheckboxFieldProps = {
  name: string;
  label?: string;
  options?: CheckboxOption[]; // if multiple checkboxes
  className?: string;
  validationSchema?: z.ZodType<any>;
  isDynamic?: boolean;
  mandatory?: boolean;
  tooltip?: string | null;
  tooltipClass?: string;
  direction?: "row" | "col"; // layout direction for multiple
  single?: boolean; // single checkbox mode
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  options,
  className,
  validationSchema,
  isDynamic = false,
  mandatory = false,
  tooltip = null,
  tooltipClass = "",
  direction = "col",
  single = false,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const getErrorMessage = () => {
    if (isDynamic && Array.isArray(errors[name])) {
      return (errors[name] as any[]).map((error, index) => (
        <p key={index} className="text-sm text-red-500 mt-1">
          {error?.message?.toString()}
        </p>
      ));
    }

    return errors[name] ? (
      <p className="text-sm text-red-500 mt-1">
        {errors[name]?.message?.toString()}
      </p>
    ) : null;
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <Label
          labelText={label}
          mandatory={mandatory}
          htmlFor={name}
          tooltip={tooltip}
          tooltipClass={tooltipClass}
          className="text-sm mb-1 font-medium text-gray-900"
        />
      )}

      <Controller
        name={name}
        control={control}
        rules={
          validationSchema
            ? { required: !validationSchema.safeParse(undefined).success }
            : undefined
        }
        render={({ field: { value, onChange } }) => {
          if (single) {
            // ✅ single checkbox (boolean)
            return (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={name}
                  checked={!!value}
                  onCheckedChange={onChange}
                  className={errors[name] ? "border-red-500" : ""}
                />
                <label
                  htmlFor={name}
                  className="text-sm text-gray-800 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            );
          }

          // ✅ multiple checkboxes (array)
          return (
            <div
              className={cn(
                "flex gap-4",
                direction === "col" ? "flex-col" : "flex-row",
                errors[name] && "border-red-500 rounded-md p-2"
              )}
            >
              {options?.map((opt, idx) => {
                const checked = Array.isArray(value)
                  ? value.includes(opt.value)
                  : false;

                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${name}-${opt.value}`}
                      checked={checked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onChange([...(value || []), opt.value]);
                        } else {
                          onChange(
                            (value || []).filter((v: any) => v !== opt.value)
                          );
                        }
                      }}
                      disabled={opt.disabled}
                      className={errors[name] ? "border-red-500" : ""}
                    />
                    <label
                      htmlFor={`${name}-${opt.value}`}
                      className={cn(
                        "text-sm text-gray-800 cursor-pointer",
                        opt.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {opt.label}
                    </label>
                  </div>
                );
              })}
            </div>
          );
        }}
      />

      {getErrorMessage()}
    </div>
  );
};

export default CheckboxField;
