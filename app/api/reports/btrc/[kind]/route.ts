import { auth } from "@/auth/auth";
import { NextResponse } from "next/server";

const REPORTS = {
    clients: "btrc/clients",
    resellers: "btrc/resellers",
} as const;

type ReportKind = keyof typeof REPORTS;

function isReportKind(value: string): value is ReportKind {
    return value === "clients" || value === "resellers";
}

function sessionToken(session: unknown): string | null {
    if (!session || typeof session !== "object" || !("token" in session)) return null;
    const token = session.token;
    return typeof token === "string" && token !== "" ? token : null;
}

export async function GET(
    request: Request,
    context: { params: Promise<{ kind: string }> },
) {
    const { kind } = await context.params;
    if (!isReportKind(kind)) {
        return NextResponse.json({ success: false, message: "Unknown report" }, { status: 404 });
    }

    const token = sessionToken(await auth());
    if (!token) {
        return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
    }

    const apiBase = process.env.NEXTAPI_URL;
    if (!apiBase) {
        return NextResponse.json({ success: false, message: "API is not configured" }, { status: 500 });
    }

    const incoming = new URL(request.url);
    const params = new URLSearchParams();
    ["zone_id", "status", "reseller_id", "scope"].forEach((key) => {
        const value = incoming.searchParams.get(key);
        if (value && value !== "all") params.set(key, value);
    });
    const query = params.toString();
    const upstream = await fetch(`${apiBase}/api/v1/${REPORTS[kind]}${query ? `?${query}` : ""}`, {
        headers: {
            Accept: "text/csv, application/json",
            Authorization: `Bearer ${token}`,
            "X-Requested-With": "XMLHttpRequest",
        },
        cache: "no-store",
    });

    if (!upstream.ok) {
        const body: unknown = await upstream.json().catch(() => ({
            success: false,
            message: "Could not generate the report",
        }));
        return NextResponse.json(body, { status: upstream.status });
    }

    return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "text/csv; charset=UTF-8",
            "Content-Disposition":
                upstream.headers.get("content-disposition")
                ?? `attachment; filename="${kind === "clients" ? "BTRC_Clients_List.xls" : "BTRC_Resellers_List.xls"}"`,
            "Cache-Control": "no-store",
        },
    });
}
