import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export type DataTableToolbarOptions = {
    filter?: FieldConfig[];
    /**
     * How many flexible rows the filter fields use.
     * Each row grows to the available width and wraps on its own.
     * Omitted tables keep the current single-row grid.
     */
    filter_row?: number;
    watchFields?: string[];
    columns?: string[];
    input_filter?: boolean;
    showFilter?: boolean;
};
