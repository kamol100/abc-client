"use client";
import { ReactNode } from "react";
import { Label as LabelUI } from "@/components/ui/label";
import MyTooltip from "@/components/my-tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { InfoQuestion } from "./icon";
import { LabelProps } from "./form-wrapper/form-builder-type";

type props = {
  label?: LabelProps;
  suffix?: ReactNode;
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
  suffix,
}: props) => {
  const { t } = useTranslation();
  return (
    <LabelUI
      className={cn("text-sm mb-1 font-medium text-foreground", label?.className)}
      htmlFor={label?.labelText?.toString()}
    >
      <div className={cn("flex gap-2", suffix && "items-center gap-4")}>
        <div className="flex gap-2">
          <div className={`capitalize ${label?.labelClass}`}>{t(label?.labelText || "") as string}</div>
          {label?.mandatory && <div className="text-destructive ml-1"> *</div>}
          {label?.tooltip && (
            <MyTooltip
              content={<div className={label?.tooltipClass}>{t(label.tooltip)}</div>}
            >
              <span className="inline-flex text-muted-foreground cursor-pointer">
                <InfoQuestion />
              </span>
            </MyTooltip>
          )}
        </div>
        {suffix}
      </div>
    </LabelUI>
  );
};

export default Label;
