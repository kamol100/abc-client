"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export type ChoiceMenuOption<Value extends string> = {
    value: Value;
    content: ReactNode;
};

type ChoiceMenuProps<Value extends string> = {
    ariaLabel: string;
    value: Value;
    trigger: ReactNode;
    options: ChoiceMenuOption<Value>[];
    onSelect: (value: Value) => void;
    disabled?: boolean;
    align?: "start" | "center" | "end";
    menuClassName?: string;
};

export function ChoiceMenu<Value extends string>({
    ariaLabel,
    value,
    trigger,
    options,
    onSelect,
    disabled = false,
    align = "start",
    menuClassName,
}: ChoiceMenuProps<Value>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={ariaLabel}
                    disabled={disabled}
                    className={cn(
                        "inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-md text-sm",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                >
                    {trigger}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className={cn("max-h-60 w-max overflow-y-auto", menuClassName)}>
                {options.map((option) => {
                    const selected = option.value === value;

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            aria-checked={selected}
                            className={cn(
                                "cursor-pointer whitespace-nowrap p-1 mt-0.5",
                                selected && "bg-accent text-accent-foreground",
                            )}
                            onSelect={() => onSelect(option.value)}
                        >
                            {option.content}
                            <Check
                                className={cn("ml-auto h-3.5 w-3.5", !selected && "invisible")}
                                aria-hidden
                            />
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ChoiceMenu;
