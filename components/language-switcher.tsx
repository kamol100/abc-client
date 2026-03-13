"use client";

import { useLanguage } from "@/hooks/use-language";
import { LANGUAGES, type Language } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const LANGUAGE_BUTTON_LABELS: Record<Language, string> = {
  en: "EN",
  bn: "বাং",
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <ToggleGroup
      type="single"
      value={language}
      onValueChange={(v) => v && setLanguage(v as Language)}
      className="gap-0 rounded-[var(--radius)] border border-input bg-transparent p-0.5"
    >
      {LANGUAGES.map((lang) => (
        <ToggleGroupItem
          key={lang}
          value={lang}
          variant="outline"
          className={cn(
            " rounded-[var(--radius)]  px-2.5 text-xs font-medium transition-colors",
            language === lang &&
            "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
          )}
          aria-label={lang === "en" ? "English" : "Bangla"}
        >
          {LANGUAGE_BUTTON_LABELS[lang]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
