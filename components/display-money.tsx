"use client";

import { memo, useCallback } from "react";
import DisplayCount, {
    type DisplayCountProps,
} from "./display-count";

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

export type DisplayMoneyProps = Omit<DisplayCountProps, "formatCurrency" | "formatter"> & {
    formatCurrency?: boolean;
    formatter?: DisplayMoneyFormatter;
};

function DisplayMoney({ formatCurrency = true, formatter, ...props }: DisplayMoneyProps) {
    const displayCountFormatter: NonNullable<DisplayCountProps["formatter"]> = useCallback(
        (value, context) => {
            if (!formatter) {
                return context.defaultFormatted;
            }

            return formatter(value, {
                currency: context.currency,
                locale: context.locale,
                abbreviated: context.abbreviated,
                isNegative: context.isNegative,
                defaultFormatted: context.defaultFormatted,
            });
        },
        [formatter],
    );

    return (
        <DisplayCount
            formatCurrency={formatCurrency}
            formatter={formatter ? displayCountFormatter : undefined}
            {...props}
        />
    );
}

export default memo(DisplayMoney);
