import "server-only";
import { auth } from "@/auth/auth";
import { ANONYMOUS_HELP_ACTOR, helpActorFromSettings, type HelpActor } from "@/lib/help/authorization";

function sessionToken(session: unknown): string | null {
  if (!session || typeof session !== "object" || !("token" in session)) return null;
  const token = session.token;
  return typeof token === "string" && token !== "" ? token : null;
}

export async function loadHelpActor(): Promise<HelpActor> {
  const token = sessionToken(await auth());
  const base = process.env.NEXTAPI_URL;
  if (!token || !base) return ANONYMOUS_HELP_ACTOR;
  try {
    const response = await fetch(`${base}/api/v1/user-settings`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });
    if (!response.ok) return ANONYMOUS_HELP_ACTOR;
    return helpActorFromSettings(await response.json());
  } catch {
    return ANONYMOUS_HELP_ACTOR;
  }
}
