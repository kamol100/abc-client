import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, type Language } from "@/lib/i18n/languages";
import { resources } from "@/lib/i18n/resources";

// A process-wide instance keeps the first language for the life of the server,
// so a later request renders the wrong locale and hydration fails.
export function createI18n(language: Language = DEFAULT_LANGUAGE): I18nInstance {
  const instance = i18next.createInstance();

  instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    initImmediate: false,
    react: { useSuspense: false },
  });

  return instance;
}
