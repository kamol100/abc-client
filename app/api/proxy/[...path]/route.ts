import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth/auth";
import { buildApiProxyUrl } from "@/lib/api/api-proxy-url";

/*
 * Read-only pass-through to the Laravel API for useApiQuery.
 *
 * Reads used to go through the `useFetch` Server Action, and Next runs Server Actions one at a time per
 * browser tab, so a page with many queries loaded them in a queue. A Route Handler is a plain HTTP
 * request, so the browser runs reads in parallel. The Sanctum token stays on the server, as before.
 * Writes still use the Server Action (`useApiMutation`).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const target = buildApiProxyUrl(process.env.NEXTAPI_URL, path, req.nextUrl.search);
    if (!target) {
        return NextResponse.json({ success: false, message: "Not found", status: 404 }, { status: 404 });
    }

    const session = (await auth()) as { token?: string } | null;
    const token = session?.token;
    if (!token) {
        return NextResponse.json({ success: false, message: "Unauthenticated.", status: 401 }, { status: 401 });
    }

    try {
        const upstream = await fetch(target, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        return new NextResponse(await upstream.text(), {
            status: upstream.status,
            headers: {
                "Content-Type": upstream.headers.get("content-type") ?? "application/json",
                "Cache-Control": "no-store",
            },
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Unable to process request", error: null, status: 502 },
            { status: 502 },
        );
    }
}
