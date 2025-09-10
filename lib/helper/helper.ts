
export const groupBy = (arr: [], keyGetter: Function) => {
    const output: any = {};
    for (let item of arr) {
        const key = keyGetter(item);
        output[key] ??= [];
        output[key].push(item);
    }
    return output;
};

export const objectToQueryString = (params: any) => {
    return Object.keys(params)
        .filter(
            (key) =>
                params[key] !== undefined && params[key] !== null && params[key] !== ""
        )
        .map((item) => {
            if (Array.isArray(params[item])) {
                if (params[item]?.length > 0) {
                    return `${item}=[${params[item].join(",")}]`
                }
                return "";
            }
            return `${item}=${params[item]}`;
        })
        .join("&")
        .replace(/&\s*$/, "");
    //here in filter if we use just params[key] to filter it will remove for example status=0
};

export const chunk: any = (array: any, size: number) => {
    if (!array?.length) {
        return [];
    }
    const head = array.slice(0, size);
    const tail = array.slice(size);

    return [head, ...chunk(tail, size)];
};

export const useNumberToArray = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

export const useParseMoney = (
    value: number | string | null | undefined,
    minimumFractionDigits = 0
): string => {
    const intl = new Intl.NumberFormat("en", {
        minimumFractionDigits: minimumFractionDigits,
    });
    const amount = useParseFloat(value as string);
    return intl.format(amount);
};
export const useParseFloat = (value: number | string): number => {
    if (typeof value === undefined || typeof value === null) return 0;
    return isNaN(parseFloat(value as string)) ? 0 : parseFloat(value as string);
};

export const useParseError = (error: any): string | boolean => {
    if (error?.response?.data?.error?.message) {
        return error.response.data.error.message;
    }
    if (error?.response?.data?.error?.error?.message) {
        return error?.response?.data?.error?.error?.message;
    }
    if (error?.message) {
        return error.message;
    }
    if (error?.error?.message) {
        return error.error.message;
    }

    return false;
};

export const getCalendarStartAndEnd = (date: Date): { start: string; end: string } | undefined => {
    const { month, year } = useSplitDateTime(date);
    if (month && year) {

        let firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
        let lastDayOfMonth = new Date(Date.UTC(year, month, 0));


        let dayOfWeekFirst = firstDayOfMonth.getUTCDay();
        let daysToSubtract = (dayOfWeekFirst + 6) % 7;
        let startOfCalendar = new Date(firstDayOfMonth);
        startOfCalendar.setUTCDate(startOfCalendar.getUTCDate() - daysToSubtract);

        let dayOfWeekLast = lastDayOfMonth.getUTCDay();
        let daysToAdd = (7 - dayOfWeekLast) % 7;
        let endOfCalendar = new Date(lastDayOfMonth);
        endOfCalendar.setUTCDate(endOfCalendar.getUTCDate() + daysToAdd);
        return { start: useFormatDateTime(startOfCalendar), end: useFormatDateTime(endOfCalendar) }
    }
}

export const isDate = (value: any) => {
    return Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime());
}

export const useFormatDateTime = (date: any, segment: string = "full") => {
    if (isDate(date)) {
        if (segment === "date") {
            return date
                .toLocaleString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                .replace(",", "");
        }
        if (segment === "time") {
            return date
                .toLocaleString("en-CA", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: undefined, // Optional: remove if seconds are needed
                    hour12: false,
                })
                .replace(",", "");
        }
        return date
            .toLocaleString("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
            .replace(",", "");
    }
    return ""
}


export const useSplitDateTime = (date: any, delimiters: string = "-") => {// date = "2024-12-30 50:30 / new Date()"
    let dateTimeString = date;
    if (isDate(date)) {
        dateTimeString = useFormatDateTime(date);
    }
    const hasTime = dateTimeString?.includes(" ");
    const [datePart, timePart] = dateTimeString?.split(" ");

    let result = { year: null, month: null, day: null, hour: null, minutes: null };
    const [year, month, day] = datePart?.split(delimiters);

    if (year) {
        result.year = year;
    }
    if (month) {
        result.month = month;
    }
    if (day) {
        result.day = day;
    }
    if (hasTime) {
        const [hour, minutes] = timePart.split(":");
        result.hour = hour;
        result.minutes = minutes;
    }

    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(date));

    return {
        date: `${result?.year}${delimiters}${result?.month}${delimiters}${result?.day}`,
        time: `${result.hour}:${result?.minutes}`,
        year: result?.year,
        month: result?.month,
        day: result?.day,
        hour: result?.hour,
        minutes: result?.minutes,
        dayName: dayName
    };
}


export const useDisplayDateFormat = (date: any, format: any, default_language: string = 'da') => {
    let language = 'da-DK';
    if (default_language === 'en') {
        language = 'en-US';
    }
    const date_time = useSplitDateTime(date);
    if (!date_time?.date) {
        return "";
    }
    if (format === "EEEE d, MMMM") {
        const date = new Date(date_time?.date);
        if (!isNaN(date.getTime())) {
            const formatter = new Intl.DateTimeFormat(language, {
                weekday: "long",
                day: "numeric",
                month: "long",
            });
            return formatter?.format(date);
        }

    }
    if (format === "dmY") {
        //10-01-2024
        return `${date_time?.day}-${date_time?.month}-${date_time?.year}`;
    }
    if (format === "d/m/y") {
        //01/01/2024, "d/m/y"
        return `${date_time?.day}/${date_time?.month}/${date_time?.year}`;
    }
    if (format === "dd/MM/yyyy HH:mm") {
        return `${date_time?.day}/${date_time?.month}/${date_time?.year} ${date_time?.hour}:${date_time?.minutes}`;
    }
    if (format === "MM/dd/yyyy HH:mm") {
        return `${date_time?.month}/${date_time?.day}/${date_time?.year} ${date_time?.hour}:${date_time?.minutes}`;
    }
    if (format === "MM-dd-yyyy HH:mm") {
        return `${date_time?.month}-${date_time?.day}-${date_time?.year} ${date_time?.hour}:${date_time?.minutes}`;
    }
    if (format === "dd-MM-yyyy HH:mm") {
        return `${date_time?.day}-${date_time?.month}-${date_time?.year} ${date_time?.hour}:${date_time?.minutes}`;
    }
    if (format === "d. MMM") {
        const date = new Date(date_time?.date);
        if (!isNaN(date.getTime())) {
            const formatter = new Intl.DateTimeFormat(language, {
                day: "numeric",
                month: "short",
            });
            if (language === "da-DK") {
                return formatter.format(date).replace(/\.$/, "");
            }
            return formatter.format(date);
        }
    }
    return ""; //invalid date
};
