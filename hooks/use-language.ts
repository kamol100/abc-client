import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_COOKIE, parseLanguage, type Language } from "@/lib/i18n/languages";

export function useLanguage() {
  const { i18n } = useTranslation();
  const language = parseLanguage(i18n.language);

  const setLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
      document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    },
    [i18n]
  );

  return { language, setLanguage };
}
