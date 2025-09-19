import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import Label from "../label";
import { Switch as ShadcnSwitch } from "../ui/switch";

type InputFieldProps = {
  name: string;
  label?: string;
  type?: string;
  className?: string;
  value?: string | boolean | number;
  validationSchema?: z.ZodType<any>; // Optional validation schema
  mandatory?: boolean;
  tooltip?: string | null;
  tooltipClass?: string;
  onChange?: (x: any) => void;
};

const Switch: React.FC<InputFieldProps> = ({
  name,
  label,
  className,
  value = undefined,
  mandatory = false,
  tooltip = null,
  tooltipClass = "",
  onChange = () => {},
}) => {
  const { setValue } = useFormContext();

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setValue(name, enabled);
  }, [enabled]);

  useEffect(() => {
    if (value) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [value]);

  return (
    <div className={cn("flex flex-row gap-1", className)}>
      {label && (
        <Label
          labelText={label}
          mandatory={mandatory}
          htmlFor={`switch-${name}`}
          tooltip={tooltip}
          tooltipClass={tooltipClass}
          className="text-sm mb-1 font-medium text-gray-900"
        />
      )}

      <ShadcnSwitch
        id={`switch-${name}`}
        checked={enabled}
        name={name}
        onCheckedChange={() => {
          setEnabled(!enabled);
          onChange(enabled);
        }}
      />
    </div>
  );
};

export default Switch;
