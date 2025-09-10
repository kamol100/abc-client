"use client";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select from "react-select";

type props = {
  name: string;
  label?: string;
  api?: string;
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
  options = undefined,
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
  onChange = () => {},
  onBlur = () => {},
  onFocus = () => {},
  onInputChange = () => {},
  onMenuOpen = () => {},
  onMenuClose = () => {},
}) => {
  const { t } = useTranslation();
  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const {
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  const handleChange = (option: any) => {
    setValue(name, option?.value);
    if (option?.value) {
      clearErrors(name);
    }
  };

  return (
    <>
      <label className="text-sm mb-2 block">
        {t(label)} {mandatory && <span className="text-red-600">*</span>}
      </label>
      <Select
        onChange={handleChange}
        options={options ?? status}
        className="basic-single"
        classNamePrefix="select"
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isRtl={isRtl}
        isMulti={isMulti}
        name={name}
        placeholder={t(placeholder)}
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
