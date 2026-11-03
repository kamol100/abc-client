import type { ModuleContent, ModuleId } from "@/components/marketing/modules/module-types";
import { MODULES_A } from "@/components/marketing/modules/content-a";
import { MODULES_B } from "@/components/marketing/modules/content-b";

export const MODULES: Record<ModuleId, ModuleContent | undefined> = Object.fromEntries(
  [...MODULES_A, ...MODULES_B].map((m) => [m.id, m]),
) as Record<ModuleId, ModuleContent | undefined>;
