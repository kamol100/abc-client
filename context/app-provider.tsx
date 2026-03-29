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
import type {
  AppData,
  AppPermission,
  ImpersonationState,
  Profile,
  Settings,
} from "@/types/app";

// ─── Settings ────────────────────────────────────────────────────────
interface SettingsContextValue {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  updateSettings: (partial: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within <AppProvider>");
  return ctx;
}

export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
  const { settings } = useSettings();
  return settings[key];
}

// ─── Profile ─────────────────────────────────────────────────────────
interface ProfileContextValue {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  updateProfile: (partial: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within <AppProvider>");
  return ctx;
}

// ─── Permissions ─────────────────────────────────────────────────────
interface PermissionsContextValue {
  permissions: AppPermission[];
  setPermissions: React.Dispatch<React.SetStateAction<AppPermission[]>>;
  hasPermission: (permission: AppPermission) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx)
    throw new Error("usePermissions must be used within <AppProvider>");
  return ctx;
}

// ─── Impersonation ──────────────────────────────────────────────────
const ORIGINAL_TOKEN_KEY = "isp_original_token";
const IMPERSONATION_STATE_KEY = "isp_impersonation_state";

const DEFAULT_IMPERSONATION_STATE: ImpersonationState = {
  is_impersonating: false,
  chain: [],
  original_user_id: null,
};

function loadImpersonationState(): ImpersonationState {
  if (typeof window === "undefined") return DEFAULT_IMPERSONATION_STATE;
  try {
    const stored = localStorage.getItem(IMPERSONATION_STATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.is_impersonating === "boolean") return parsed;
    }
  } catch {
    // Corrupted data — fall back to default
  }
  return DEFAULT_IMPERSONATION_STATE;
}

export interface ImpersonationContextValue {
  impersonation: ImpersonationState;
  setImpersonation: React.Dispatch<React.SetStateAction<ImpersonationState>>;
  originalToken: string | null;
  saveOriginalToken: (token: string) => void;
  clearOriginalToken: () => void;
  getOriginalToken: () => string | null;
}

const ImpersonationContext = createContext<ImpersonationContextValue | null>(
  null
);

export function useImpersonation(): ImpersonationContextValue {
  const ctx = useContext(ImpersonationContext);
  if (!ctx)
    throw new Error("useImpersonation must be used within <AppProvider>");
  return ctx;
}

// ─── Combined Provider ───────────────────────────────────────────────
interface AppProviderProps extends PropsWithChildren {
  initialData: AppData;
}

export default function AppProvider({
  children,
  initialData,
}: AppProviderProps) {
  const [settings, setSettings] = useState<Settings>(initialData.settings);
  const [profile, setProfile] = useState<Profile>(initialData.profile);
  const [permissions, setPermissions] = useState<AppPermission[]>(
    initialData.permissions
  );
  const [impersonation, setImpersonationRaw] = useState<ImpersonationState>(
    loadImpersonationState
  );

  // Wrap setImpersonation to persist to localStorage
  const setImpersonation: React.Dispatch<React.SetStateAction<ImpersonationState>> = useCallback(
    (action) => {
      setImpersonationRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (next.is_impersonating) {
          localStorage.setItem(IMPERSONATION_STATE_KEY, JSON.stringify(next));
        } else {
          localStorage.removeItem(IMPERSONATION_STATE_KEY);
        }
        return next;
      });
    },
    []
  );
  const [originalToken, setOriginalToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ORIGINAL_TOKEN_KEY);
    if (stored) setOriginalToken(stored);
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<Settings>) =>
      setSettings((prev) => ({ ...prev, ...partial })),
    []
  );

  const updateProfile = useCallback(
    (partial: Partial<Profile>) =>
      setProfile((prev) => ({ ...prev, ...partial })),
    []
  );

  const hasPermission = useCallback(
    (permission: AppPermission) => permissions.includes(permission),
    [permissions]
  );

  const saveOriginalToken = useCallback((token: string) => {
    localStorage.setItem(ORIGINAL_TOKEN_KEY, token);
    setOriginalToken(token);
  }, []);

  const clearOriginalToken = useCallback(() => {
    localStorage.removeItem(ORIGINAL_TOKEN_KEY);
    setOriginalToken(null);
  }, []);

  const getOriginalToken = useCallback(() => {
    return localStorage.getItem(ORIGINAL_TOKEN_KEY);
  }, []);

  const settingsValue = useMemo<SettingsContextValue>(
    () => ({ settings, setSettings, updateSettings }),
    [settings, updateSettings]
  );

  const profileValue = useMemo<ProfileContextValue>(
    () => ({ profile, setProfile, updateProfile }),
    [profile, updateProfile]
  );

  const permissionsValue = useMemo<PermissionsContextValue>(
    () => ({ permissions, setPermissions, hasPermission }),
    [permissions, hasPermission]
  );

  const impersonationValue = useMemo<ImpersonationContextValue>(
    () => ({
      impersonation,
      setImpersonation,
      originalToken,
      saveOriginalToken,
      clearOriginalToken,
      getOriginalToken,
    }),
    [impersonation, originalToken, saveOriginalToken, clearOriginalToken, getOriginalToken]
  );

  return (
    <SettingsContext.Provider value={settingsValue}>
      <ProfileContext.Provider value={profileValue}>
        <PermissionsContext.Provider value={permissionsValue}>
          <ImpersonationContext.Provider value={impersonationValue}>
            {children}
          </ImpersonationContext.Provider>
        </PermissionsContext.Provider>
      </ProfileContext.Provider>
    </SettingsContext.Provider>
  );
}
