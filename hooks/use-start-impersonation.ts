"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { useFetch } from "@/app/actions";
import {
  useImpersonation,
  usePermissions,
  useProfile,
  useSettings,
} from "@/context/app-provider";
import { clearServiceWorkerCaches } from "@/lib/pwa-utils";
import type { AppData, ImpersonationResponse } from "@/types/app";

export type ImpersonationKind = "company" | "reseller";

export type ImpersonationTarget = {
  id: string;
  userUuid?: string;
};

type FetchResult = {
  success?: boolean;
  message?: string;
  data?: ImpersonationResponse | AppData;
};

function messageFrom(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

export function useStartImpersonation() {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const { setSettings } = useSettings();
  const { setProfile } = useProfile();
  const { setPermissions } = usePermissions();
  const { impersonation, setImpersonation, saveOriginalToken } = useImpersonation();
  const [switching, setSwitching] = useState(false);

  const sessionToken = (session as { token?: string } | null)?.token ?? null;
  const isImpersonating = impersonation.is_impersonating;

  async function refreshAppData(token?: string) {
    const res = (await useFetch({
      url: "/user-settings",
      ...(token && { token }),
    })) as FetchResult;

    if (res?.data && "settings" in res.data) {
      const appData = res.data;
      setSettings(appData.settings);
      setProfile(appData.profile);
      setPermissions(appData.permissions);
    }
    queryClient.invalidateQueries();
  }

  async function impersonate(target: ImpersonationTarget, kind: ImpersonationKind) {
    setSwitching(true);
    try {
      if (!isImpersonating && sessionToken) {
        saveOriginalToken(sessionToken);
      }

      const payload =
        kind === "company" ? { company_id: target.id } : { reseller_id: target.id };

      const res = (await useFetch({
        url: `/impersonate/${target.userUuid}`,
        method: "POST",
        data: payload,
      })) as FetchResult;

      if (!res?.success) {
        throw new Error(res?.message || "Failed to impersonate");
      }

      const result = res.data as ImpersonationResponse;

      if (result.impersonation) {
        setImpersonation(result.impersonation);
      }

      if (result.token) {
        await updateSession({
          token: result.token,
          user: {
            name: result.user.name,
            email: result.user.email,
            reseller_id: result.user.reseller_id,
            logo: result.user.company?.logo,
            favicon: result.user.company?.favicon,
          },
        });

        await refreshAppData(result.token);
      }

      clearServiceWorkerCaches();
      window.location.assign("/");
    } catch (error: unknown) {
      console.error("Impersonation failed:", error);
      toast.error(messageFrom(error, "Impersonation failed"));
      setSwitching(false);
    }
  }

  return { impersonate, refreshAppData, switching };
}
