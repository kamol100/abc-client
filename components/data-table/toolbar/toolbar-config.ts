import { createElement, isValidElement, type ComponentType, type ReactNode } from "react";
import type { DataTableToolbarOptions } from "@/components/data-table/data-table-toolbar-options";

/**
 * How a page item behaves below the mobile breakpoint.
 * - inline: stays with its slot (start/center rows, or the actions row for end)
 * - row: gets its own full-width, centered row
 * - hidden: not rendered on mobile
 */
export type ToolbarItemMobile = "inline" | "row" | "hidden";

/** Page content placed in a slot. Array order is render order. */
export type ToolbarItem = {
  key: string;
  node: ReactNode;
  /** Default true. Use for permissions and variants. */
  show?: boolean;
  /** Default "inline". */
  mobile?: ToolbarItemMobile;
};

export type ToolbarFilterFeature = DataTableToolbarOptions & {
  /** Mobile: let the staff setting replace the filter sheet with the `any` field. */
  simpleSearch?: boolean;
};

/**
 * Built-in toolbar features. Their place and order are fixed for every table:
 * page `end` items → columns → layout toggle → filter → add.
 * A table can switch them on or off, never move them.
 */
export type ToolbarFeatures = {
  /** Column visibility menu. Default false. */
  columns?: boolean;
  /** Fixed/full table layout toggle. Default true. */
  layoutToggle?: boolean;
  /** Filter row on desktop, bottom sheet (or simple search) on mobile. */
  filter?: ToolbarFilterFeature;
  /**
   * Create button or dialog trigger. Always last. Accepts an element
   * (`<AddButton />`) or a component (`AddButton`), which is rendered with no props.
   */
  add?: ReactNode | ComponentType;
};

export type DataTableToolbarConfig = {
  /** Always at the start; hidden on mobile. */
  title?: ReactNode;
  titleClassName?: string;
  start?: ToolbarItem[];
  /** Empty by default. Centered on desktop. */
  center?: ToolbarItem[];
  /** Page actions; always rendered before the built-in features. */
  end?: ToolbarItem[];
  features?: ToolbarFeatures;
  /** Mobile: "row" puts the action buttons on their own row under page size. Default "inline". */
  mobileActions?: "inline" | "row";
};

/** Items that render on this device: shown, not hidden on mobile, and not empty. */
export function visibleItems(items: ToolbarItem[] | undefined, isMobile: boolean): ToolbarItem[] {
  return (items ?? []).filter(
    (item) =>
      item.show !== false &&
      !(isMobile && item.mobile === "hidden") &&
      item.node !== null &&
      item.node !== undefined &&
      item.node !== false &&
      item.node !== "",
  );
}

/** Renders `features.add` whether it is an element or a component. */
export function renderAdd(add: ToolbarFeatures["add"]): ReactNode {
  if (add === null || add === undefined || add === false) return null;
  if (isValidElement(add)) return add;
  // Function components, and memo/forwardRef objects (non-element objects with $$typeof).
  if (typeof add === "function" || (typeof add === "object" && "$$typeof" in add)) {
    return createElement(add as ComponentType);
  }
  return add as ReactNode;
}
