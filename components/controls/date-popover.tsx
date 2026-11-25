"use client";

import type { ReactNode, Ref } from "react";
import { CalendarIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { enUS, bn } from "react-day-picker/locale";
import { MyButton } from "@/components/my-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseLanguage } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

type DatePopoverProps = {
    /** The id of the button. In a form this is the field name. */
    id: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The picked value as text, or null to show the placeholder. */
    displayText: string | null;
    /** A translation key. */
    placeholder: string;
    disabled: boolean;
    hasError: boolean;
    showCalendarIcon: boolean;
    showClear: boolean;
    onClear: () => void;
    buttonRef?: Ref<HTMLButtonElement>;
    onBlur?: () => void;
    /** The calendar. */
    children: ReactNode;
};

/**
 * The part both date controls share: the button that shows the picked value, the
 * clear button on it, and the popover the calendar opens in.
 */
export function DatePopover({
    id,
    open,
    onOpenChange,
    displayText,
    placeholder,
    disabled,
    hasError,
    showCalendarIcon,
    showClear,
    onClear,
    buttonRef,
    onBlur,
    children,
}: DatePopoverProps) {
    const { t } = useTranslation();

    return (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <MyButton
                        id={id}
                        ref={buttonRef}
                        variant="outline"
                        size="default"
                        onBlur={onBlur}
                        disabled={disabled}
                        className={cn(
                            "h-9 w-full min-w-0 justify-start overflow-hidden px-3 text-left font-normal bg-background shadow-sm",
                            showClear && "pr-8",
                            displayText === null && "text-muted-foreground",
                            hasError && "border-destructive"
                        )}
                    >
                        {showCalendarIcon && <CalendarIcon />}
                        <span className="min-w-0 truncate">
                            {displayText ?? t(placeholder)}
                        </span>
                    </MyButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    {children}
                </PopoverContent>
            </Popover>
            {showClear && (
                <button
                    type="button"
                    aria-label={t("common.clear")}
                    className="absolute right-2 top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onClear();
                    }}
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}

/** The calendar language that matches the app language. */
export function useCalendarLocale() {
    const { i18n } = useTranslation();
    return parseLanguage(i18n.language) === "en" ? enUS : bn;
}
