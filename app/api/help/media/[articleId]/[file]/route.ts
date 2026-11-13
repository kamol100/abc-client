import { loadHelpActor } from "@/lib/help/actor";
import { projectHelpLibrary } from "@/lib/help/content";
import { helpMediaResponse } from "@/lib/help/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ articleId: string; file: string }> },
) {
  const { articleId, file } = await context.params;
  return helpMediaResponse(articleId, file, {
    actor: await loadHelpActor(),
    library: projectHelpLibrary(),
  });
}
