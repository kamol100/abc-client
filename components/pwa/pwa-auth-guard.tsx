"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

const AUTH_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export default function PWAAuthGuard() {
  const { data: session, status } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run auth checks when the user is authenticated
    if (status !== "authenticated" || !session) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const checkAuth = async () => {
      try {
        // Check if the backend session/token is still valid
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (!res.ok) {
          await handleSessionExpired();
          return;
        }

        const data = await res.json();

        // If NextAuth session has no token, the session has expired
        if (!data?.token) {
          await handleSessionExpired();
        }
      } catch {
        // Network error - don't log out, user might be temporarily offline
        if (!navigator.onLine) return;
        // If online but request failed, session might be expired
        await handleSessionExpired();
      }
    };

    const handleSessionExpired = async () => {
      // Clear service worker caches to prevent stale data
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage("CLEAR_CACHES");
      }

      // Sign out and redirect to login
      await signOut({ callbackUrl: "/admin" });
    };

    // Run initial check
    checkAuth();

    // Set up periodic checking
    intervalRef.current = setInterval(checkAuth, AUTH_CHECK_INTERVAL);

    // Also check when the app regains focus (important for PWA standalone)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    // Check when coming back online
    const handleOnline = () => {
      checkAuth();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    // For standalone PWA: also check on page show (back/forward cache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && isStandalone) {
        checkAuth();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [session, status]);

  return null;
}
