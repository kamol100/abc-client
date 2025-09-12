import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";
import Label from "../label";
import { Input } from "../ui/input";

type InputFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  validationSchema?: z.ZodType<any>; // Optional validation schema
  isDynamic?: boolean; // Indicates if the input field is dynamic
  mandatory?: boolean;
  tooltip?: string | null;
  tooltipClass?: string;
};

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  className,
  validationSchema,
  isDynamic = false,
  mandatory = false,
  tooltip = null,
  tooltipClass = "",
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
          <Input
            id={name}
            placeholder={placeholder}
            type={type}
            value={value ?? ""} // Ensure a controlled input
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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

export default InputField;
