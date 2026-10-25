import { CLIENT_LOGIN_PATH } from "@/lib/auth/routes";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function LegacyClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    }
  }

  const search = query.toString();
  redirect(search.length > 0 ? `${CLIENT_LOGIN_PATH}?${search}` : CLIENT_LOGIN_PATH);
}
