"use client";

import { ReactNode, useContext, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp } from "lucide-react";
import Label from "@/components/label";
import MyButton from "@/components/my-button";
import {
  FieldOptionsContext,
  FieldOptionsProvider,
} from "@/components/form-builder/fields/field-shell";
import { VisibleFormField } from "@/components/form-builder/layout/visible-field";
import {
  FieldArrayColumn,
  FieldArrayConfig,
  FieldArrayTable,
  FieldConfig,
  GRID_STYLES,
} from "@/components/form-wrapper/form-builder-type";
import { cn } from "@/lib/utils";

/**
 * A repeating group of fields ("rows"), such as salary items or invoice lines. Each
 * row holds the fields in `itemFields`; the user can add, remove and reorder rows.
 *
 * It is not in the field registry because it does not hold one value: it draws other
 * fields. `renderItemField` draws one of them for a given row path (`items.2`).
 *
 * Two looks: cards (the default) and a table (`config.table`).
 */

type FieldArrayRendererProps = {
  config: FieldArrayConfig;
  namePrefix?: string;
  renderItemField: (field: FieldConfig, namePrefix: string) => ReactNode;
};

/** The rows of a field array and what the user may do with them. */
function useFieldArrayRows(config: FieldArrayConfig, namePrefix: string) {
  const { control } = useFormContext();
  const fullName = namePrefix ? `${namePrefix}.${config.name}` : config.name;
  const { fields, append, remove, move } = useFieldArray({ control, name: fullName });
  const { allowAppend = true, allowRemove = true, minItems = 0, maxItems } = config;

  return {
    fullName,
    rows: fields,
    move,
    remove,
    addRow: () => append({ ...config.defaultItem }),
    canAppend: allowAppend && (maxItems === undefined || fields.length < maxItems),
    canRemove: allowRemove && fields.length > minItems,
  };
}

/** Applies the array's `reserveErrorSpace` to the fields of its rows. */
function RowFieldOptions({ config, children }: { config: FieldArrayConfig; children: ReactNode }) {
  const formOptions = useContext(FieldOptionsContext);
  const options = useMemo(
    () => ({
      ...formOptions,
      reserveErrorSpace: config.reserveErrorSpace ?? formOptions.reserveErrorSpace,
    }),
    [formOptions, config.reserveErrorSpace],
  );
  return <FieldOptionsProvider value={options}>{children}</FieldOptionsProvider>;
}

// --- Cards ---

const FieldArrayCards = ({
  config,
  namePrefix = "",
  renderItemField,
}: FieldArrayRendererProps) => {
  const { fullName, rows: fields, move, remove, addRow, canAppend, canRemove } =
    useFieldArrayRows(config, namePrefix);

  const {
    allowReorder = false,
    itemFields,
    grids: itemGrids = 1,
    gridGap: itemGridGap = "gap-4",
    addButtonLabel = "Add",
  } = config;

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
          onClick={addRow}
          className=" hover:bg-primary hover:text-primary-foreground"
        >
        </MyButton>
      )}
    </div>
  );
};

// --- Table ---

const COLUMN_SPAN: Record<number, string> = {
  1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
  5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
  9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
};

const WIDE_COLUMN_SPAN: Record<number, string> = {
  1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4",
  5: "md:col-span-5", 6: "md:col-span-6", 7: "md:col-span-7", 8: "md:col-span-8",
  9: "md:col-span-9", 10: "md:col-span-10", 11: "md:col-span-11", 12: "md:col-span-12",
};

const columnOf = (table: FieldArrayTable, fieldName: string) => {
  const column: FieldArrayColumn = table.columns[fieldName] ?? 1;
  return typeof column === "number" ? { span: column, align: undefined } : column;
};

