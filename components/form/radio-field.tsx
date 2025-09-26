import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // shadcn radio
import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";
import Label from "../label";

type RadioOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

type RadioFieldProps = {
  name: string;
  label?: string;
  options: RadioOption[];
  className?: string;
  validationSchema?: z.ZodType<any>;
  isDynamic?: boolean;
  mandatory?: boolean;
  tooltip?: string | null;
  tooltipClass?: string;
  direction?: "row" | "col"; // layout direction
  defaultValue?: string;
};

const RadioField: React.FC<RadioFieldProps> = ({
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
  defaultValue,
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
        render={({ field: { value, onChange } }) => (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            defaultValue={defaultValue}
            className={cn(
              "flex gap-4",
              direction === "col" ? "flex-col" : "flex-row",
              errors[name] && "border-red-500 rounded-md p-2"
            )}
          >
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(opt.value)}
                  id={`${name}-${opt.value}`}
                  disabled={opt.disabled}
                  className={cn(
                    errors[name] ? "border-red-500" : "",
                    "focus:ring-2 focus:ring-ring"
                  )}
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
            ))}
          </RadioGroup>
        )}
      />

      {getErrorMessage()}
    </div>
  );
};

export default RadioField;
