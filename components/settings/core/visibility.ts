/**
 * Which settings a user sees: those they have permission for, and, for a
 * setting with `visibleWhen`, only while the other setting has that value.
 */

import type { SettingValue } from "@/components/settings/registry/define";
import { fieldOf, isSettingKey, type SettingKey } from "@/components/settings/registry/fields";

type VisibilityContext = {
  hasPermission: (permission: string) => boolean;
  valueOf: (key: SettingKey) => SettingValue;
};

export function isSettingVisible(key: SettingKey, { hasPermission, valueOf }: VisibilityContext): boolean {
  const field = fieldOf(key);
  if (field.permission && !hasPermission(field.permission)) return false;
  const rule = field.visibleWhen;
  if (rule && isSettingKey(rule.key)) return valueOf(rule.key) === rule.equals;
  return true;
}

export function visibleSettingKeys(keys: SettingKey[], context: VisibilityContext): SettingKey[] {
  return keys.filter((key) => isSettingVisible(key, context));
}
