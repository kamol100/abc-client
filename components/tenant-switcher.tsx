"use client";

import {
  ArrowLeftRight,
  Building2,
  LogOut,
  Store,
} from "lucide-react";
import * as React from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useSettings,
  useProfile,
  usePermissions,
  useImpersonation,
} from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useFetch } from "@/app/actions";
import type {
  TenantListItem,
  ImpersonationResponse,
  AppData,
} from "@/types/app";

export type ScopeLevel = "super_admin" | "company" | "reseller";

export const scopeLabelKeyMap: Record<ScopeLevel, string> = {
  super_admin: "tenant_switcher.scope.super_admin",
  company: "tenant_switcher.scope.company",
  reseller: "tenant_switcher.scope.reseller",
};

export function resolveScope(roles?: string[]): ScopeLevel {
  if (roles?.includes("Super Admin")) return "super_admin";
  if (roles?.includes("Admin")) return "company";
  return "reseller";
}

export function TenantSwitcher({ renderTrigger }: { renderTrigger: (switching: boolean) => React.ReactNode }) {
  const { isMobile } = useSidebar();
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const sessionToken = (session as { token?: string } | null)?.token ?? null;

  const { settings, setSettings } = useSettings();
  const { setProfile } = useProfile();
  const { setPermissions } = usePermissions();
  const {
    impersonation,
    setImpersonation,
    saveOriginalToken,
    clearOriginalToken,
    getOriginalToken,
  } = useImpersonation();

  const [switching, setSwitching] = React.useState(false);

  const roles = settings?.roles;
  const scope = resolveScope(roles);
  const isImpersonating = impersonation.is_impersonating;

  // Determine which list endpoint to use based on current scope
  const apiUrl =
    scope === "super_admin"
      ? "impersonate-company-users"
      : "impersonate-reseller-users";

  const { data } = useApiQuery<ApiResponse<TenantListItem[]>>({
    queryKey: ["tenant-switcher", scope],
    url: apiUrl,
    pagination: false,
    enabled: scope !== "reseller",
  });

  const tenants = data?.data ?? [];

  // Check impersonation status on mount
  React.useEffect(() => {
    async function checkStatus() {
      try {
        const res = await useFetch({ url: "/impersonate/status" });
        if (res?.success && res.data?.impersonation) {
          setImpersonation(res.data.impersonation);
        }
      } catch {
        // Status check is non-critical
      }
    }
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Refresh all app-level data after a scope switch.
   */
  async function refreshAppData(token?: string) {
    const res = await useFetch({
      url: "/user-settings",
      ...(token && { token }),
    });
    if (res?.data) {
      const appData = res.data as AppData;
      setSettings(appData.settings);
      setProfile(appData.profile);
      setPermissions(appData.permissions);
    }
    queryClient.invalidateQueries();
  }

  /**
   * Start impersonation: switch into a tenant's user context.
   */
  async function handleImpersonate(tenant: TenantListItem) {
    setSwitching(true);
    try {
      // Save the original token before first impersonation
      if (!isImpersonating && sessionToken) {
        saveOriginalToken(sessionToken);
      }

      const payload = scope === "super_admin"
        ? { company_id: tenant.id }
        : { reseller_id: tenant.id };

      const res = await useFetch({
        url: `/impersonate/${tenant?.user?.uuid}`,
        method: "POST",
        data: payload,
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to impersonate");
      }

      const result = res.data as ImpersonationResponse;

      // Update impersonation state
      setImpersonation(result.impersonation);

      // Update NextAuth session with the new impersonation token
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

        // Refresh all app data with the new token
        await refreshAppData(result.token);
      }

      window.location.reload();
    } catch (error: any) {
      console.error("Impersonation failed:", error);
      toast.error(error?.message || "Impersonation failed");
    } finally {
      setSwitching(false);
    }
  }

  /**
   * Step back one level in the impersonation chain.
   */
  async function handleLeave() {
    setSwitching(true);
    try {
      const res = await useFetch({
        url: "/impersonate/leave",
        method: "POST",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to leave impersonation");
      }

      const result = res.data as ImpersonationResponse;

      // Update impersonation state
      setImpersonation(result.impersonation);

      // Determine which token to use
      const newToken =
        result.token || getOriginalToken();

      if (!result.impersonation.is_impersonating) {
        clearOriginalToken();
      }

      // Restore session
      await updateSession({
        token: newToken,
        user: {
          name: result.user.name,
          email: result.user.email,
          reseller_id: result.user.reseller_id,
          logo: result.user.company?.logo,
          favicon: result.user.company?.favicon,
        },
      });

      await refreshAppData(newToken ?? undefined);
      window.location.reload();
    } catch (error: any) {
      console.error("Leave impersonation failed:", error);
      toast.error(error?.message || "Leave impersonation failed");
    } finally {
      setSwitching(false);
    }
  }

  /**
   * Leave all impersonation levels and return to the original user.
   */
  async function handleLeaveAll() {
    setSwitching(true);
    try {
      const res = await useFetch({
        url: "/impersonate/leave-all",
        method: "POST",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to leave all impersonation");
      }

      const result = res.data as ImpersonationResponse;

      // Reset impersonation state
      setImpersonation(result.impersonation);

      // Restore original token
      const originalToken = getOriginalToken();
      clearOriginalToken();

      await updateSession({
        token: originalToken,
        user: {
          name: result.user.name,
          email: result.user.email,
          reseller_id: result.user.reseller_id,
          logo: result.user.company?.logo,
          favicon: result.user.company?.favicon,
        },
      });

      await refreshAppData(originalToken ?? undefined);
      window.location.reload();
    } catch (error: any) {
      console.error("Leave all impersonation failed:", error);
      toast.error(error?.message || "Leave all impersonation failed");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {renderTrigger(switching)}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-72 max-w-[calc(100vw-1rem)] rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
            {/* Current scope indicator */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {isImpersonating
                ? t("tenant_switcher.scope.impersonating")
                : t("tenant_switcher.scope.current_scope")}{" "}
              - {t(scopeLabelKeyMap[scope])}
            </DropdownMenuLabel>

            {/* Exit impersonation actions */}
            {isImpersonating && (
              <>
                <DropdownMenuItem
                  className="gap-2 p-2 text-orange-600 focus:text-orange-600"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLeave();
                  }}
                  disabled={switching}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {t("tenant_switcher.actions.switch_back_one_level")}
                </DropdownMenuItem>
                {impersonation.chain.length > 1 && (
                  <DropdownMenuItem
                    className="gap-2 p-2 text-red-600 focus:text-red-600"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleLeaveAll();
                    }}
                    disabled={switching}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("tenant_switcher.actions.exit_all_impersonation")}
                  </DropdownMenuItem>
                )}
                {impersonation.chain.length <= 1 && (
                  <DropdownMenuItem
                    className="gap-2 p-2 text-red-600 focus:text-red-600"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleLeaveAll();
                    }}
                    disabled={switching}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("tenant_switcher.actions.exit_impersonation")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Tenant list — only show if user can switch */}
            {scope !== "reseller" && tenants.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {scope === "super_admin" ? (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />{" "}
                      {t("tenant_switcher.labels.companies")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Store className="h-3 w-3" />{" "}
                      {t("tenant_switcher.labels.resellers")}
                    </span>
                  )}
                </DropdownMenuLabel>
                {tenants.map((tenant) => (
                  <DropdownMenuItem
                    key={tenant.id}
                    className="gap-2 p-2"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleImpersonate(tenant);
                    }}
                    disabled={switching}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      {scope === "super_admin" ? (
                        <Building2 className="h-3.5 w-3.5" />
                      ) : (
                        <Store className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm">{tenant.name}</span>
                      {tenant.user && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {tenant.user.name}
                        </span>
                      )}
                    </div>
                    <ArrowLeftRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
    </DropdownMenu>
  );
}
