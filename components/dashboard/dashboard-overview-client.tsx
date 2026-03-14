"use client";

import dynamic from "next/dynamic";

const DashboardOverview = dynamic(
  () => import("@/components/dashboard/dashboard-overview"),
  { ssr: false }
);

export default function DashboardOverviewClient() {
  return <DashboardOverview />;
}
