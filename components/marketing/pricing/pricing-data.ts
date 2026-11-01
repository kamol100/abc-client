// Plan prices shared by the pricing page and the home page's pricing section.
export const PLAN_ORDER = ["basic", "standard", "premium"] as const;
export type PlanKey = (typeof PLAN_ORDER)[number];

export const TIER_COUNT = 8;

export const MONTHLY_BDT: Record<PlanKey, number[]> = {
  basic: [1_000, 1_500, 2_000, 3_000, 4_000, 6_000, 8_000, 10_000],
  standard: [1_500, 2_500, 3_250, 4_750, 6_250, 9_250, 12_250, 16_500],
  premium: [2_500, 3_500, 4_500, 6_500, 8_500, 12_500, 16_500, 20_000],
};

export const HIGHLIGHT_PLAN: PlanKey = "standard";

export function formatBdt(n: number): string {
  return `৳${n.toLocaleString("en-IN")}`;
}
