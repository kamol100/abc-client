"use client";
import { Label as LabelUI } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { InfoQuestion } from "./icon";
import { LabelProps } from "./form-wrapper/form-builder-type";

type props = {
  label?: LabelProps;
};
const Label = ({
  label = {
    labelText: "",
    className: "",
    labelClass: "",
    mandatory: false,
    tooltip: null,
    tooltipClass: "",
  },
}: props) => {
  const { t } = useTranslation();
  return (
    <LabelUI
      className={cn("text-sm mb-1 font-medium text-foreground", label?.className)}
      htmlFor={label?.labelText?.toString()}
    >
      <div className="flex gap-2">
        <div className={`capitalize ${label?.labelClass}`}>{t(label?.labelText || "") as string}</div>
        {label?.mandatory && <div className="text-destructive ml-1"> *</div>}
        {label?.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex text-muted-foreground cursor-pointer">
                <InfoQuestion />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className={label?.tooltipClass}>{t(label?.tooltip || "")}</div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </LabelUI>
  );
};

export default Label;
