"use client";

import { createI18n } from "@/i18n";
import { DEFAULT_LANGUAGE, type Language } from "@/lib/i18n/languages";
import { FC, ReactNode, useState } from "react";
import { I18nextProvider } from "react-i18next";

type Props = {
  children: ReactNode;
  initialLanguage?: Language;
};

const I18nProvider: FC<Props> = ({ children, initialLanguage = DEFAULT_LANGUAGE }) => {
  const [i18n] = useState(() => createI18n(initialLanguage));

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
