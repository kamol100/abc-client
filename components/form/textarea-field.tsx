import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";
import Label from "../label";
import { Textarea } from "../ui/textarea";

type TextareaFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  validationSchema?: z.ZodType<any>; // Optional validation schema
  isDynamic?: boolean; // For dynamic form arrays
  mandatory?: boolean;
  tooltip?: string | null;
  tooltipClass?: string;
  rows?: number;
};

const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  label,
  placeholder,
  className,
  validationSchema,
  isDynamic = false,
  mandatory = false,
  tooltip = null,
  tooltipClass = "",
  rows = 4,
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
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <Textarea
            id={name}
            placeholder={placeholder}
            value={value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
            rows={rows}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className,
              errors[name] ? "border-red-500" : "border-gray-300"
            )}
          />
        )}
      />

      {getErrorMessage()}
    </div>
  );
};

export default TextareaField;
