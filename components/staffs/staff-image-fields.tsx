"use client";

import PrivateImageFields from "@/components/form/private-image-fields";
import { staffImageFields } from "@/components/staffs/staff-form-schema";

export default function StaffImageFields() {
  return (
    <PrivateImageFields
      fields={staffImageFields}
      resource="staffs"
      editPermission="staffs.edit"
      uploadPermission="staffs.image.upload"
      messagePrefix="staff.images"
    />
  );
}
