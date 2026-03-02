import { cookies } from "next/headers";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";
import { LANGUAGE_COOKIE, parseLanguage, type Language } from "./languages";

type Translations = typeof en;

const translationMap: Record<Language, Translations> = { en, bn };

export async function getServerTranslations(): Promise<Translations> {
  const cookieStore = await cookies();
  const lang = parseLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  return translationMap[lang];
}
