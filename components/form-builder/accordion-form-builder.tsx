"use client";

import { cn } from "@/lib/utils";
import { AccordionItem } from "@radix-ui/react-accordion";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { AccordionSection, GRID_STYLES } from "@/components/form-builder/types";
import FormBuilder, { FormBuilderProps, VisibleFormField } from "@/components/form-builder/form-builder";

type AccordionFormBuilderProps = Omit<FormBuilderProps, "children" | "formSchema"> & {
  formSchema: AccordionSection[];
  accordionClass?: string | null;
  accordionTitleClass?: string | null;
  accordionBodyClass?: string | null;
  sectionSlots?: Record<string, ReactNode>;
};

const AccordionFormBuilder = ({
  formSchema,
  grids = 1,
  gridGap = "gap-4",
  accordionClass = null,
  accordionTitleClass = null,
  accordionBodyClass = null,
  sectionSlots,
  ...rest
}: AccordionFormBuilderProps) => {
  const { t } = useTranslation();
  return (
    <FormBuilder formSchema={formSchema} grids={grids} gridGap={gridGap} {...rest}>
      {(renderField) => (
        <Accordion
          type="single"
          defaultValue={formSchema[0]?.name}
          collapsible
          className={cn(
            "w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow",
            accordionClass
          )}
        >
          {formSchema.map((section) => (
            <AccordionItem
              value={section.name}
              key={section.name}
              className="w-full border-border [&:not(:last-child)]:border-b"
            >
              <AccordionTrigger
                className={cn(
                  "bg-[hsl(var(--table-header))] px-3 py-2.5 text-base font-semibold capitalize text-foreground hover:no-underline",
                  "data-[state=open]:border-b data-[state=open]:border-border",
                  accordionTitleClass
                )}
              >
                {t(section.name)}
              </AccordionTrigger>
              <AccordionContent
                className={cn(
                  `grid ${gridGap} m-auto ${GRID_STYLES[grids]} w-full`,
                  "bg-card p-3",
                  accordionBodyClass
                )}
              >
                {section.form.map((field) =>
                  field.type === "slot" ? (
                    <div key={field.name} className={field.className}>
                      {sectionSlots?.[field.slot]}
                    </div>
                  ) : (
                    <VisibleFormField key={field.name} field={field}>
                      {renderField(field)}
                    </VisibleFormField>
                  )
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </FormBuilder>
  );
};

export default AccordionFormBuilder;
