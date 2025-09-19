"use client";
import { createContext, PropsWithChildren, useState } from "react";

interface SettingContextType {
  userSetting: any;
  setUserSetting: (setting: any) => void;
}

export const SettingContext = createContext<SettingContextType | null>(null);

interface props extends PropsWithChildren {
  initialUserSetting?: any;
}

export default function SettingContextProvider({
  children,
  initialUserSetting = [],
}: props) {
  const [userSetting, setUserSetting] = useState(initialUserSetting);
  return (
    userSetting && (
      <SettingContext.Provider value={{ userSetting, setUserSetting }}>
        {children}
      </SettingContext.Provider>
    )
  );
}
