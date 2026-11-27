"use client";

/**
 * One small control per setting kind. Each gets the saved value and a `save`
 * function, shows the new value at once, and puts the old one back if saving
 * fails. A new kind = one component here + one case in SettingControl.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import MyButton from "@/components/my-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { NumberSetting, SelectSetting, SettingDefinition, SettingValue, TextSetting } from "@/components/settings/registry/define";
import { validateSetting } from "@/components/settings/core/values";
import { settingLabelKey, type SettingKey } from "@/components/settings/registry/fields";

type ControlProps = {
  settingKey: SettingKey;
  value: SettingValue;
  saving: boolean;
  disabled: boolean;
  save: (value: SettingValue) => Promise<boolean>;
};

/** Spinner that keeps its space when hidden, so nothing moves while saving. */
function SavingSpinner({ show }: { show: boolean }) {
  return (
    <Loader2
      className={cn("size-4 shrink-0 text-muted-foreground", show ? "animate-spin" : "invisible")}
      aria-hidden
    />
  );
}

function ToggleControl({ settingKey, value, saving, disabled, save }: ControlProps) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(Boolean(value));
  useEffect(() => setChecked(Boolean(value)), [value]);

  return (
    <div className="flex items-center gap-2">
      <SavingSpinner show={saving} />
      <Switch
        id={`switch-${settingKey}`}
        checked={checked}
        disabled={disabled || saving}
        aria-label={t(settingLabelKey(settingKey))}
        onCheckedChange={async (next) => {
          setChecked(next);
          if (!(await save(next))) setChecked(!next);
        }}
      />
    </div>
  );
}

function SelectControl({ settingKey, field, value, saving, disabled, save }: ControlProps & { field: SelectSetting }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(value);
  useEffect(() => setSelected(value), [value]);

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <SavingSpinner show={saving} />
      <Select
        value={selected === null ? "" : String(selected)}
        disabled={disabled || saving}
        onValueChange={async (raw) => {
          const next = field.valueType === "number" ? Number(raw) : raw;
          const previous = selected;
          setSelected(next);
          if (!(await save(next))) setSelected(previous);
        }}
      >
        <SelectTrigger className="w-full sm:w-56" aria-label={t(settingLabelKey(settingKey))}>
          <SelectValue
            placeholder={t(`settings.fields.${settingKey}.placeholder`, { defaultValue: t("settings.common.not_set") })}
          />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {t(option.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TextControl({ settingKey, field, value, saving, disabled, save }: ControlProps & { field: TextSetting | NumberSetting }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const label = t(settingLabelKey(settingKey));

  if (!editing) {
    const shown = String(value ?? "").trim();
    return (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "text-sm",
            // A value may be long (a URL) and has to break; the placeholder must
            // stay on one line next to a long description.
            shown ? "min-w-0 break-all" : "shrink-0 whitespace-nowrap text-muted-foreground",
          )}
        >
          {shown || t("settings.common.not_set")}
        </span>
        <MyButton
          type="button"
          action="edit"
          title={t("settings.actions.edit")}
          aria-label={`${t("settings.actions.edit")} ${label}`}
          disabled={disabled || saving}
          onClick={() => {
            setDraft(String(value ?? ""));
            setError(null);
            setEditing(true);
          }}
        />
      </div>
    );
  }

  const onSave = async () => {
    const problem = validateSetting(settingKey, draft);
    if (problem) {
      setError(problem);
      return;
    }
    if (await save(draft)) setEditing(false);
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-72">
      <Input
        autoFocus
        type={field.kind === "number" ? "number" : "text"}
        value={draft}
        placeholder={t(`settings.fields.${settingKey}.placeholder`, { defaultValue: "" })}
        aria-label={label}
        aria-invalid={error !== null}
        onChange={(event) => {
          setDraft(event.target.value);
          setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void onSave();
          }
          if (event.key === "Escape") setEditing(false);
        }}
      />
      {error && <p className="text-xs text-destructive">{t(error)}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <MyButton type="button" action="save" variant="default" title={t("common.save")} loading={saving} onClick={() => void onSave()} />
        <MyButton type="button" action="cancel" title={t("common.cancel")} disabled={saving} onClick={() => setEditing(false)} />
      </div>
    </div>
  );
}

/** Picks the control for a setting's kind. */
export function SettingControl(props: ControlProps & { field: SettingDefinition }) {
  const { field } = props;
  switch (field.kind) {
    case "toggle":
      return <ToggleControl {...props} />;
    case "select":
      return <SelectControl {...props} field={field} />;
    case "text":
    case "number":
      return <TextControl {...props} field={field} />;
  }
}
