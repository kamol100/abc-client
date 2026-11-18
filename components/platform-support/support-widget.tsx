"use client";

import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { supportArticleId, supportContextPath } from "@/components/platform-support/support-model";

interface SupportWidgetValue {
  includePage: boolean;
  contextPath: string | null;
  articleId: string | null;
  liveArticleId: string | null;
  setLiveArticleId: (articleId: string | null) => void;
  setIncludePage: (include: boolean, source?: { path: string; articleId: string | null }) => void;
}

const EMPTY_WIDGET: SupportWidgetValue = {
  includePage: false,
  contextPath: null,
  articleId: null,
  liveArticleId: null,
  setLiveArticleId: () => undefined,
  setIncludePage: () => undefined,
};

const SupportWidgetContext = createContext<SupportWidgetValue>(EMPTY_WIDGET);

export function useSupportWidget(): SupportWidgetValue {
  return useContext(SupportWidgetContext);
}

export function SupportWidgetState({ children }: PropsWithChildren) {
  const [includePage, setIncluded] = useState(false);
  const [contextPath, setContextPath] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [liveArticleId, setLiveArticleId] = useState<string | null>(null);

  const setIncludePage = useCallback((include: boolean, source?: { path: string; articleId: string | null }) => {
    if (!include || !source) {
      setIncluded(false);
      setContextPath(null);
      setArticleId(null);
      return;
    }
    const path = supportContextPath(source.path);
    if (!path) {
      setIncluded(false);
      setContextPath(null);
      setArticleId(null);
      return;
    }
    setIncluded(true);
    setContextPath(path);
    setArticleId(path.startsWith("/help/") ? supportArticleId(source.articleId) : null);
  }, []);

  return (
    <SupportWidgetContext.Provider
      value={{
        includePage,
        contextPath,
        articleId,
        liveArticleId,
        setLiveArticleId,
        setIncludePage,
      }}
    >
      {children}
    </SupportWidgetContext.Provider>
  );
}

export function HelpArticleMarker({ articleId }: { articleId: string }) {
  const { setLiveArticleId } = useSupportWidget();
  useEffect(() => {
    setLiveArticleId(articleId);
    return () => setLiveArticleId(null);
  }, [articleId, setLiveArticleId]);
  return null;
}

export function IncludePageControl() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const widget = useSupportWidget();

  return (
    <label className="flex items-start gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        className="mt-1"
        checked={widget.includePage}
        data-testid="help-include-page"
        onChange={(event) => {
          widget.setIncludePage(event.target.checked, {
            path: pathname,
            articleId: widget.liveArticleId,
          });
        }}
      />
      <span>
        {t("help.include_page")}
        <span className="block text-muted-foreground">{t("help.include_page_hint")}</span>
        {widget.includePage && widget.contextPath && (
          <span className="mt-1 block break-all text-foreground" data-testid="help-include-path">
            {widget.contextPath}
            {widget.articleId ? ` · ${widget.articleId}` : ""}
          </span>
        )}
      </span>
    </label>
  );
}
