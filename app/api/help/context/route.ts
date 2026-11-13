import { loadHelpActor } from "@/lib/help/actor";
import { projectHelpLibrary } from "@/lib/help/content";
import { helpContextResponse } from "@/lib/help/http";

export async function GET(request: Request) {
  return helpContextResponse(request, {
    actor: await loadHelpActor(),
    library: projectHelpLibrary(),
  });
}
