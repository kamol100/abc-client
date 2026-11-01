import { describe, expect, it } from "vitest";
import {
  formatTrafficAmount,
  formatUsageRecordedAt,
} from "@/components/client-area/traffic-report/traffic-report-format";
import { TrafficReportSchema } from "@/components/client-area/traffic-report/traffic-report-type";

describe("traffic report formatting", () => {
  it("shows recorded days at midnight without shifting the calendar date", () => {
    expect(formatUsageRecordedAt("2026-10-27", "en")).toBe("27 Oct, 2026 12:00 am");
  });

  it("keeps unavailable usage distinct from a real zero", () => {
    expect(formatTrafficAmount(0, false)).toBeNull();
    expect(formatTrafficAmount(0, true)).toBe("0 B");
    expect(formatTrafficAmount(1536, true)).toBe("1.5 KB");
  });

  it("accepts the traffic report payload", () => {
    const parsed = TrafficReportSchema.parse({
      timezone: "Asia/Dhaka",
      collected: true,
      collected_from: "2026-09-01",
      summaries: {
        this_week: figure(),
        this_month: figure(),
        last_month: figure(),
      },
      period: figure(),
      series: [],
      data: [],
      pagination: {
        total: 0,
        count: 0,
        per_page: 10,
        current_page: 1,
        total_pages: 1,
      },
    });

    expect(parsed.collected).toBe(true);
  });
});

function figure() {
  return {
    upload_bytes: 0,
    download_bytes: 0,
    total_bytes: 0,
    from: "2026-10-01",
    to: "2026-10-29",
    available: true,
    complete: true,
  };
}
