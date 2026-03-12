"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

// Default logo: copied from isp-client/public/static/logo.png into this app's public folder
const DEFAULT_LOGO = "/static/logo.png";

const DefaultLogoImage = () => (
  <div className="max-w-[80px] h-8 overflow-hidden relative">
    <Image
      src={DEFAULT_LOGO}
      alt="logo"
      width={80}
      height={32}
      className="h-8 w-auto object-contain"
    />
  </div>
);

const Logo: FC = () => {
  const { data: session, status } = useSession();
  const [customLogoFailed, setCustomLogoFailed] = useState(false);

  const logo = (session?.user as { logo?: string } | undefined)?.logo;
  const useCustomLogo =
    status !== "loading" &&
    typeof logo === "string" &&
    logo.trim() !== "" &&
    !customLogoFailed;

  if (useCustomLogo) {
    return (
      <div className="max-w-[80px] h-6 overflow-hidden">
        <img
          src={logo.trim()}
          className="h-6 object-fill"
          alt="logo"
          onError={() => setCustomLogoFailed(true)}
        />
      </div>
    );
  }

  return <DefaultLogoImage />;
};

export default Logo;
