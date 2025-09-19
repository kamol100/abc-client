import { SettingContext } from "@/context/SettingsProvider";
import { useContext } from "react";
export const useSetting = (name: string): string | number | undefined => {
    const setting_context = SettingContext
    const settings: any = useContext(setting_context);
    if (!settings?.userSetting) {
        return "Setting not working";
    }
    return settings?.userSetting[name];
};