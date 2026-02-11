"use client";

import { Form } from "@/components/ui/form";
import { objectToQueryString } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import ActionButton from "../action-button";
import InputField from "../form/input-field";
import { Close } from "../icon";
import { FieldConfig, GRID_STYLES } from "./form-builder-type";

const SelectDropdown = dynamic(() => import("../select-dropdown"));

type FormFilterProps = {
    formSchema: FieldConfig[];
    setFilter?: (x: string) => void;
    watchField?: string[];
    grids?: number;
    gridGap?: string;
    api?: string;
    queryKey?: string;
    defaultFilter?: string;
    searchButton?: boolean;
    showFilter?: boolean;
    setShowFilter?: (x: boolean) => void;
};

const FormFilter = ({
    formSchema,
    grids = 1,
    gridGap = "gap-4",
    setShowFilter = () => {},
    watchField = [],
    searchButton = false,
    defaultFilter,
    setFilter = () => {},
}: FormFilterProps) => {
    const [isFilter, setOpenFilter] = useState(false);
    const form = useForm<FieldValues>();
    const { watch, setValue, handleSubmit } = form;
    const submitRef = useRef<HTMLInputElement>(null);

    const getQueryString = (params: FieldValues) => {
        let query = objectToQueryString(params);
        if (defaultFilter) {
            query = `${query}&${defaultFilter}`;
        }
        setFilter(query);
        return query;
    };

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name && watchField.includes(name) && String(value[name] ?? "").length > 2) {
                submitRef.current?.click();
            }
            if (name && watchField.includes(name) && String(value[name] ?? "").length === 0) {
                submitRef.current?.click();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, watchField]);

    useEffect(() => {
        setShowFilter(isFilter);
    }, [isFilter, setShowFilter]);

    const clearInput = (inputName: string) => {
        setValue(inputName, "");
        submitRef.current?.click();
    };

    const renderField = (field: FieldConfig) => {
        if (field.type === "text" || field.type === "email" || field.type === "number") {
            const fieldValue = form.watch(field.name);
            return (
                <div className="relative">
                    <InputField
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        type={field.type}
                    />
                    {fieldValue && (
                        <div
                            className="absolute top-1 right-0 cursor-pointer p-2"
                            onClick={() => clearInput(field.name)}
                        >
                            <div className="text-gray-500">
                                <Close />
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        if (field.type === "dropdown") {
            return (
                <SelectDropdown
                    name={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    api={field.api}
                    options={field.options}
                    isMulti={field.isMulti}
                    isDisabled={field.isDisabled}
                    isClearable={field.isClearable}
                    onValueChange={() => submitRef.current?.click()}
                />
            );
        }
        return null;
    };

    return (
        <div className="flex-none md:flex lg:flex gap-3">
            {isFilter && (
                <div className="w-full">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(getQueryString)} className="flex w-full">
                            <div className={`w-full grid ${gridGap} m-auto ${GRID_STYLES[grids]} dark:bg-gray-800 w-full`}>
                                {formSchema.map((field, index) => (
                                    <div key={index}>
                                        {field.permission ? renderField(field) : null}
                                    </div>
                                ))}
                            </div>
                            <input className="opacity-0 hidden" type="submit" ref={submitRef} />
                        </form>
                    </Form>
                </div>
            )}
            <div className="flex justify-between flex-row-reverse md:flex-row lg:flex-row gap-2">
                {searchButton && isFilter && (
                    <ActionButton
                        type="search"
                        size="default"
                        className="mt-2 md:mt-0 lg:mt-0"
                        onClick={() => submitRef.current?.click()}
                    />
                )}
                <ActionButton
                    type="filter"
                    size="default"
                    className={cn(isFilter && "mt-2 md:mt-0 lg:mt-0")}
                    variant={isFilter ? "default" : "outline"}
                    onClick={() => setOpenFilter(!isFilter)}
                />
            </div>
        </div>
    );
};

export default FormFilter;
