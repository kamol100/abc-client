"use client";

import { clientImageFields } from "@/components/clients/client-form-schema";
import PrivateImageFields from "@/components/form/private-image-fields";

export default function ClientImageFields() {
  return (
    <PrivateImageFields
      fields={clientImageFields}
      resource="clients"
      editPermission="clients.edit"
      uploadPermission="clients.image.upload"
      messagePrefix="client.images"
    />
  );
}
