"use client";

import { CompanyProfile } from "@/components/profiles/company-profile";
import { ResellerProfile } from "@/components/profiles/reseller-profile";
import { useProfile } from "@/context/app-provider";

export function Profile() {
  const { profile } = useProfile();
  const reseller = profile.reseller;

  if (reseller != null) {
    return <ResellerProfile profile={profile} reseller={reseller} />;
  }

  return <CompanyProfile profile={profile} />;
}
