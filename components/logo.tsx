"use client";

import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useProfile } from "@/context/app-provider";

const DEFAULT_LOGO = "/static/logo.png";

function toAbsoluteUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API ?? "").trim().replace(/\/$/, "");
  return base ? `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}` : trimmed;
}

const DefaultLogoImage = () => (
  <div className="max-w-[80px] h-6 overflow-hidden relative">
    <Image
      src={DEFAULT_LOGO}
      alt="logo"
      width={80}
      height={24}
      className="h-8 w-auto object-contain"
    />
  </div>
);

const Logo: FC = () => {
  const { profile } = useProfile();
  const [logoFailed, setLogoFailed] = useState(false);

  const logoUrl = toAbsoluteUrl(profile?.company?.logo);

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  if (logoUrl && !logoFailed) {
    return (
      <div className="max-w-[80px] h-6 overflow-hidden">
        <img
          src={logoUrl}
          className="h-6 object-fill"
          alt="logo"
          onError={() => setLogoFailed(true)}
        />
      </div>
    );
  }

  return <DefaultLogoImage />;
};

export default Logo;
