"use client";
import { Form } from "@/components/ui/form";
import { objectToQueryString } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { FilterIcon, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../form/input-field";
import { Close } from "../icon";
import { Button } from "../ui/button";
import { FormBuilderType } from "./form-builder-type";

const SelectDropdown = dynamic(() => import("../select-dropdown"));

type props = {
  formSchema: FormBuilderType[];
  setFilter?: (x: string) => void;
  watchField?: Array<string>;
  grids?: number;
  gridGap?: string;
  api?: string | undefined;
  queryKey?: string;
  defaultFilter?: undefined;
  searchButton?: boolean;
  showFilter?: boolean;
  setShowFilter?: (x: boolean) => void;
};

const FormFilter = ({
  formSchema,
  grids = 1,
  gridGap = "gap-4",
  api,
  queryKey,
  defaultFilter,
  setShowFilter = () => {},
  watchField = [],
  searchButton = false,
  setFilter = () => {},
}: props) => {
  const [isFilter, setOpenFilter] = useState(false);
  const form = useForm<any>();
  const { watch, setValue, handleSubmit } = form;
  const submitRef = useRef<HTMLInputElement>(null);

  const getQuerySting = (params: any) => {
    // console.log(params, "pr");
    let query = objectToQueryString(params);
    if (defaultFilter) {
      query = `${query}&${defaultFilter}`;
    }
    setFilter(query);

    return query;
  };

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name && watchField?.includes(name) && value[name]?.length > 2) {
        submitRef.current?.click();
      }
      if (name && watchField?.includes(name) && value[name]?.length === 0) {
        submitRef.current?.click();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);
  useEffect(() => {
    setShowFilter(isFilter);
  }, [isFilter]);

  const clearInput = (inputName: string) => {
    setValue(inputName, "");
    submitRef.current?.click();
  };
  const renderInput = (field: FormBuilderType) => {
    if (field?.type === "text") {
      const fieldValue = form.watch(field?.name);
      //console.log(fieldValue, "fd");
      return (
        <div className="relative">
          <InputField
            name={field?.name}
            placeholder={field?.placeholder}
            mandatory={field?.mandatory}
            tooltip={field?.tooltip}
            tooltipClass={field?.tooltipClass}
            type={field?.type}
          />
          {fieldValue && (
            <div
              className="absolute top-1 right-0 cursor:pointer p-2 cursor-pointer"
              onClick={() => clearInput(field?.name)}
            >
              <div className="text-gray-500">
                <Close />
              </div>
            </div>
          )}
        </div>
      );
    }
    if (field.type === "dropdown") {
      return (
        <SelectDropdown
          name={field?.name}
          placeholder={field?.placeholder}
          mandatory={field?.mandatory}
          tooltip={field?.tooltip}
          tooltipClass={field?.tooltipClass}
          api={field?.api ?? null}
          options={field?.options ?? null}
          isMulti={field?.isMulti}
          isDisabled={field?.isDisabled}
          isLoading={field?.isLoading}
          isClearable={field?.isClearable}
          className={field?.className}
          onChange={(option) => {
            submitRef.current?.click();
          }}
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
    <>
      <div className="flex-none md:flex lg:flex gap-3">
        {isFilter && (
          <div className="w-full">
            <Form {...form}>
              <form
                onSubmit={handleSubmit(getQuerySting)}
                className="flex w-full"
              >
                <div
                  className={`w-full grid ${gridGap} m-auto ${gridStyle[grids]} dark:bg-gray-800 w-full`}
                >
                  {formSchema?.map((fieldName: FormBuilderType, index) => (
                    <div key={`${index}`}>
                      {fieldName?.permission ? renderInput(fieldName) : null}
                    </div>
                  ))}
                </div>
                <input
                  className="opacity-0 hidden"
                  type="submit"
                  ref={submitRef}
                />
              </form>
            </Form>
          </div>
        )}
        <div className="flex justify-between flex-row-reverse md:flex-row lg:flex-row gap-2">
          {searchButton && isFilter && (
            <Button
              className="mt-2 md:mt-0 lg:mt-0"
              onClick={() => submitRef.current?.click()}
            >
              <Search />
            </Button>
          )}
          <Button
            className={cn(isFilter && "mt-2 md:mt-0 lg:mt-0")}
            variant={isFilter ? "default" : "outline"}
            onClick={() => setOpenFilter(!isFilter)}
          >
            <FilterIcon />
          </Button>
        </div>
      </div>
    </>
  );
};

export default FormFilter;
