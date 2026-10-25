"use client";

import PrivateImageFields from "@/components/form/private-image-fields";
import { resellerImageFields } from "@/components/resellers/reseller-form-schema";

export default function ResellerImageFields() {
    return (
        <PrivateImageFields
            fields={resellerImageFields}
            resource="resellers"
            editPermission="resellers.edit"
            uploadPermission="resellers.image.upload"
            messagePrefix="reseller.images"
        />
    );
}
