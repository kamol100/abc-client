import { UninstallServiceWorker } from "@/components/uninstall-service-worker";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/context/AuthProvider";
import I18nProvider from "@/context/I18nProvider";
import TanstackProvider from "@/context/tanstack-provider";
import ThemeSettingsProvider from "@/context/theme-data-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { LANGUAGE_COOKIE, parseLanguage } from "@/lib/i18n/languages";
import { THEME_BOOT_SCRIPT, readThemeSettings, themeOverrideStyle } from "@/lib/theme/theme-settings";
import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono, Hind_Siliguri, IBM_Plex_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { ToastContainer } from "react-toastify";
import { headers } from "next/headers";
import "./globals.css";
import { getCompanyPublicData } from "@/lib/api/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function fetchHostName() {
  const requestHeaders = await headers();
  let host = requestHeaders.get("x-forwarded-host");
  if (!host) {
    host = requestHeaders.get("host");
  }
  if (host?.includes(":")) {
    host = host.split(":")[0];
  }
  return host;
}

async function getCompany() {
  const host = await fetchHostName();
  return getCompanyPublicData(host);
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCompany();

  return {
    title: {
      template: `%s | ${settings?.name ?? "ISP"}`,
      default: settings?.name ?? "ISP Management",
    },
    description: settings?.address ?? "Total ISP management company",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language = parseLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const { settings: themeSettings, mode: themeMode } = readThemeSettings({
    themeColor: cookieStore.get("themeColor")?.value,
    density: cookieStore.get("density")?.value,
    radius: cookieStore.get("radius")?.value,
    navDrawerSide: cookieStore.get("navDrawerSide")?.value,
    themePrefs: cookieStore.get("themePrefs")?.value,
    themeMode: cookieStore.get("themeMode")?.value,
  });
  const host = await fetchHostName();
  const themeClassName = [
    geistSans.variable,
    geistMono.variable,
    plexSans.variable,
    hindSiliguri.variable,
    themeMode === "system" ? "" : themeMode,
  ].filter(Boolean).join(" ");
  return (
    <html
      data-domain={host ?? "localhost"}
      lang={language}
      suppressHydrationWarning
      className={themeClassName}
      data-theme-color={themeSettings.color}
      data-density={themeSettings.density}
      data-radius={themeSettings.radius}
      data-theme-preset={themeSettings.preset}
      data-gradients={themeSettings.gradients}
      data-gradient-style={themeSettings.gradientStyle}
      data-gradient-angle={themeSettings.gradientAngle}
      data-font={themeSettings.font}
      data-font-size={themeSettings.fontSize}
      data-shadow={themeSettings.shadow}
      data-border={themeSettings.border}
      data-button-radius={themeSettings.buttonRadius}
      data-card-radius={themeSettings.cardRadius}
      data-dialog-radius={themeSettings.dialogRadius}
      style={themeOverrideStyle(themeSettings.overrides) as CSSProperties | undefined}
      translate="no"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          defaultTheme={themeMode}
          enableSystem
        >
          <AuthProvider>
            <UninstallServiceWorker />
            <Toaster />
            <I18nProvider initialLanguage={language}>
              <ThemeSettingsProvider
                initialSettings={themeSettings}
              >
                <TanstackProvider>{children}</TanstackProvider>
              </ThemeSettingsProvider>
            </I18nProvider>
            <ToastContainer
              position="bottom-right"
              pauseOnFocusLoss={false}
              pauseOnHover={false}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
