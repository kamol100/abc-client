const BELOW_TWENTY = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
] as const;

const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"] as const;

const wordsUnderThousand = (value: number): string => {
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    const parts: string[] = [];

    if (hundreds > 0) {
        parts.push(`${BELOW_TWENTY[hundreds]} Hundred`);
    }

    if (rest >= 20) {
        const ten = Math.floor(rest / 10);
        const one = rest % 10;
        parts.push(one > 0 ? `${TENS[ten]} ${BELOW_TWENTY[one]}` : TENS[ten]);
    } else if (rest > 0 || (hundreds === 0 && value === 0)) {
        parts.push(BELOW_TWENTY[rest]);
    }

    return parts.join(" ");
};

/** Whole-number English words for a money total. */
export function amountInWords(amount: number): string {
    const value = Math.round(Math.abs(amount));
    if (!Number.isFinite(value) || value === 0) {
        return "Zero";
    }

    const scales = [
        { size: 1_000_000_000, label: "Billion" },
        { size: 1_000_000, label: "Million" },
        { size: 1_000, label: "Thousand" },
    ] as const;

    let remaining = value;
    const parts: string[] = [];

    for (const scale of scales) {
        const count = Math.floor(remaining / scale.size);
        if (count > 0) {
            parts.push(`${wordsUnderThousand(count)} ${scale.label}`);
            remaining %= scale.size;
        }
    }

    if (remaining > 0) {
        parts.push(wordsUnderThousand(remaining));
    }

    return parts.join(" ");
}
