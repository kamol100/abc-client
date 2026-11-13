import { loadHelpActor } from "@/lib/help/actor";
import { projectHelpLibrary } from "@/lib/help/content";
import { helpArticleResponse } from "@/lib/help/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return helpArticleResponse(request, id, {
    actor: await loadHelpActor(),
    library: projectHelpLibrary(),
  });
}
