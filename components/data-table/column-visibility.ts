import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

const STORAGE_PREFIX = "data-table:column-visibility";
const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function columnVisibilityStorageKey(pathname: string, tableId: string): string {
  const page = pathname.trim() || "unknown";
  return `${STORAGE_PREFIX}:${page}:${tableId}`;
}

export function tableColumnVisibilityId(
  queryKey: string | undefined,
  columnIds: readonly string[],
): string {
  const trimmedQueryKey = queryKey?.trim();
  if (trimmedQueryKey) return trimmedQueryKey;
  if (columnIds.length > 0) return columnIds.join(",");
  return "default";
}

export function collectColumnIds<TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
): string[] {
  const ids: string[] = [];

  for (const column of columns) {
    if (!isHideableColumn(column)) continue;
    const id = columnIdentifier(column);
    if (id) ids.push(id);
  }

  return ids;
}

export function readStoredColumnVisibility(storageKey: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Private mode or a full quota can reject both reads and writes.
    }
    return null;
  }
}

export function writeStoredColumnVisibility(
  storageKey: string,
  visibility: VisibilityState,
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(visibility));
  } catch {
    // Ignore quota and private-mode failures. The in-memory table state still updates.
  }
}

export function mergeColumnVisibility(
  defaults: VisibilityState,
  stored: unknown,
  allowedIds: ReadonlySet<string>,
): VisibilityState {
  const next: VisibilityState = { ...defaults };
  if (!isRecord(stored)) return next;

  for (const [id, visible] of Object.entries(stored)) {
    if (!allowedIds.has(id) || typeof visible !== "boolean" || BLOCKED_KEYS.has(id)) {
      continue;
    }
    next[id] = visible;
  }

  return next;
}

export function sanitizeColumnVisibility(
  visibility: VisibilityState,
  allowedIds: ReadonlySet<string>,
): VisibilityState {
  const next: VisibilityState = {};

  for (const [id, visible] of Object.entries(visibility)) {
    if (!allowedIds.has(id) || typeof visible !== "boolean" || BLOCKED_KEYS.has(id)) {
      continue;
    }
    next[id] = visible;
  }

  return next;
}

function isHideableColumn<TData, TValue>(column: ColumnDef<TData, TValue>): boolean {
  if (column.enableHiding === false) return false;
  if ("accessorKey" in column && column.accessorKey != null && column.accessorKey !== "") {
    return true;
  }
  return "accessorFn" in column && typeof column.accessorFn === "function";
}

function columnIdentifier<TData, TValue>(column: ColumnDef<TData, TValue>): string | null {
  if (typeof column.id === "string" && column.id.length > 0) return column.id;

  if (
    "accessorKey" in column &&
    (typeof column.accessorKey === "string" || typeof column.accessorKey === "number") &&
    String(column.accessorKey).length > 0
  ) {
    return String(column.accessorKey);
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
