import type { Resource } from "i18next";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

const bnTyped: typeof en = bn;

export const resources: Resource = {
  en: { translation: en },
  bn: { translation: bnTyped },
};
