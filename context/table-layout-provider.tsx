"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type TableLayoutMode = "fixed" | "full";

const STORAGE_KEY = "tableLayoutMode";
const DEFAULT_MODE: TableLayoutMode = "fixed";

interface TableLayoutContextValue {
  mode: TableLayoutMode;
  setMode: (mode: TableLayoutMode) => void;
  toggleMode: () => void;
  isFixed: boolean;
}

const TableLayoutContext = createContext<TableLayoutContextValue | null>(null);

export function useTableLayoutMode(): TableLayoutContextValue {
  const ctx = useContext(TableLayoutContext);
  if (!ctx)
    throw new Error(
      "useTableLayoutMode must be used within <TableLayoutProvider>"
    );
  return ctx;
}

function getStoredMode(): TableLayoutMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "full" ? "full" : DEFAULT_MODE;
}

export function TableLayoutProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<TableLayoutMode>(DEFAULT_MODE);

  useEffect(() => {
    setModeState(getStoredMode());
  }, []);

  const setMode = useCallback((next: TableLayoutMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "fixed" ? "full" : "fixed");
  }, [mode, setMode]);

  const value = useMemo<TableLayoutContextValue>(
    () => ({ mode, setMode, toggleMode, isFixed: mode === "fixed" }),
    [mode, setMode, toggleMode]
  );

  return (
    <TableLayoutContext.Provider value={value}>
      {children}
    </TableLayoutContext.Provider>
  );
}
