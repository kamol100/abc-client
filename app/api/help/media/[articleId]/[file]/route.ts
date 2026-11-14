import { loadDatabaseHelp } from "@/lib/help/database-library";
import { helpMediaResponse } from "@/lib/help/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ articleId: string; file: string }> },
) {
  const { articleId, file } = await context.params;
  const deps = await loadDatabaseHelp("en");
  return helpMediaResponse(articleId, file, deps);
}
