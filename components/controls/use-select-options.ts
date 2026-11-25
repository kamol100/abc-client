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

/** One API record as a dropdown option. Records without a usable value or label are skipped. */
const toSelectOption = (
    item: DropdownApiItem,
    translate: (value: string) => string,
    optionValueKey: string,
    optionLabelKey: string,
): SelectOption | null => {
    const rawValue = item[optionValueKey];
    const rawLabel = item[optionLabelKey];
    if (typeof rawValue !== "string" && typeof rawValue !== "number") return null;
    if (typeof rawLabel !== "string") return null;

    return {
        value: rawValue,
        label: translate(rawLabel),
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
    /** Which key of an API record is the option label. Defaults to `name`. */
    optionLabelKey?: string;
};

/** The options of a dropdown: loaded from `api` when given, otherwise the static list. */
export function useSelectOptions({
    name,
    api,
    staticOptions,
    optionValueKey = "id",
    optionLabelKey = "name",
}: SelectOptionsInput) {
    const { t } = useTranslation();

    const { data: apiOptions, isLoading, isError, refetch } = useQuery({
        queryKey: [`${name}-dropdown`, api, optionValueKey, optionLabelKey],
        queryFn: async (): Promise<SelectOption[]> => {
            const result = await useFetch({ url: api as string });
            // A failed request must not look like an endpoint with no records.
            if (result?.success === false) throw new Error("dropdown options failed to load");
            const items: unknown[] = Array.isArray(result?.data) ? result.data : [];
            return items.flatMap((item: unknown) => {
                if (!item || typeof item !== "object") return [];
                const option = toSelectOption(item as DropdownApiItem, t, optionValueKey, optionLabelKey);
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

    return {
        options,
        isLoading,
        /** True when the request for the options failed. */
        loadFailed: Boolean(api) && isError,
        /** Requests the options again. */
        reload: () => void refetch(),
    };
}