const FieldArrayTableRows = ({
  config,
  table,
  namePrefix = "",
  renderItemField,
}: FieldArrayRendererProps & { table: FieldArrayTable }) => {
  const { t } = useTranslation();
  const { fullName, rows, remove, addRow, canAppend, canRemove } =
    useFieldArrayRows(config, namePrefix);
  const shownFields = config.itemFields.filter((field) => field.permission !== false);
  const actionsSpan = table.actionsSpan ?? 1;

  return (
    <div className={config.className ?? "space-y-3"}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t(table.title)}</h3>
        {canAppend && (
          <MyButton
            type="button"
            action="add"
            variant="default"
            onClick={addRow}
            title={t(config.addButtonLabel ?? "common.add")}
          />
        )}
      </div>

      {/* Column names, on wide screens only. On a phone each field shows its own label. */}
      <div className="hidden md:grid grid-cols-12 gap-3 rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
        {shownFields.map((field) => {
          const column = columnOf(table, field.name);
          return (
            <span
              key={field.name}
              className={cn(COLUMN_SPAN[column.span], column.align === "right" && "text-right")}
            >
              {t(field.label?.labelText ?? "")}
            </span>
          );
        })}
        <span className={cn(COLUMN_SPAN[actionsSpan], "text-right")}>{t("common.actions")}</span>
      </div>

      {rows.map((row, index) => {
        const rowPath = `${fullName}.${index}`;
        return (
          <div key={row.id} className="rounded-md border p-3">
            <div className="mb-3 flex items-center justify-between md:hidden">
              <p className="text-xs font-medium text-muted-foreground">
                {t(table.rowLabel, { index: index + 1 })}
              </p>
              <MyButton
                type="button"
                action="delete"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                disabled={!canRemove}
                title={t(table.removeLabel)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:items-start">
              {shownFields.map((field) => (
                <VisibleFormField
                  key={field.name}
                  field={{ ...field, className: WIDE_COLUMN_SPAN[columnOf(table, field.name).span] }}
                  namePrefix={rowPath}
                >
                  {renderItemField(field, rowPath)}
                </VisibleFormField>
              ))}
              {/* The remove button, lined up with the inputs: label height above, error line below. */}
              <div className={cn(WIDE_COLUMN_SPAN[actionsSpan], "flex flex-col gap-1 min-h-full")}>
                <div className="hidden md:block min-h-6 shrink-0" aria-hidden />
                <div className="hidden md:flex shrink-0">
                  <MyButton
                    type="button"
                    action="delete"
                    variant="outline"
                    onClick={() => remove(index)}
                    disabled={!canRemove}
                    aria-label={t(table.removeLabel)}
                  />
                </div>
                <div className="min-h-[1.25rem] hidden md:block shrink-0" aria-hidden />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Your own layout ---

const FieldArrayCustomRows = ({
  config,
  render,
  namePrefix = "",
  renderItemField,
}: FieldArrayRendererProps & { render: NonNullable<FieldArrayConfig["render"]> }) => {
  const { fullName, rows, remove, addRow, canAppend, canRemove } =
    useFieldArrayRows(config, namePrefix);
  const fieldsByName = new Map(config.itemFields.map((field) => [field.name, field]));

  return (
    <>
      {render({
        addRow,
        canAppend,
        canRemove,
        rows: rows.map((row, index) => {
          const path = `${fullName}.${index}`;
          return {
            key: row.id,
            index,
            path,
            remove: () => remove(index),
            field: (name: string) => {
              const field = fieldsByName.get(name);
              if (!field) return null;
              return (
                <VisibleFormField key={name} field={field} namePrefix={path}>
                  {renderItemField(field, path)}
                </VisibleFormField>
              );
            },
          };
        }),
      })}
    </>
  );
};

const renderRows = (props: FieldArrayRendererProps) => {
  const { config } = props;
  if (config.render) return <FieldArrayCustomRows {...props} render={config.render} />;
  if (config.table) return <FieldArrayTableRows {...props} table={config.table} />;
  return <FieldArrayCards {...props} />;
};

export const FieldArrayRenderer = (props: FieldArrayRendererProps) => (
  <RowFieldOptions config={props.config}>{renderRows(props)}</RowFieldOptions>
);
