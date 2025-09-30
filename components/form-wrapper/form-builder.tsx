"use client";
import { cn } from "@/lib/utils";
import { AccordionItem } from "@radix-ui/react-accordion";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import FormWrapper from "../form-wrapper/form-wrapper";
import InputField from "../form/input-field";
import RadioField from "../form/radio-field";
import Switch from "../form/switch";
import TextareaField from "../form/textarea-field";
import { Accordion, AccordionContent, AccordionTrigger } from "../ui/accordion";
import { AccordionFormBuilderType, FormBuilderType } from "./form-builder-type";

const SelectDropdown = dynamic(() => import("../select-dropdown"));

type props = {
  formSchema: FormBuilderType[] | AccordionFormBuilderType[];
  grids?: number;
  gridGap?: string;
  schema: any;
  api?: string | undefined;
  method: string;
  mode: string;
  queryKey?: string;
  data: any;
  onClose?: () => void;
  actionButton?: boolean;
  actionButtonClass?: string;
  accordion?: boolean;
  accordionClass?: string | null;
  accordionTitleClass?: string | null;
  accordionBodyClass?: string | null;
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
  onClose = () => { },
  actionButton = true,
  actionButtonClass,
  accordion = false,
  accordionClass = null,
  accordionBodyClass = null,
  accordionTitleClass = null,
}: props) => {
  const queryClient = useQueryClient();
  const [saveOnChange, setSaveOnChange] = useState(false);
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
    if (field?.type === "textarea") {
      return (
        <TextareaField
          name={field?.name}
          label={field?.label}
          placeholder={field?.placeholder}
          mandatory={field?.mandatory}
          tooltip={field?.tooltip}
          tooltipClass={field?.tooltipClass}
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
          defaultValue={field?.defaultValue ?? data?.[field?.defaultValue]}
          isMulti={field?.isMulti}
          isDisabled={field?.isDisabled}
          isLoading={field?.isLoading}
          isClearable={field?.isClearable}
          className={field?.className}
        />
      );
    }
    if (field.type === "radio") {
      return (
        <RadioField
          name={field?.name}
          label={field?.label}
          direction={field?.direction}
          defaultValue={field?.defaultValue}
          options={field?.options as any}
        />
      );
    }
    if (field.type === "switch") {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            name={field.name}
            label={field?.label}
            value={data?.[field?.name]}
            onChange={(value) => {
              setSaveOnChange(true);
            }}
          />
        </div>
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

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["show_header"] });
  });

  const order = (order: number | undefined, index: number) =>
    order ? `order-${order}` : `order-${index + 1}`;

  return (
    <FormWrapper
      schema={schema}
      api={api}
      method={method}
      mode={mode}
      queryKey={queryKey}
      data={data}
      onClose={onClose}
      actionButton={actionButton}
      saveOnChange={saveOnChange}
      setSaveOnChange={setSaveOnChange}
      actionButtonClass={actionButtonClass}
    >
      {accordion ? (
        <>
          <Accordion
            type="single"
            defaultValue={formSchema[0]?.name}
            collapsible
            className={cn(
              "w-full  border rounded-md bg-gray-50",
              accordionClass && accordionClass
            )}
          >
            {(formSchema as AccordionFormBuilderType[])?.map(
              (accordion: AccordionFormBuilderType) => (
                <AccordionItem
                  value={accordion.name}
                  key={accordion.name}
                  className={cn(
                    "w-full [&:not(:last-child)]:border-b decoration-transparent"
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      "px-3 font-semibold text-lg capitalize py-2",
                      accordionTitleClass && accordionTitleClass
                    )}
                  >
                    {accordion.name}
                  </AccordionTrigger>
                  <AccordionContent
                    className={cn(
                      `grid ${gridGap} m-auto ${gridStyle[grids]} dark:bg-gray-800 w-full`,
                      "bg-white p-3 rounded-md",
                      accordionBodyClass && accordionBodyClass
                    )}
                  >
                    {accordion?.form?.map(
                      (fieldName: FormBuilderType, index) => (
                        <div
                          key={`${index}`}
                        >
                          {fieldName?.permission
                            ? renderInput(fieldName)
                            : null}
                        </div>
                      )
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        </>
      ) : (
        <div className={`grid ${gridGap} m-auto ${gridStyle[grids]} dark:bg-gray-800 w-full`}>
          {(formSchema as FormBuilderType[])?.map(
            (fieldName: FormBuilderType, index) => (
              <div
                key={`${index}`}
                className={`${fieldName?.order ?? index + 1}`}
              >
                {fieldName?.permission ? renderInput(fieldName) : null}
              </div>
            )
          )}
        </div>
      )}
    </FormWrapper>
  );
};

export default FormBuilder;
