"use client";
import { LogOut } from "lucide-react";
import { adminLogout } from "@/lib/actions";
import { useTranslation } from "react-i18next";
export default function Logout() {
  const { t } = useTranslation();
  const handleLogout = async () => {
    const loginUrl = new URL("/admin", window.location.origin).toString();
    await adminLogout();
    window.location.assign(loginUrl);
  };

  return (
    <div
      onClick={async () => {
        await handleLogout();
      }}
    >
      <div className="flex gap-2 cursor-pointer">
        <LogOut />
        <div>{t("user_profile.sign_out")}</div>
      </div>
    </div>
  );
}
