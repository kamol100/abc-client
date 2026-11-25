import GeolocationField from "@/components/form/geolocation-field";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { GeolocationFieldConfig } from "@/components/form-wrapper/form-builder-type";

/**
 * Latitude and longitude inputs with a "use my location" button. It holds two values,
 * under `latitudeName` and `longitudeName`; its own `name` is only a key for the list.
 */
export const geolocationField = defineField<GeolocationFieldConfig>({
    types: ["geolocation"],
    sourceKeys: (field) => [field.latitudeName, field.longitudeName],
    render: ({ field, namePrefix }) => (
        <GeolocationField
            latitudeName={namePrefix ? `${namePrefix}.${field.latitudeName}` : field.latitudeName}
            longitudeName={namePrefix ? `${namePrefix}.${field.longitudeName}` : field.longitudeName}
            latitudeLabel={field.latitudeLabel}
            longitudeLabel={field.longitudeLabel}
            latitudePlaceholder={field.latitudePlaceholder}
            longitudePlaceholder={field.longitudePlaceholder}
            getLocationLabel={field.getLocationLabel}
            getLocationSuccess={field.getLocationSuccess}
            getLocationError={field.getLocationError}
            className={field.className}
        />
    ),
});
