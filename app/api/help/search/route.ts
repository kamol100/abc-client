import { loadHelpActor } from "@/lib/help/actor";
import { projectHelpLibrary } from "@/lib/help/content";
import { helpSearchResponse } from "@/lib/help/http";

export async function GET(request: Request) {
  return helpSearchResponse(request, {
    actor: await loadHelpActor(),
    library: projectHelpLibrary(),
  });
}
