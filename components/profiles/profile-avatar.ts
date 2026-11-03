import { storedPrivateImage } from "@/lib/images/private-image";
import type { Staff } from "@/types/app";

export function staffProfileAvatarSrc(staff?: Staff | null): string | undefined {
  const photo = storedPrivateImage(staff?.photo);
  if (!photo) return undefined;
  return `/api/staff-photo?v=${encodeURIComponent(photo)}`;
}

export function clientProfileAvatarSrc(photo?: string | null): string | undefined {
  const stored = storedPrivateImage(photo);
  if (!stored) return undefined;
  return `/api/client-photo?v=${encodeURIComponent(stored)}`;
}
