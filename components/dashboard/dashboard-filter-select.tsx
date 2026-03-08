"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

type FilterOption = {
  value: string;
  label?: string;
  labelKey?: string;
};

type DashboardFilterSelectProps = {
  value: string;
  options: ReadonlyArray<FilterOption>;
  onValueChange: (value: string) => void;
  placeholderKey: string;
  className?: string;
};

export default function DashboardFilterSelect({
  value,
  options,
  onValueChange,
  placeholderKey,
  className,
}: DashboardFilterSelectProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={t(placeholderKey)} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label ?? (option.labelKey ? t(option.labelKey) : option.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
