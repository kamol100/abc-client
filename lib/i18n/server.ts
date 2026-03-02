import i18next from "i18next";
import { DEFAULT_LANGUAGE } from "./languages";
import { resources } from "./resources";

const serverI18n = i18next.createInstance();

serverI18n.init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  initImmediate: false,
});

export const t = serverI18n.t.bind(serverI18n);
