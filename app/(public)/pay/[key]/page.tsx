import MyButton from "@/components/my-button";
import PayInvoiceView from "./pay-invoice-view";
import { getPublicData } from "@/lib/api/api";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import type { ClientPaymentData, ClientPaymentResponse } from "@/types/pay-types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ key: string }>;
};

type ShortUrlApiResponse = {
  success?: boolean;
  data?: {
    url?: string;
  };
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const metadata: Metadata = {
  title: t("pay.title"),
};

function getValidHttpUrl(value: string): string | null {
  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function getHostCandidates(input: string | null): string[] {
  if (!input) {
    return [];
  }

  const hosts = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const values = new Set<string>();

  for (const host of hosts) {
    values.add(host);
    const hostWithoutPort = host.split(":")[0]?.trim();
    if (hostWithoutPort) {
      values.add(hostWithoutPort);
    }
  }

  return [...values];
}

async function getClientPayment(uuid: string): Promise<ClientPaymentData | null> {
  const requestHeaders = await headers();
  const hostValues = getHostCandidates(requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"));

  if (hostValues.length === 0) {
    return null;
  }

  for (const host of hostValues) {
    try {
      const payload = (await getPublicData(
        `/public/client/${encodeURIComponent(uuid)}?host=${encodeURIComponent(host)}`,
      )) as ClientPaymentResponse & { success?: boolean };

      if (payload?.success && payload.data) {
        return payload.data;
      }
    } catch {
      // Continue trying remaining host candidates.
    }
  }

  return null;
}

async function getRedirectUrl(key: string): Promise<string | null> {
  const normalizedKey = key.trim();
  if (!normalizedKey) {
    return null;
  }

  try {
    const payload = (await getPublicData(`/public/short/${encodeURIComponent(normalizedKey)}`)) as ShortUrlApiResponse;
    if (!payload?.success || !payload.data?.url) {
      return null;
    }

    return getValidHttpUrl(payload.data.url.trim());
  } catch {
    return null;
  }
}

export default async function PayShortUrlPage({ params }: Props) {
  const { key } = await params;

  if (UUID_PATTERN.test(key)) {
    const data = await getClientPayment(key);
    if (data) {
      return <PayInvoiceView data={data} />;
    }

    return (
      <main className="mx-auto flex min-h-[60svh] w-full max-w-md items-center px-4 py-8">
        <div className="w-full space-y-3 rounded-lg border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
          <h1 className="text-lg font-semibold">{t("pay.deep_link.invalid_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("pay.deep_link.invalid_message")}</p>
          <p className="text-sm text-muted-foreground">{t("pay.deep_link.support_message")}</p>
          <MyButton url="/pay" variant="outline" size="default" className="w-full">
            {t("pay.deep_link.back_to_pay")}
          </MyButton>
        </div>
      </main>
    );
  }

  const destinationUrl = await getRedirectUrl(key);

  if (destinationUrl) {
    redirect(destinationUrl);
  }

  return (
    <main className="mx-auto flex min-h-[60svh] w-full max-w-md items-center px-4 py-8">
      <div className="w-full space-y-3 rounded-lg border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
        <h1 className="text-lg font-semibold">{t("pay.short_link.invalid_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("pay.short_link.invalid_message")}</p>
        <p className="text-sm text-muted-foreground">{t("pay.short_link.support_message")}</p>
        <MyButton url="/pay" variant="outline" size="default" className="w-full">
          {t("pay.short_link.back_to_pay")}
        </MyButton>
      </div>
    </main>
  );
}
