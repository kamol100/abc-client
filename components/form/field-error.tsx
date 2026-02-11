"use client";

import { useFormContext } from "react-hook-form";

export default function FieldError({ name }: { name: string }) {
    const { formState: { errors } } = useFormContext();
    const error = errors[name];
    if (!error) return null;
    return <p className="text-sm text-destructive mt-1">{error.message?.toString()}</p>;
}
