"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const DISMISS_STORAGE_KEY = "pwa-install-dismissed-until";
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function getInstallPromptDismissedUntil(): number | null {
  if (typeof window === "undefined") return null;
  const rawValue = window.localStorage.getItem(DISMISS_STORAGE_KEY);
  if (!rawValue) return null;

  const dismissedUntil = Number(rawValue);
  if (!Number.isFinite(dismissedUntil)) {
    window.localStorage.removeItem(DISMISS_STORAGE_KEY);
    return null;
  }

  return dismissedUntil;
}

function isInstallPromptDismissed(): boolean {
  const dismissedUntil = getInstallPromptDismissedUntil();
  if (!dismissedUntil) return false;

  const isStillDismissed = Date.now() < dismissedUntil;
  if (!isStillDismissed && typeof window !== "undefined") {
    window.localStorage.removeItem(DISMISS_STORAGE_KEY);
  }

  return isStillDismissed;
}

function dismissInstallPromptForOneMonth(): void {
  if (typeof window === "undefined") return;
  const dismissedUntil = Date.now() + DISMISS_DURATION_MS;
  window.localStorage.setItem(DISMISS_STORAGE_KEY, String(dismissedUntil));
}

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsDismissed(isInstallPromptDismissed());

    // Check if already installed as standalone
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as NavigatorWithStandalone).standalone);
    setIsStandalone(standalone);

    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(ios);

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handler = (e: Event) => {
      if (isInstallPromptDismissed()) {
        setIsDismissed(true);
        return;
      }
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    dismissInstallPromptForOneMonth();
    setIsDismissed(true);
  };

  // Don't render if already installed, dismissed, or no prompt available
  if (isStandalone) return null;
  if (isDismissed) return null;

  // iOS instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{t("pwa_install_prompt.title")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("pwa_install_prompt.ios_instruction_start")}{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>{" "}
              {t("pwa_install_prompt.ios_instruction_end")}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label={t("pwa_install_prompt.dismiss_aria_label")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Chrome/Edge install prompt
  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg border bg-background p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{t("pwa_install_prompt.title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("pwa_install_prompt.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("pwa_install_prompt.later")}
          </button>
          <button
            onClick={handleInstall}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            {t("pwa_install_prompt.install")}
          </button>
        </div>
      </div>
    </div>
  );
}
