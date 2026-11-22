/**
 * Building blocks for describing a company setting.
 *
 * Each helper returns a plain object. The registry (fields.ts) is a list of
 * these, one per setting. Values on screen and the saved payload are worked
 * out from the kind (see core/values.ts), so a setting needs no code of its own.
 */

export type SettingOption = { value: string | number; label: string };

type Common = {
  /** Translation key for an optional help line under the label. */
  description?: string;
  /** Only users with this permission see the setting. */
  permission?: string;
  /** Read the stored value with a rule of its own instead of the kind's rule. */
  read?: (raw: unknown) => SettingValue;
  /** Show this setting only while another setting has this value. */
  visibleWhen?: { key: string; equals: SettingValue };
};

/** What a setting holds on screen. */
export type SettingValue = boolean | string | number | null;

/** On/off switch. Saved as 1 or 0. Saves as soon as it is clicked. */
export type ToggleSetting = Common & { kind: "toggle"; default: boolean };

/** Dropdown. Saves as soon as an option is picked. */
export type SelectSetting = Common & {
  kind: "select";
  options: SettingOption[];
  /** Shown when nothing is saved yet. */
  default?: string | number;
  /** "number" saves 5; "string" saves "sms". Worked out from the options. */
  valueType: "number" | "string";
  /** A saved value that is not one of the options shows the default instead. */
  strict?: boolean;
};

/** Free text. Edited with Edit, then Save or Cancel. */
export type TextSetting = Common & {
  kind: "text";
  /** Shown when nothing (or only spaces) is saved. */
  default?: string;
};

/** A number typed into a box, with an optional range. Saved as a number. */
export type NumberSetting = Common & { kind: "number"; min?: number; max?: number };

export type SettingDefinition = ToggleSetting | SelectSetting | TextSetting | NumberSetting;

export const toggle = (opts: Partial<Omit<ToggleSetting, "kind">> = {}): ToggleSetting => ({
  kind: "toggle",
  default: false,
  ...opts,
});

export const select = (
  opts: Omit<SelectSetting, "kind" | "valueType"> & { valueType?: SelectSetting["valueType"] },
): SelectSetting => ({
  kind: "select",
  valueType: typeof opts.options[0]?.value === "string" ? "string" : "number",
  ...opts,
});

export const text = (opts: Omit<TextSetting, "kind"> = {}): TextSetting => ({ kind: "text", ...opts });

export const number = (opts: Omit<NumberSetting, "kind"> = {}): NumberSetting => ({ kind: "number", ...opts });
