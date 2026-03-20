"use client";

import { cn } from "@/lib/utils";
import { parseLanguage, type Language } from "@/lib/i18n/languages";
import { animate as animateMotion, useMotionValue, useReducedMotion } from "framer-motion";
import {
    memo,
    type ReactNode,
    useEffect,
    useMemo,
    useState,
    useCallback,
    type HTMLAttributes,
} from "react";
import { useTranslation } from "react-i18next";

const LANGUAGE_LOCALE_MAP: Record<Language, string> = {
    en: "en-US",
    bn: "bn-BD",
};

const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "BDT";

type DisplayCountFormatContext = {
    currency: string;
    locale: string;
    abbreviated: boolean;
    isNegative: boolean;
    formatCurrency: boolean;
    defaultFormatted: string;
};

export type DisplayCountFormatter = (
    value: number,
    context: DisplayCountFormatContext,
) => string;

export interface DisplayCountProps
    extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    amount: number;
    currency?: string;
    locale?: string;
    showIcon?: boolean;
    icon?: ReactNode;
    animate?: boolean;
    duration?: number;
    className?: string;
    translation?: boolean;
    abbreviate?: boolean;
    formatCurrency?: boolean;
    formatter?: DisplayCountFormatter;
}

type NumberFormatterResult = {
    formatter: Intl.NumberFormat;
    hasCurrencyStyle: boolean;
};

function createIntlFormatter(
    locale: string,
    currency: string,
    abbreviate: boolean,
    formatCurrency: boolean,
): NumberFormatterResult {
    if (!formatCurrency) {
        return {
            formatter: new Intl.NumberFormat(locale, {
                notation: abbreviate ? "compact" : "standard",
                compactDisplay: abbreviate ? "short" : undefined,
            }),
            hasCurrencyStyle: false,
        };
    }

    try {
        return {
            formatter: new Intl.NumberFormat(locale, {
                style: "currency",
                currency,
                notation: abbreviate ? "compact" : "standard",
                compactDisplay: abbreviate ? "short" : undefined,
            }),
            hasCurrencyStyle: true,
        };
    } catch {
        return {
            formatter: new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                notation: abbreviate ? "compact" : "standard",
                compactDisplay: abbreviate ? "short" : undefined,
            }),
            hasCurrencyStyle: false,
        };
    }
}

function toDurationSeconds(duration: number): number {
    if (!Number.isFinite(duration) || duration <= 0) return 0;
    return duration > 10 ? duration / 1000 : duration;
}

function DisplayCount({
    amount,
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    showIcon = false,
    icon,
    animate = false,
    duration = 800,
    className,
    translation = true,
    abbreviate = false,
    formatCurrency = false,
    formatter,
    ...rest
}: DisplayCountProps) {
    const { i18n } = useTranslation();
    const prefersReducedMotion = useReducedMotion();
    const motionValue = useMotionValue(animate ? 0 : amount);
    const [animatedValue, setAnimatedValue] = useState<number>(animate ? 0 : amount);

    const resolvedLocale = useMemo(() => {
        const fallbackLocale = locale || DEFAULT_LOCALE;

        if (!translation) {
            return fallbackLocale;
        }

        const language = parseLanguage(i18n.language);
        return LANGUAGE_LOCALE_MAP[language] ?? fallbackLocale;
    }, [i18n.language, locale, translation]);

    const durationInSeconds = useMemo(() => toDurationSeconds(duration), [duration]);

    const displayFormatter = useMemo(
        () => createIntlFormatter(resolvedLocale, currency, abbreviate, formatCurrency),
        [abbreviate, currency, formatCurrency, resolvedLocale],
    );

    const fullValueFormatter = useMemo(
        () => createIntlFormatter(resolvedLocale, currency, false, formatCurrency),
        [currency, formatCurrency, resolvedLocale],
    );

    const defaultIcon = useMemo(() => {
        if (!formatCurrency) {
            return null;
        }

        const currencyPart = fullValueFormatter.formatter
            .formatToParts(0)
            .find((part) => part.type === "currency");
        return currencyPart?.value ?? currency;
    }, [currency, formatCurrency, fullValueFormatter]);

    const formatValue = useCallback(
        (value: number, useCompact: boolean): string => {
            const formatterPack = useCompact ? displayFormatter : fullValueFormatter;
            const baseFormatted = formatterPack.formatter.format(value);
            const defaultFormatted =
                formatCurrency && !formatterPack.hasCurrencyStyle
                    ? `${baseFormatted} ${currency}`
                    : baseFormatted;

            if (!formatter) {
                return defaultFormatted;
            }

            return formatter(value, {
                currency,
                locale: resolvedLocale,
                abbreviated: useCompact,
                isNegative: value < 0,
                formatCurrency,
                defaultFormatted,
            });
        },
        [currency, displayFormatter, formatCurrency, formatter, fullValueFormatter, resolvedLocale],
    );

    useEffect(() => {
        if (!animate || prefersReducedMotion || durationInSeconds === 0) {
            motionValue.set(amount);
            setAnimatedValue(amount);
            return;
        }

        const controls = animateMotion(motionValue, amount, {
            duration: durationInSeconds,
            ease: "easeOut",
        });

        const unsubscribe = motionValue.on("change", (latest) => {
            const rounded = Number(latest.toFixed(3));
            setAnimatedValue((previous) => (previous === rounded ? previous : rounded));
        });

        return () => {
            unsubscribe();
            controls.stop();
        };
    }, [amount, animate, durationInSeconds, motionValue, prefersReducedMotion]);

    const valueToRender = animate && !prefersReducedMotion ? animatedValue : amount;
    const finalText = formatValue(amount, abbreviate);
    const visibleText = formatValue(valueToRender, abbreviate);
    const accessibleText = formatValue(amount, false);
    const isNegative = amount < 0;
    const iconToRender = icon ?? defaultIcon;
    const shouldRenderIcon = showIcon && Boolean(iconToRender);

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap",
                isNegative && "text-destructive",
                className,
            )}
            {...rest}
        >
            {shouldRenderIcon && (
                <span aria-hidden="true" className="inline-flex shrink-0 items-center">
                    {iconToRender}
                </span>
            )}

            <span className="sr-only">{accessibleText}</span>
            <span aria-hidden="true" className="relative inline-grid tabular-nums">
                <span className="invisible select-none">{finalText}</span>
                <span className="absolute inset-0">{visibleText}</span>
            </span>
        </span>
    );
}

export default memo(DisplayCount);
