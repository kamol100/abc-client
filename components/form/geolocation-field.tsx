"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import InputField from "@/components/form/input-field";
import MyTooltip from "@/components/my-tooltip";
import { getCurrentGeolocation, getGeolocationErrorKey } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import type { LabelProps } from "@/components/form-wrapper/form-builder-type";

type GeolocationFieldProps = {
    latitudeName: string;
    longitudeName: string;
    latitudeLabel?: LabelProps;
    longitudeLabel?: LabelProps;
    latitudePlaceholder?: string;
    longitudePlaceholder?: string;
    getLocationLabel?: string;
    getLocationSuccess?: string;
    getLocationError?: string;
    className?: string;
};

export function GeolocationField({
    latitudeName,
    longitudeName,
    latitudeLabel,
    longitudeLabel,
    latitudePlaceholder,
    longitudePlaceholder,
    getLocationLabel = "common.get_current_location",
    getLocationSuccess = "common.get_location_success",
    getLocationError = "common.get_location_error",
    className,
}: GeolocationFieldProps) {
    const { setValue } = useFormContext();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleGetLocation = async () => {
        setLoading(true);
        try {
            const { latitude, longitude } = await getCurrentGeolocation();
            setValue(latitudeName, latitude, { shouldDirty: true, shouldTouch: true });
            setValue(longitudeName, longitude, { shouldDirty: true, shouldTouch: true });
            toast.success(t(getLocationSuccess));
        } catch (error) {
            const errorKey = getGeolocationErrorKey(error);
            toast.error(t(errorKey !== "common.get_location_error" ? errorKey : getLocationError));
        } finally {
            setLoading(false);
        }
    };

    const locationIcon = (
        <MyTooltip content={t(getLocationLabel)}>
            <button
                type="button"
                className="inline-flex text-primary hover:text-primary/80 disabled:opacity-50"
                onClick={handleGetLocation}
                disabled={loading}
                aria-label={t(getLocationLabel)}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MapPin className="h-4 w-4" />
                )}
            </button>
        </MyTooltip>
    );

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
            <InputField
                name={latitudeName}
                label={latitudeLabel}
                labelSuffix={locationIcon}
                placeholder={latitudePlaceholder}
                type="text"
            />
            <InputField
                name={longitudeName}
                label={longitudeLabel}
                placeholder={longitudePlaceholder}
                type="text"
            />
        </div>
    );
}

export default GeolocationField;
