import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useTranslation } from "react-i18next";
import I18nProvider from "@/context/I18nProvider";
import { createI18n } from "@/i18n";

function MenuLabel() {
  const { t } = useTranslation();
  return <span>{t("common.menu")}</span>;
}

describe("createI18n", () => {
  it("translates each instance with its own language", () => {
    expect(createI18n("en").t("common.menu")).toBe("Menu");
    expect(createI18n("bn").t("common.menu")).toBe("মেনু");
  });

  it("renders the requested language on the server after an English render", () => {
    const englishHtml = renderToString(
      <I18nProvider initialLanguage="en">
        <MenuLabel />
      </I18nProvider>
    );
    const banglaHtml = renderToString(
      <I18nProvider initialLanguage="bn">
        <MenuLabel />
      </I18nProvider>
    );

    expect(englishHtml).toContain("Menu");
    expect(banglaHtml).toContain("মেনু");
    expect(banglaHtml).not.toContain(">Menu<");
  });
});
