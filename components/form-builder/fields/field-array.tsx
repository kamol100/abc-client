"use client";

import { ReactNode } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp } from "lucide-react";
import Label from "@/components/label";
import MyButton from "@/components/my-button";
import { VisibleFormField } from "@/components/form-builder/layout/visible-field";
import {
  FieldArrayConfig,
  FieldConfig,
  GRID_STYLES,
} from "@/components/form-wrapper/form-builder-type";

/**
 * A repeating group of fields ("rows"), such as salary items. Each row holds the
 * fields in `itemFields`; the user can add, remove and reorder rows.
 *
 * It is not in the field registry because it does not hold one value: it draws other
 * fields. `renderItemField` draws one of them for a given row path (`items.2`).
 */
type FieldArrayRendererProps = {
  config: FieldArrayConfig;
  namePrefix?: string;
  renderItemField: (field: FieldConfig, namePrefix: string) => ReactNode;
};

export const FieldArrayRenderer = ({
  config,
  namePrefix = "",
  renderItemField,
}: FieldArrayRendererProps) => {
  const { control } = useFormContext();
  const fullName = namePrefix ? `${namePrefix}.${config.name}` : config.name;
  const { fields, append, remove, move } = useFieldArray({ control, name: fullName });

  const {
    allowAppend = true,
    allowRemove = true,
    allowReorder = false,
    minItems = 0,
    maxItems,
    itemFields,
    defaultItem,
    grids: itemGrids = 1,
    gridGap: itemGridGap = "gap-4",
    addButtonLabel = "Add",
  } = config;

  const canAppend = allowAppend && (maxItems === undefined || fields.length < maxItems);
  const canRemove = allowRemove && fields.length > minItems;
  const hasItemLabels = itemFields.some((field) => Boolean(field.label?.labelText));

  return (
    <div className={config.className ?? "col-span-full space-y-4"}>
      {config.label && <Label label={config.label} />}

      {fields.map((item, index) => (
        <div key={item.id} className="relative flex items-start gap-3 border rounded-md p-3">
          <div className={`grid min-w-0 flex-1 ${itemGridGap} ${GRID_STYLES[itemGrids]}`}>
            {itemFields.map((itemField) => (
              <VisibleFormField
                key={itemField.name}
                field={itemField}
                namePrefix={`${fullName}.${index}`}
              >
                {renderItemField(itemField, `${fullName}.${index}`)}
              </VisibleFormField>
            ))}
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            {hasItemLabels ? <div className="mb-1 h-5 shrink-0" aria-hidden /> : null}
            <div className="flex items-center gap-1">
              {allowReorder && index > 0 && (
                <MyButton type="button" variant="default" size="icon" onClick={() => move(index, index - 1)}>
                  <ArrowUp className="h-4 w-4" />
                </MyButton>
              )}
              {allowReorder && index < fields.length - 1 && (
                <MyButton type="button" variant="default" size="icon" onClick={() => move(index, index + 1)}>
                  <ArrowDown className="h-4 w-4" />
                </MyButton>
              )}
              {canRemove && (
                <MyButton type="button" variant="outline" size="default" action="delete" onClick={() => remove(index)} />
              )}
            </div>
          </div>
        </div>
      ))}

      {canAppend && (
        <MyButton
          type="button"
          icon={true}
          action="create"
          title={addButtonLabel}
          onClick={() => append({ ...defaultItem })}
          className=" hover:bg-primary hover:text-primary-foreground"
        >
        </MyButton>
      )}
    </div>
  );
};
