"use client";
import { useFetch } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import Label from "./label";

type props = {
  name: string;
  label?: string;
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
  placeholder?: string;
  className?: string;
  defaultValue?: any;
  tooltip?: string | null;
  tooltipClass?: string | undefined;
  initialData?: any;
  onChange?: (value: any) => void;
  onBlur?: (value: any) => void;
  onFocus?: (value: any) => void;
  onInputChange?: (value: any) => void;
  onMenuOpen?: (value: any) => void;
  onMenuClose?: (value: any) => void;
};

const SelectDropdown: FC<props> = ({
  name,
  label = "status",
  api = null,
  options: optionItems = undefined,
  isMulti = false,
  isDisabled = false,
  isLoading = false,
  isClearable = false,
  isRtl = false,
  isSearchable = true,
  mandatory = false,
  placeholder = "select_option",
  className = "",
  defaultValue = null,
  tooltip,
  tooltipClass = "",
  initialData = null,
  onChange = () => {},
  onBlur = () => {},
  onFocus = () => {},
  onInputChange = () => {},
  onMenuOpen = () => {},
  onMenuClose = () => {},
}) => {
  const { t } = useTranslation();

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
    setValue(name, option?.value);
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
    return options?.find((option: any) => option?.value === defaultValue);
  };
  return (
    <>
      <div className="mb-2">
        <Label
          labelText={label}
          mandatory={mandatory}
          tooltip={tooltip}
          tooltipClass={tooltipClass}
        />
      </div>
      <Select
        onChange={handleChange}
        defaultValue={defaultOption()}
        options={options ?? []}
        className="basic-single"
        classNamePrefix="select"
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading || loading}
        isRtl={isRtl}
        isMulti={isMulti}
        name={name}
        placeholder={t(placeholder)}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
          },
        })}
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
