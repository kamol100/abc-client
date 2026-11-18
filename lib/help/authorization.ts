import type { HelpArticlePolicy } from "@/content/help/catalog";

export interface HelpActor {
  principal: "anonymous" | "client" | "staff";
  permissions: readonly string[];
  subscriptionState: string | null;
  disabledFeatures: readonly string[];
  readOnlyFeatures: readonly string[];
}

export const ANONYMOUS_HELP_ACTOR: HelpActor = {
  principal: "anonymous",
  permissions: [],
  subscriptionState: null,
  disabledFeatures: [],
  readOnlyFeatures: [],
};

const READ_SUFFIXES = [".access", ".show", ".report", ".map", ".by-wallet"] as const;

export function isReadHelpPermission(name: string): boolean {
  if (name.includes("dashboard")) return true;
  return READ_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item !== "");
}

export function helpActorFromSettings(body: unknown): HelpActor {
  const envelope = record(body);
  if (!envelope || envelope.success === false) return ANONYMOUS_HELP_ACTOR;
  const data = record(envelope.data);
  if (!data || !Array.isArray(data.permissions)) return ANONYMOUS_HELP_ACTOR;
  const subscription = record(data.subscription);
  const state = subscription && typeof subscription.state === "string" ? subscription.state : null;
  return {
    principal: "staff",
    permissions: stringList(data.permissions),
    subscriptionState: state,
    disabledFeatures: stringList(subscription?.disabled_features),
    readOnlyFeatures: stringList(subscription?.read_only_features),
  };
}

function featureBlocks(actor: HelpActor, article: HelpArticlePolicy): boolean {
  if (article.baseline || !article.feature) return false;
  if (actor.subscriptionState !== "expired") return false;
  if (actor.disabledFeatures.includes(article.feature)) return true;
  if (!actor.readOnlyFeatures.includes(article.feature)) return false;
  return [...article.requiredAll, ...article.requiredAny].some((name) => !isReadHelpPermission(name));
}

export function canReadHelpArticle(
  actor: HelpActor,
  article: HelpArticlePolicy,
  options?: { allowDrafts?: boolean },
): boolean {
  if (actor.principal !== "staff") return false;
  if (article.publication === "draft" && !options?.allowDrafts) return false;
  if (article.audience === "platform" && !actor.permissions.some((name) => name.startsWith("platform-support-admin."))) {
    return false;
  }
  if (!article.requiredAll.every((name) => actor.permissions.includes(name))) return false;
  if (article.requiredAny.length > 0 && !article.requiredAny.some((name) => actor.permissions.includes(name))) {
    return false;
  }
  return !featureBlocks(actor, article);
}
