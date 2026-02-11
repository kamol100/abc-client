"use client";
import { useFetch } from "@/app/actions";
import { useThemeContext } from "@/context/theme-data-provider";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select, { MenuPosition } from "react-select";
import Label from "./label";

type props = {
  name: string;
  label?: string | null;
  api?: string | null;
  options?: any;
  isMulti?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isRtl?: boolean;
  isSearchable?: boolean;
  isOptionDisabled?: boolean;
  mandatory?: boolean;
  menuPosition?: MenuPosition;
  placeholder?: string;
  className?: string;
  defaultValue?: any;
  tooltip?: string | null;
  tooltipClass?: string | undefined;
  initialData?: any;
  initHeight?: number;
  value?: "value | label";
  onChange?: (value: any) => void;
  onBlur?: (value: any) => void;
  onFocus?: (value: any) => void;
  onInputChange?: (value: any) => void;
  onMenuOpen?: (value: any) => void;
  onMenuClose?: (value: any) => void;
};

const SelectDropdown: FC<props> = ({
  name,
  label = null,
  api = null,
  options: optionItems = undefined,
  isMulti = false,
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isRtl = false,
  isSearchable = true,
  mandatory = false,
  placeholder = "select_option",
  className = "",
  menuPosition = "absolute",
  value = "value",
  defaultValue = null,
  tooltip,
  tooltipClass = "",
  initialData = null,
  initHeight = 36,
  onChange = () => { },
  onBlur = () => { },
  onFocus = () => { },
  onInputChange = () => { },
  onMenuOpen = () => { },
  onMenuClose = () => { },
}) => {
  const { t } = useTranslation();
  const { themeColor, setThemeColor } = useThemeContext();

  const [options, setOption] = useState(optionItems);

  const {
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext();
  const getDropdownList = async () => {
    const result = await useFetch({ url: api as string });
    const data = result?.data?.map((item: any) => ({
      value: item.id,
      label: item.name,
    }));
    setOption(data);
    return data;
  };

  const {
    data: dropdownList,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [`${name}-dropdown`],
    queryFn: () => getDropdownList(),
    retry: 0,
    enabled: api ? true : false,
    initialData: initialData,
  });

  const handleChange = (option: any) => {
    //console.log(option, "op");
    setValue(name, option?.[value]);
    onChange(option);
    if (option?.value) {
      clearErrors(name);
    }
  };

  const defaultOption = () => {
    if (typeof defaultValue === "object" && !isMulti) {
      return defaultValue
        ?.map((item: any) => ({ value: item.id, label: item?.name }))
        .at(0);
    }
    if (typeof defaultValue === "object" && isMulti) {
      return defaultValue?.map((item: any) => ({
        value: item.id,
        label: item?.name,
      }));
    }
    console.log(options, defaultValue);
    return options?.find((option: any) => option?.value === defaultValue);
  };

  useEffect(() => {
    const defaultValue = defaultOption();
    if (isMulti) {
      const value = defaultValue?.map((item: any) => item.value);
      setValue(name, value);
    } else {
      setValue(name, defaultValue?.value);
    }
  }, [defaultValue?.length]);

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: initHeight,
      background: "white",
      // borderColor: state.isFocused ? themeColor?.toLocaleLowerCase() : "gray",
    }),
    option: (base: any, state: any) => {
      return {
        ...base,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.5s",
        ":before": {
          content: '""',
          display: "inline-block",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: state.data.color,
        },
      };
    },
  };

  return (
    <>
      {label && (
        <div className="mb-2">
          <Label
            labelText={label}
            mandatory={mandatory}
            tooltip={tooltip}
            tooltipClass={tooltipClass}
          />
        </div>
      )}

      <Select
        onChange={handleChange}
        defaultValue={defaultOption()}
        options={options ?? []}
        className={cn(`basic-single`)}
        classNamePrefix="select"
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading || loading}
        isRtl={isRtl}
        isMulti={isMulti}
        name={name}
        menuPosition={menuPosition}
        placeholder={t(placeholder)}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
          },
        })}
        classNames={{
          control: ({ isFocused }) =>
            [
              `flex items-center rounded-md border bg-white px-2 text-sm shadow-sm`,
              isFocused
                ? "border-primary ring-0 ring-primary ring-offset-1"
                : "border-gray-300",
            ].join(" "),
          valueContainer: () => "flex-1 gap-1",
          placeholder: () => "text-gray-400",
          singleValue: () => "text-gray-900",
          input: () => cn("text-gray-900", `!h-[${initHeight}px]`),
          indicatorsContainer: () => "flex gap-1",
          dropdownIndicator: ({ isFocused }) =>
            [
              "p-1 transition-colors",
              isFocused ? "text-primary" : "text-gray-500 hover:text-gray-700",
            ].join(" "),
          clearIndicator: () =>
            "p-1 text-gray-400 hover:text-red-500 transition-colors",
          menu: () =>
            "mt-1 rounded border border-gray-200 bg-white shadow-lg text-sm",
          menuList: () => "",
          option: ({ isFocused, isSelected }) =>
            [
              "cursor-pointer rounded px-2 py-2",
              isSelected
                ? "bg-primary text-white"
                : isFocused
                  ? "bg-secondary"
                  : "text-gray-900",
            ].join(" "),
          noOptionsMessage: () => "text-gray-500 p-2",
        }}
        unstyled
      />
      {errors?.[name] && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="text-red-600">{t(`${name}_field_is_required`)}</span>
        </p>
      )}
    </>
  );
};

export default SelectDropdown;
