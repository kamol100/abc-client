"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef, OnChangeFn, Updater, VisibilityState } from "@tanstack/react-table";
import {
  collectColumnIds,
  columnVisibilityStorageKey,
  mergeColumnVisibility,
  readStoredColumnVisibility,
  sanitizeColumnVisibility,
  tableColumnVisibilityId,
  writeStoredColumnVisibility,
} from "@/components/data-table/column-visibility";

interface UsePersistedColumnVisibilityOptions<TData, TValue> {
  enabled: boolean;
  pathname: string;
  queryKey?: string;
  columns: ColumnDef<TData, TValue>[];
  initialColumnVisibility?: VisibilityState;
}

interface PersistedColumnVisibility {
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  hasResolvedVisibility: boolean;
}

export function usePersistedColumnVisibility<TData, TValue>({
  enabled,
  pathname,
  queryKey,
  columns,
  initialColumnVisibility,
}: UsePersistedColumnVisibilityOptions<TData, TValue>): PersistedColumnVisibility {
  const columnIdsKey = collectColumnIds(columns).join("\0");
  const allowedIds = useMemo(
    () => new Set(columnIdsKey.length > 0 ? columnIdsKey.split("\0") : []),
    [columnIdsKey],
  );
  const defaults = initialColumnVisibility ?? {};
  const storageKey = enabled
    ? columnVisibilityStorageKey(pathname, tableColumnVisibilityId(queryKey, [...allowedIds]))
    : null;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaults);
  const [hasResolvedVisibility, setHasResolvedVisibility] = useState(!enabled);
  const [resolvedStorageKey, setResolvedStorageKey] = useState<string | null>(null);

  const visibilityRef = useRef(columnVisibility);
  visibilityRef.current = columnVisibility;
  const allowedIdsRef = useRef(allowedIds);
  allowedIdsRef.current = allowedIds;
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;
  const readyRef = useRef(hasResolvedVisibility);
  readyRef.current = hasResolvedVisibility;

  if (storageKey && resolvedStorageKey !== null && storageKey !== resolvedStorageKey) {
    const next = mergeColumnVisibility(
      defaults,
      readStoredColumnVisibility(storageKey),
      allowedIds,
    );
    visibilityRef.current = next;
    readyRef.current = true;
    setResolvedStorageKey(storageKey);
    setColumnVisibility(next);
    setHasResolvedVisibility(true);
  }

  useIsomorphicLayoutEffect(() => {
    if (!storageKey) return;

    const next = mergeColumnVisibility(
      defaultsRef.current,
      readStoredColumnVisibility(storageKey),
      allowedIdsRef.current,
    );
    visibilityRef.current = next;
    readyRef.current = true;
    setResolvedStorageKey(storageKey);
    setColumnVisibility(next);
    setHasResolvedVisibility(true);
  }, [storageKey, columnIdsKey]);

  const onColumnVisibilityChange = useCallback<OnChangeFn<VisibilityState>>(
    (updater) => {
      const next = resolveVisibility(updater, visibilityRef.current);
      visibilityRef.current = next;
      setColumnVisibility(next);

      if (!storageKey || !readyRef.current) return;
      writeStoredColumnVisibility(storageKey, sanitizeColumnVisibility(next, allowedIdsRef.current));
    },
    [storageKey],
  );

  return {
    columnVisibility,
    onColumnVisibilityChange,
    hasResolvedVisibility,
  };
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function resolveVisibility(
  updater: Updater<VisibilityState>,
  current: VisibilityState,
): VisibilityState {
  if (typeof updater === "function") return updater(current);
  return updater;
}
