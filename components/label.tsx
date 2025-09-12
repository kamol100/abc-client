import { Label as LabelUI } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { InfoQuestion } from "./icon";

type props = {
  labelText?: any;
  className?: string;
  labelClass?: string;
  mandatory?: boolean;
  htmlFor?: string;
  tooltip?: string | null;
  tooltipClass?: string;
};
const Label = ({
  className,
  labelText,
  labelClass,
  mandatory = false,
  htmlFor,
  tooltip = null,
  tooltipClass = "",
}: props) => {
  const { t } = useTranslation();
  return (
    <LabelUI
      className={cn("text-sm mb-1 font-medium text-gray-900", className)}
      htmlFor={htmlFor}
    >
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger className="flex gap-3">
            <div className={`capitalize ${labelClass}`}>{t(labelText)}</div>
            {mandatory && <div className="text-red-600 ml-1"> *</div>}
            <InfoQuestion />
          </TooltipTrigger>
          <TooltipContent>
            <div className={tooltipClass}>{t(tooltip)}</div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <>
          <div className="flex">
            <div className={`capitalize ${labelClass}`}>{t(labelText)}</div>
            {mandatory && <div className="text-red-600 ml-1"> *</div>}
          </div>
        </>
      )}
    </LabelUI>
  );
};

export default Label;
