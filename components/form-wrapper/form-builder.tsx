"use client";
import dynamic from "next/dynamic";
import FormWrapper from "../form-wrapper/form-wrapper";
import InputField from "../form/input-field";
import { FormBuilderType } from "./form-builder-type";

const SelectDropdown = dynamic(() => import("../select-dropdown"));

type props = {
  formSchema: FormBuilderType[];
  grids?: number;
  gridGap?: string;
  schema: any;
  api?: string | undefined;
  method: string;
  mode: string;
  queryKey?: string;
  data: any;
  onClose?: () => void;
};

const FormBuilder = ({
  formSchema,
  grids = 1,
  gridGap = "gap-4",
  schema,
  api,
  method,
  mode = "create",
  data,
  queryKey,
  onClose = () => {},
}: props) => {
  const renderInput = (field: FormBuilderType) => {
    if (field?.type === "text") {
      return (
        <InputField
          name={field?.name}
          label={field?.label}
          placeholder={field?.placeholder}
          mandatory={field?.mandatory}
          tooltip={field?.tooltip}
          tooltipClass={field?.tooltipClass}
          type={field?.type}
        />
      );
    }
    if (field.type === "dropdown") {
      return (
        <SelectDropdown
          name={field?.name}
          label={field?.label}
          placeholder={field?.placeholder}
          mandatory={field?.mandatory}
          tooltip={field?.tooltip}
          tooltipClass={field?.tooltipClass}
          api={field?.api ?? null}
          options={field?.options ?? null}
          defaultValue={data?.[field?.defaultValue]}
          isMulti={field?.isMulti}
          isDisabled={field?.isDisabled}
          isLoading={field?.isLoading}
          isClearable={field?.isClearable}
          className={field?.className}
        />
      );
    }
  };
  const gridStyle: { [key: number]: string } = {
    1: "md:grid-cols-1 lg:grid-cols-1 sm:grid-cols-1",
    2: "md:grid-cols-2 lg:grid-cols-2 sm:grid-cols-2",
    3: "md:grid-cols-3 lg:grid-cols-3 sm:grid-cols-3",
    4: "md:grid-cols-4 lg:grid-cols-4 sm:grid-cols-4",
    5: "md:grid-cols-5 lg:grid-cols-5 sm:grid-cols-4",
    6: "md:grid-cols-6 lg:grid-cols-6 sm:grid-cols-4",
    7: "md:grid-cols-7 lg:grid-cols-7 sm:grid-cols-4",
    8: "md:grid-cols-8 lg:grid-cols-8 sm:grid-cols-4",
  };
  return (
    <FormWrapper
      schema={schema}
      api={api}
      method={method}
      mode={mode}
      queryKey={queryKey}
      data={data}
      onClose={onClose}
    >
      <div
        className={`grid ${gridGap} m-auto ${gridStyle[grids]} dark:bg-gray-800 w-full`}
      >
        {formSchema?.map((fieldName: FormBuilderType, index) => (
          <div key={`${index}`}>
            {fieldName?.permission ? renderInput(fieldName) : null}
          </div>
        ))}
      </div>
    </FormWrapper>
  );
};

export default FormBuilder;
