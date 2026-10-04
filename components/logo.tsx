"use client";

import { FC, ReactNode, useEffect, useState } from "react";
import { useSafeProfile } from "@/context/app-provider";
import { resolveApiAssetUrl } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

const DEFAULT_LOGO = "/static/logo.png";

interface LogoProps {
  name?: string;
  children?: ReactNode;
}

const Logo: FC<LogoProps> = ({ name, children }) => {
  const profile = useSafeProfile()?.profile;
  const [logoFailed, setLogoFailed] = useState(false);

  const logoUrl = resolveApiAssetUrl(profile?.reseller?.logo || profile?.company?.logo);
  const hasCustomLogo = Boolean(logoUrl) && !logoFailed;
  const displayName = name ?? profile?.reseller?.name ?? profile?.company?.name ?? "";
  const initial = displayName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]:items-center">
      <img
        src={hasCustomLogo ? (logoUrl as string) : DEFAULT_LOGO}
        alt={displayName || "logo"}
        onError={() => hasCustomLogo && setLogoFailed(true)}
        className={cn(
          "h-5 w-auto max-w-full shrink-0 object-contain",
          hasCustomLogo
            ? "group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
            : "group-data-[collapsible=icon]:hidden"
        )}
      />
      {!hasCustomLogo && (
        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground group-data-[collapsible=icon]:flex">
          {initial}
        </div>
      )}
      <div className="grid w-full min-w-0 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate text-xs font-medium text-muted-foreground">{displayName}</span>
        {children}
      </div>
    </div>
  );
};

export default Logo;
