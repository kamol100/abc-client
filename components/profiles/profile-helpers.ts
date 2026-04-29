import { adminLogout } from "@/lib/actions";

export function getProfileInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function runAdminProfileLogout(): Promise<void> {
  const loginUrl = new URL("/admin", window.location.origin).toString();
  await adminLogout();
  window.location.assign(loginUrl);
}
