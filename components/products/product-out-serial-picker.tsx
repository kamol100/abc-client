"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useFetch } from "@/app/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toNumber } from "@/lib/helper/helper";
import type { ProductOutFormState } from "@/components/products/product-out-type";

type ProductInSerialItem = {
    id: number;
    serial_number: string;
};

type ProductOutSerialPickerProps = {
    lineIndex: number;
};

const getArrayFromResponse = (response: unknown): ProductInSerialItem[] => {
    if (!response || typeof response !== "object") return [];
    const root = response as Record<string, unknown>;
    const data = root.data;

    const list = Array.isArray(data)
        ? data
        : data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).data)
            ? ((data as Record<string, unknown>).data as unknown[])
            : [];

    return list
        .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            return {
                id: toNumber((row.id as number | string | null | undefined) ?? null),
                serial_number: String(row.serial_number ?? ""),
            };
        })
        .filter((item): item is ProductInSerialItem => item !== null && item.id > 0);
};

const ProductOutSerialPicker: FC<ProductOutSerialPickerProps> = ({ lineIndex }) => {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext<ProductOutFormState>();
    const [searchText, setSearchText] = useState("");

    const line = useWatch({
        control,
        name: `product.${lineIndex}`,
    });

    const productInId = toNumber(line?.productin_id);
    const quantityLimit = Math.max(0, Math.trunc(toNumber(line?.quantity)));
    const serialPath = `product.${lineIndex}.serial` as const;
    const selectedSerialIds = (line?.serial ?? [])
        .map((id) => String(id ?? "").trim())
        .filter((id) => id.length > 0);

    const { data, isLoading } = useQuery({
        queryKey: ["product-in-serials", productInId],
        queryFn: async () => {
            const response = await useFetch({
                url: `/product-in-serials/${productInId}`,
            });
            return getArrayFromResponse(response);
        },
        enabled: productInId > 0,
        retry: 0,
    });
    const serialList = data ?? [];

    const filteredSerials = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return serialList;
        return serialList.filter((row) =>
            row.serial_number.toLowerCase().includes(keyword),
        );
    }, [serialList, searchText]);

    useEffect(() => {
        if (productInId <= 0) {
            setSearchText("");
            setValue(serialPath, [], { shouldDirty: true });
            return;
        }
        setSearchText("");
    }, [productInId, serialPath, setValue]);

    useEffect(() => {
        if (selectedSerialIds.length === 0 || serialList.length === 0) return;
        const availableIds = new Set(serialList.map((row) => String(row.id)));
        const validIds = selectedSerialIds.filter((id) => availableIds.has(id));

        if (validIds.length !== selectedSerialIds.length) {
            setValue(serialPath, validIds, { shouldDirty: true, shouldValidate: true });
        }
    }, [selectedSerialIds, serialList, serialPath, setValue]);

    const toggleSerial = (serialId: string, checked: boolean) => {
        const current = [...selectedSerialIds];
        if (checked) {
            if (current.includes(serialId)) return;
            if (quantityLimit > 0 && current.length >= quantityLimit) return;
            setValue(serialPath, [...current, serialId], {
                shouldDirty: true,
                shouldValidate: true,
            });
            return;
        }

        setValue(
            serialPath,
            current.filter((id) => id !== serialId),
            {
                shouldDirty: true,
                shouldValidate: true,
            },
        );
    };

    return (
        <div className="rounded-md border border-dashed p-3 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder={t("product_out.serial.search_placeholder")}
                    className="sm:max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                    {t("product_out.serial.selected_count", {
                        count: selectedSerialIds.length,
                    })}
                </p>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-md border p-2">
                {isLoading ? (
                    <p className="text-sm text-muted-foreground px-2 py-1">
                        {t("common.loading")}
                    </p>
                ) : filteredSerials.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-1">
                        {t("product_out.serial.empty_state")}
                    </p>
                ) : (
                    <div className="space-y-1 flex">
                        {filteredSerials.map((item) => {
                            const serialId = String(item.id);
                            const checked = selectedSerialIds.includes(serialId);
                            return (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-muted cursor-pointer"
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={(value) =>
                                            toggleSerial(serialId, value === true)
                                        }
                                    />
                                    <span className="text-sm">{item.serial_number}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductOutSerialPicker;
