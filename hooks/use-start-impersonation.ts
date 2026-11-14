"use client";

import { useRef, useState } from "react";
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
import type { AppData, ImpersonationResponse } from "@/types/app";

export type ImpersonationKind = "company" | "reseller" | "staff";

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
  const requestInFlight = useRef(false);

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
    if (requestInFlight.current) {
      return false;
    }

    requestInFlight.current = true;
    setSwitching(true);
    try {
      if (!isImpersonating && sessionToken) {
        saveOriginalToken(sessionToken);
      }

      const res = (await useFetch(
        kind === "staff"
          ? {
              url: `/impersonate/staff/${target.id}`,
              method: "POST",
            }
          : {
              url: `/impersonate/${target.userUuid}`,
              method: "POST",
              data:
                kind === "company"
                  ? { company_id: target.id }
                  : { reseller_id: target.id },
            },
      )) as FetchResult;

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

      window.location.assign("/");
      return true;
    } catch (error: unknown) {
      console.error("Impersonation failed:", error);
      toast.error(messageFrom(error, "Impersonation failed"));
      requestInFlight.current = false;
      setSwitching(false);
      return false;
    }
  }

  return { impersonate, refreshAppData, switching };
}
