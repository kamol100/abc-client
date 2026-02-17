"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  AppData,
  AppPermission,
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

  return (
    <SettingsContext.Provider value={settingsValue}>
      <ProfileContext.Provider value={profileValue}>
        <PermissionsContext.Provider value={permissionsValue}>
          {children}
        </PermissionsContext.Provider>
      </ProfileContext.Provider>
    </SettingsContext.Provider>
  );
}
