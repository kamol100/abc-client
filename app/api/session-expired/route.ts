import { NextRequest, NextResponse } from "next/server";
import { sessionExpiredPath } from "@/lib/auth/routes";

// Layouts redirect here when the API rejects the stored token (e.g. the API DB was reset).
// Drops the NextAuth cookies so the proxy stops treating the visitor as logged in.
export function GET(req: NextRequest) {
  const to = sessionExpiredPath(req.nextUrl.searchParams.get("to"));
  // Relative Location: behind the proxy req.url is the internal localhost:3020 address.
  const res = new NextResponse(null, { status: 307, headers: { Location: to } });
  for (const { name } of req.cookies.getAll()) {
    // __Secure-/__Host- cookies are only cleared by a Set-Cookie that is itself Secure.
    if (name.includes("authjs.")) res.cookies.set(name, "", { path: "/", maxAge: 0, secure: name.startsWith("__") });
  }
  return res;
}
