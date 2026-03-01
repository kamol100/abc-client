"use client";

import { cn } from "@/lib/utils";
import { AccordionItem } from "@radix-ui/react-accordion";
import { Accordion, AccordionContent, AccordionTrigger } from "../ui/accordion";
import { AccordionSection, GRID_STYLES } from "@/components/form-wrapper/form-builder-type";
import FormBuilder, { FormBuilderProps } from "./form-builder";

type AccordionFormBuilderProps = Omit<FormBuilderProps, "children" | "formSchema"> & {
  formSchema: AccordionSection[];
  accordionClass?: string | null;
  accordionTitleClass?: string | null;
  accordionBodyClass?: string | null;
};

const AccordionFormBuilder = ({
  formSchema,
  grids = 1,
  gridGap = "gap-4",
  accordionClass = null,
  accordionTitleClass = null,
  accordionBodyClass = null,
  ...rest
}: AccordionFormBuilderProps) => (
  <FormBuilder formSchema={formSchema} grids={grids} gridGap={gridGap} {...rest}>
    {(renderField) => (
      <Accordion
        type="single"
        defaultValue={formSchema[0]?.name}
        collapsible
        className={cn("w-full border rounded-md bg-muted", accordionClass)}
      >
        {formSchema.map((section) => (
          <AccordionItem
            value={section.name}
            key={section.name}
            className="w-full [&:not(:last-child)]:border-b decoration-transparent bg-muted"
          >
            <AccordionTrigger
              className={cn("px-3 font-semibold text-lg capitalize py-2", accordionTitleClass)}
            >
              {section.name}
            </AccordionTrigger>
            <AccordionContent
              className={cn(
                `grid ${gridGap} m-auto ${GRID_STYLES[grids]} w-full`,
                "bg-background p-3 rounded-md",
                accordionBodyClass
              )}
            >
              {section.form.map((field) => (
                <div key={field.name}>
                  {field.permission !== false ? renderField(field) : null}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )}
  </FormBuilder>
);

export default AccordionFormBuilder;
