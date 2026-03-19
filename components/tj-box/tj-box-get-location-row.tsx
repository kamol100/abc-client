"use client";

import { useFormContext } from "react-hook-form";
import { getCurrentGeolocation } from "@/lib/helper/helper";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { MyButton } from "@/components/my-button";
import { useState } from "react";

export function TjBoxGetLocationRow() {
    const { setValue } = useFormContext();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleGetLocation = async () => {
        setLoading(true);
        try {
            const { latitude, longitude } = await getCurrentGeolocation();
            setValue("latitude", latitude);
            setValue("longitude", longitude);
            toast.success(t("tj_box.get_location_success"));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : t("tj_box.get_location_error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <MyButton
            type="button"
            variant="outline"
            size="default"
            onClick={handleGetLocation}
            disabled={loading}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("tj_box.get_current_location")}
        </MyButton>
    );
}
