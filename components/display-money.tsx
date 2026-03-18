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

type DisplayMoneyFormatContext = {
    currency: string;
    locale: string;
    abbreviated: boolean;
    isNegative: boolean;
    defaultFormatted: string;
};

export type DisplayMoneyFormatter = (
    value: number,
    context: DisplayMoneyFormatContext,
) => string;

export interface DisplayMoneyProps
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
    formatter?: DisplayMoneyFormatter;
}

type CurrencyFormatterResult = {
    formatter: Intl.NumberFormat;
    hasCurrencyStyle: boolean;
};

function createCurrencyFormatter(
    locale: string,
    currency: string,
    abbreviate: boolean,
): CurrencyFormatterResult {
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

function DisplayMoney({
    amount,
    currency = "BDT",
    locale = "en-US",
    showIcon = false,
    icon,
    animate = false,
    duration = 800,
    className,
    translation = true,
    abbreviate = false,
    formatter,
    ...rest
}: DisplayMoneyProps) {
    const { i18n } = useTranslation();
    const prefersReducedMotion = useReducedMotion();
    const motionValue = useMotionValue(animate ? 0 : amount);
    const [animatedValue, setAnimatedValue] = useState<number>(animate ? 0 : amount);

    const resolvedLocale = useMemo(() => {
        if (!translation) {
            return locale;
        }
        const language = parseLanguage(i18n.language);
        return LANGUAGE_LOCALE_MAP[language] ?? locale;
    }, [i18n.language, locale, translation]);

    const durationInSeconds = useMemo(() => toDurationSeconds(duration), [duration]);

    const displayFormatter = useMemo(
        () => createCurrencyFormatter(resolvedLocale, currency, abbreviate),
        [abbreviate, currency, resolvedLocale],
    );

    const fullValueFormatter = useMemo(
        () => createCurrencyFormatter(resolvedLocale, currency, false),
        [currency, resolvedLocale],
    );

    const defaultIcon = useMemo(() => {
        const currencyPart = fullValueFormatter.formatter
            .formatToParts(0)
            .find((part) => part.type === "currency");
        return currencyPart?.value ?? currency;
    }, [currency, fullValueFormatter]);

    const formatValue = useCallback(
        (value: number, useCompact: boolean): string => {
            const formatterPack = useCompact ? displayFormatter : fullValueFormatter;
            const baseFormatted = formatterPack.formatter.format(value);
            const defaultFormatted = formatterPack.hasCurrencyStyle
                ? baseFormatted
                : `${baseFormatted} ${currency}`;

            if (!formatter) {
                return defaultFormatted;
            }

            return formatter(value, {
                currency,
                locale: resolvedLocale,
                abbreviated: useCompact,
                isNegative: value < 0,
                defaultFormatted,
            });
        },
        [currency, displayFormatter, formatter, fullValueFormatter, resolvedLocale],
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

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap",
                isNegative && "text-destructive",
                className,
            )}
            {...rest}
        >
            {showIcon && (
                <span aria-hidden="true" className="inline-flex shrink-0 items-center">
                    {icon ?? <span>{defaultIcon}</span>}
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

export default memo(DisplayMoney);
