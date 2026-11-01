"use client";

import type { PropsWithChildren } from "react";

export default function PublicPageContainer({ children }: PropsWithChildren) {
  return (
    <main className="theme-canvas mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
      {children}
    </main>
  );
}
