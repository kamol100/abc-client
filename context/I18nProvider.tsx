"use client";

import i18n, { initializeI18n } from "@/i18n";
import { FC, ReactNode, useMemo } from "react";
import { I18nextProvider } from "react-i18next";

type Props = {
  children: ReactNode;
  translations?: any;
};

const I18nProvider: FC<Props> = ({ children, translations = {} }) => {
  const memoizedTranslations = useMemo(() => translations, [translations]);

  initializeI18n(memoizedTranslations);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
