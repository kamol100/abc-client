import { privateImageSrc, storedPrivateImage } from "@/lib/images/private-image";
import type { Staff } from "@/types/app";

export function staffProfileAvatarSrc(staff?: Staff | null): string | undefined {
  const photo = storedPrivateImage(staff?.photo);
  const staffId = staff?.id;
  if (!photo || !staffId) return undefined;
  return privateImageSrc("staffs", staffId, "photo", photo);
}
