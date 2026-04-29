"use client";

import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useSafeProfile } from "@/context/app-provider";
import { resolveApiAssetUrl } from "@/lib/helper/helper";

const DEFAULT_LOGO = "/static/logo.png";

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
  const profileCtx = useSafeProfile();
  const [logoFailed, setLogoFailed] = useState(false);

  const logo = profileCtx?.profile?.reseller?.logo || profileCtx?.profile?.company?.logo;
  const logoUrl = resolveApiAssetUrl(logo);

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
