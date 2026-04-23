import PublicPageContainer from "@/app/(public)/public-page-container";
import type { PropsWithChildren } from "react";

export default function PayLayout({ children }: PropsWithChildren) {
  return <PublicPageContainer>{children}</PublicPageContainer>;
}
