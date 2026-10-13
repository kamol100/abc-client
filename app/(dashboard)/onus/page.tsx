import { Metadata } from "next";
import OnuTable from "@/components/onu/onu-table";
import { t } from "@/lib/i18n/server";

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Deep links: /onus?olt=<uuid>&pon_port=<id> (OLT page), /onus?low_power=1, /onus?status=los.
const FILTER_KEYS = ["olt", "pon_port", "status", "low_power", "rx_below", "unbound", "search", "client_uuid"];

export const metadata: Metadata = {
    title: t("onu.title_plural"),
};

export default async function OnusPage({ searchParams }: Props) {
    const query = await searchParams;
    const filterValue = new URLSearchParams(
        FILTER_KEYS.flatMap((key) => {
            const value = query[key];
            return typeof value === "string" && value !== "" ? [[key, value]] : [];
        })
    ).toString();

    // key: another deep link to the same route starts with a fresh filter state.
    return <OnuTable key={filterValue} filterValue={filterValue || undefined} />;
}
