import { loadDatabaseHelp } from "@/lib/help/database-library";
import { helpArticleResponse, requestedHelpLocale } from "@/lib/help/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const locale = requestedHelpLocale(request);
  if (locale === "invalid") return Response.json({ success: false, code: "not_found" }, { status: 404 });
  try {
    const deps = await loadDatabaseHelp(locale ?? "en");
    return helpArticleResponse(request, (await context.params).id, deps);
  } catch {
    return Response.json({ success: false, code: "unavailable" }, {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
