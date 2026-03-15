"use client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
export default function Logout() {
  const { t } = useTranslation();
  return (
    <div
      onClick={async () => {
        await signOut({ redirectTo: "/admin" });
      }}
    >
      <div className="flex gap-2 cursor-pointer">
        <LogOut />
        <div>{t("user_profile.sign_out")}</div>
      </div>
    </div>
  );
}
