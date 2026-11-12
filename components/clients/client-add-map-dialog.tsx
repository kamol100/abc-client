"use client";

import ClientMapPreview from "@/components/clients/client-map-preview";
import { addClientMapUrl, type AddClientMapPayload } from "@/components/clients/client-map-api";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import useApiMutation from "@/hooks/use-api-mutation";
import {
    getGeolocationErrorKey,
    getHighAccuracyGeolocation,
    type GeolocationCoords,
} from "@/lib/helper/helper";
import { Loader2 } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ClientAddMapDialogProps {
    clientId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatCoordinate(value: number): string {
    return value.toFixed(6);
}

const ClientAddMapDialog: FC<ClientAddMapDialogProps> = ({
    clientId,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const [coordinates, setCoordinates] = useState<GeolocationCoords | null>(null);
    const [locating, setLocating] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);

    const { mutateAsync: saveClientMap, isPending: isSaving } = useApiMutation<
        { id?: string },
        AddClientMapPayload
    >({
        url: addClientMapUrl(clientId),
        method: "POST",
        invalidateKeys: "clients,reseller-clients,client-maps",
        successMessage: "client.map.saved",
        defaultErrorMessage: "client.map.failed",
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        let active = true;
        setCoordinates(null);
        setErrorKey(null);
        setLocating(true);

        getHighAccuracyGeolocation()
            .then((position) => {
                if (!active) return;
                if (!Number.isFinite(position.latitude) || !Number.isFinite(position.longitude)) {
                    setErrorKey("common.get_location_unavailable");
                    return;
                }
                setCoordinates(position);
            })
            .catch((error: unknown) => {
                if (!active) return;
                setCoordinates(null);
                setErrorKey(getGeolocationErrorKey(error));
            })
            .finally(() => {
                if (active) setLocating(false);
            });

        return () => {
            active = false;
        };
    }, [open]);

    const canSubmit = coordinates !== null && !locating && !isSaving && clientId.length > 0;

    const handleSubmit = async (close: () => void) => {
        if (!coordinates) return;
        await saveClientMap({
            adr_latitude: coordinates.latitude,
            adr_longitude: coordinates.longitude,
        });
        close();
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            size="lg"
            title="client.map.title"
            description="client.map.description"
            loading={isSaving}
            footer={({ close, loading }) => (
                <>
                    <MyButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        onClick={close}
                        disabled={loading}
                        title="common.cancel"
                    />
                    <MyButton
                        action="save"
                        variant="default"
                        size="default"
                        onClick={() => handleSubmit(close)}
                        disabled={!canSubmit || loading}
                        loading={loading}
                        title="client.map.submit"
                    />
                </>
            )}
        >
            <div className="space-y-4">
                {locating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("client.map.locating")}</span>
                    </div>
                )}
                {errorKey && (
                    <p className="text-sm text-destructive" role="alert">
                        {t(errorKey)}
                    </p>
                )}
                {coordinates && (
                    <>
                        <ClientMapPreview
                            latitude={coordinates.latitude}
                            longitude={coordinates.longitude}
                        />
                        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <dt className="text-sm text-muted-foreground">{t("client.map.latitude")}</dt>
                                <dd className="text-sm font-medium">{formatCoordinate(coordinates.latitude)}</dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-sm text-muted-foreground">{t("client.map.longitude")}</dt>
                                <dd className="text-sm font-medium">{formatCoordinate(coordinates.longitude)}</dd>
                            </div>
                        </dl>
                    </>
                )}
            </div>
        </MyDialog>
    );
};

export default ClientAddMapDialog;
