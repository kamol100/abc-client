import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, type Language } from "@/lib/i18n/languages";
import { resources } from "@/lib/i18n/resources";

let initialized = false;

export function initializeI18n(language: Language = DEFAULT_LANGUAGE) {
  if (initialized) return;

  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    initImmediate: false,
  });

  initialized = true;
}

export default i18n;
