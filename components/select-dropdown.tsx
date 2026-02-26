"use client";

import { useFetch } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select, { MultiValue, SingleValue } from "react-select";
import type {
  LabelProps,
  SelectOption,
} from "./form-wrapper/form-builder-type";
import FieldError from "./form/field-error";
import Label from "./label";

type SelectDropdownProps = {
  name: string;
  label?: LabelProps;
  api?: string;
  options?: SelectOption[];
  isMulti?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  placeholder?: string;
  onValueChange?: (value: unknown) => void;
};

const SelectDropdown: FC<SelectDropdownProps> = ({
  name,
  label,
  api,
  options: staticOptions,
  isMulti = false,
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isSearchable = true,
  placeholder = "select_option",
  onValueChange,
}) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { data: apiOptions, isLoading: isApiLoading } = useQuery({
    queryKey: [`${name}-dropdown`, api],
    queryFn: async (): Promise<SelectOption[]> => {
      const result = await useFetch({ url: api as string });
      return (
        result?.data?.map((item: { id: string | number; name: string }) => ({
          value: item.id,
          label: item.name,
        })) ?? []
      );
    },
    enabled: !!api,
    retry: 0,
  });

  const options = useMemo(() => {
    if (api && apiOptions) return apiOptions;
    return staticOptions ?? [];
  }, [api, apiOptions, staticOptions]);

  const error = errors[name];

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="mb-2">
          <Label label={label} />
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => {
          const selectedOption = (() => {
            if (value === undefined || value === null || value === "")
              return null;
            if (isMulti && Array.isArray(value)) {
              return options.filter((opt) => value.includes(opt.value));
            }
            return options.find((opt) => opt.value === value) ?? null;
          })();

          return (
            <Select<SelectOption, boolean>
              className={cn("basic-single")}
              classNamePrefix="select"
              isSearchable={isSearchable}
              isClearable={isClearable}
              isDisabled={isDisabled}
              isLoading={isLoading || isApiLoading}
              placeholder={t(placeholder)}
              isMulti={isMulti}
              name={name}
              options={options}
              value={selectedOption}
              onChange={(newValue) => {
                if (isMulti) {
                  const values = (newValue as MultiValue<SelectOption>).map(
                    (o) => o.value,
                  );
                  onChange(values);
                  onValueChange?.(values);
                } else {
                  const val =
                    (newValue as SingleValue<SelectOption>)?.value ?? null;
                  onChange(val);
                  onValueChange?.(val);
                }
              }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: "var(--space-9)",
                  borderRadius: "var(--radius)",
                  borderColor: error
                    ? `hsl(var(--destructive))`
                    : state.isFocused
                      ? `hsl(var(--ring))`
                      : `hsl(var(--input))`,
                  boxShadow: state.isFocused
                    ? error
                      ? `0 0 0 1px hsl(var(--destructive))`
                      : `0 0 0 1px hsl(var(--ring))`
                    : "none",
                  backgroundColor: "transparent",
                  color: `hsl(var(--foreground))`,
                  transition: "colors 200ms ease",
                  "&:hover": {
                    borderColor: error
                      ? `hsl(var(--destructive))`
                      : state.isFocused
                        ? `hsl(var(--ring))`
                        : `hsl(var(--input))`,
                  },
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: `var(--space-0_5) var(--space-2)`,
                }),
                input: (base) => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                }),
                placeholder: (base) => ({
                  ...base,
                  color: `hsl(var(--muted-foreground))`,
                  opacity: 1,
                }),
                singleValue: (base) => ({
                  ...base,
                  color: `hsl(var(--foreground))`,
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: `hsl(var(--primary) / 0.1)`,
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: `hsl(var(--foreground))`,
                  padding: `var(--space-0_5) var(--space-1)`,
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: `hsl(var(--foreground))`,
                  padding: `0 var(--space-1)`,
                  "&:hover": {
                    backgroundColor: `hsl(var(--destructive))`,
                    color: `hsl(var(--destructive-foreground))`,
                  },
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  padding: `0 var(--space-1)`,
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: `var(--space-1) var(--space-2)`,
                  color: `hsl(var(--muted-foreground))`,
                  "&:hover": {
                    color: `hsl(var(--foreground))`,
                  },
                }),
                clearIndicator: (base) => ({
                  ...base,
                  padding: `var(--space-1) var(--space-2)`,
                  color: `hsl(var(--muted-foreground))`,
                  "&:hover": {
                    color: `hsl(var(--foreground))`,
                  },
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "var(--radius)",
                  border: `1px solid hsl(var(--border))`,
                  overflow: "hidden",
                }),
                menuList: (base) => ({
                  ...base,
                  padding: `var(--space-1) 0`,
                  backgroundColor: `hsl(var(--popover))`,
                }),
                option: (base, state) => ({
                  ...base,
                  padding: `var(--space-2) var(--space-3)`,
                  backgroundColor: state.isSelected
                    ? `hsl(var(--primary))`
                    : state.isFocused
                      ? `hsl(var(--primary) / 0.1)`
                      : `hsl(var(--popover))`,
                  color: state.isSelected
                    ? `hsl(var(--primary-foreground))`
                    : `hsl(var(--foreground))`,
                  "&:active": {
                    backgroundColor: `hsl(var(--primary))`,
                    color: `hsl(var(--primary-foreground))`,
                  },
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: `hsl(var(--primary))`,
                  primary75: `hsl(var(--primary) / 0.75)`,
                  primary50: `hsl(var(--primary) / 0.5)`,
                  primary25: `hsl(var(--primary) / 0.1)`,
                  neutral0: `hsl(var(--popover))`,
                  neutral5: `hsl(var(--popover))`,
                  neutral10: `hsl(var(--input))`,
                  neutral20: `hsl(var(--input))`,
                  neutral30: `hsl(var(--border))`,
                  neutral80: `hsl(var(--foreground))`,
                },
              })}
            />
          );
        }}
      />

      <FieldError name={name} />
    </div>
  );
};

export default SelectDropdown;
