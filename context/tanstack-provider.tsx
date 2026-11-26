"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function TanstackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 30s: a remount, or a page opened right after its data was loaded or prefetched, reuses the data
  // instead of fetching it again. Mutations still refetch through invalidateQueries; a query that must
  // always be fresh sets its own staleTime.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
