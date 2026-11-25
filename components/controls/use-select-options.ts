"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFetch } from "@/app/actions";
import type { SelectOption } from "@/components/form-wrapper/form-builder-type";

type DropdownApiItem = {
    id: string | number;
    name: string;
    [key: string]: unknown;
};

/** One API record as a dropdown option. Records without a usable value or `name` are skipped. */
const toSelectOption = (
    item: DropdownApiItem,
    translate: (value: string) => string,
    optionValueKey = "id",
): SelectOption | null => {
    const rawValue = item[optionValueKey];
    if (typeof rawValue !== "string" && typeof rawValue !== "number") return null;
    if (typeof item.name !== "string") return null;

    return {
        value: rawValue,
        label: translate(item.name),
        // The whole record, so `populate` can copy other values out of it.
        meta: item,
    };
};

type SelectOptionsInput = {
    /** Part of the cache key, so two dropdowns never share a cache entry by accident. */
    name: string;
    /** A `/dropdown-...` endpoint that returns a list of `{ id, name }` records. */
    api?: string;
    /** Options to use when there is no `api`, or until its answer arrives. */
    staticOptions?: SelectOption[];
    /** Which key of an API record is the option value. Defaults to `id`. */
    optionValueKey?: string;
};

/** The options of a dropdown: loaded from `api` when given, otherwise the static list. */
export function useSelectOptions({
    name,
    api,
    staticOptions,
    optionValueKey = "id",
}: SelectOptionsInput) {
    const { t } = useTranslation();

    const { data: apiOptions, isLoading } = useQuery({
        queryKey: [`${name}-dropdown`, api, optionValueKey],
        queryFn: async (): Promise<SelectOption[]> => {
            const result = await useFetch({ url: api as string });
            const items: unknown[] = Array.isArray(result?.data) ? result.data : [];
            return items.flatMap((item: unknown) => {
                if (!item || typeof item !== "object") return [];
                const option = toSelectOption(item as DropdownApiItem, t, optionValueKey);
                return option ? [option] : [];
            });
        },
        enabled: !!api,
        retry: 0,
    });

    const options = useMemo(() => {
        if (api && apiOptions) return apiOptions;
        return staticOptions ?? [];
    }, [api, apiOptions, staticOptions]);

    return { options, isLoading };
}
