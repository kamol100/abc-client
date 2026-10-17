import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const FILTER_ROW_CLASS = "flex w-full min-w-0 flex-wrap gap-3";
export const FILTER_ITEM_CLASS = "w-full min-w-0 sm:w-auto sm:min-w-[12rem] sm:flex-1";

export function filterColumnCount(fieldCount: number, filterRows: number): number {
    const rows = Number.isFinite(filterRows) ? Math.floor(filterRows) : 1;
    const safeRows = Math.max(1, rows);
    const count = Math.max(0, fieldCount);
    if (count === 0) return 1;
    return Math.max(1, Math.ceil(count / safeRows));
}

export function splitFilterFields<T>(fields: T[], filterRows: number): T[][] {
    if (fields.length === 0) return [];
    const perRow = filterColumnCount(fields.length, filterRows);
    const rows: T[][] = [];
    for (let index = 0; index < fields.length; index += perRow) {
        rows.push(fields.slice(index, index + perRow));
    }
    return rows;
}

export function visibleFilterFields(fields: FieldConfig[]): FieldConfig[] {
    return fields.filter((field) => field.permission !== false);
}
