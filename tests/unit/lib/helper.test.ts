import {
  calculateInvoiceTotals,
  cellIndex,
  formatKey,
  formatMoney,
  groupBy,
  objectToQueryString,
  parseApiError,
  toApiDateString,
  toNumber,
} from "@/lib/helper/helper";

describe("helper utilities", () => {
  it("groups data by provided key", () => {
    const items = [
      { id: 1, type: "internet" },
      { id: 2, type: "billing" },
      { id: 3, type: "internet" },
    ];

    const grouped = groupBy(items, (item) => item.type);

    expect(grouped.internet).toHaveLength(2);
    expect(grouped.billing).toHaveLength(1);
  });

  it("builds query string while skipping empty values", () => {
    const query = objectToQueryString({
      keyword: "fiber",
      page: 2,
      tags: ["new", "active"],
      empty: "",
      nullable: null,
      optional: undefined,
    });

    expect(query).toBe("keyword=fiber&page=2&tags=[new,active]");
  });

  it("converts invalid numeric values to zero", () => {
    expect(toNumber("17.5")).toBe(17.5);
    expect(toNumber("invalid")).toBe(0);
    expect(toNumber(null)).toBe(0);
  });

  it("formats money from mixed input values", () => {
    expect(formatMoney("2000")).toBe("2,000");
    expect(formatMoney("1450.5", 2)).toBe("1,450.50");
  });

  it("formats API date strings for both formats", () => {
    expect(toApiDateString(new Date("2026-04-12T12:00:00.000Z"))).toBe(
      "2026-04-12",
    );
    expect(toApiDateString("2026-04-12T14:35:00.000Z", "dmy")).toBe(
      "2026-04-12",
    );
  });

  it("calculates invoice totals with line and header discount", () => {
    const totals = calculateInvoiceTotals(
      [
        { amount: 100, quantity: 2, discount: 10 },
        { amount: "50", quantity: "3", discount: "5" },
      ],
      20,
    );

    expect(totals).toEqual({
      sub_total: 350,
      line_total_discount: 15,
      header_discount: 20,
      total_discount: 35,
      after_discount_amount: 315,
    });
  });

  it("generates table cell index based on pagination", () => {
    const pagination = { per_page: 40, current_page: 3 } as Parameters<
      typeof cellIndex
    >[1];

    expect(cellIndex(0, pagination)).toBe(81);
    expect(cellIndex(4, pagination)).toBe(85);
  });

  it("formats keys and parses API error fallbacks", () => {
    expect(formatKey("invoice_total_discount")).toBe("Invoice Total Discount");
    expect(
      parseApiError({
        response: { data: { error: { error: { message: "Nested error" } } } },
      }),
    ).toBe("Nested error");
    expect(parseApiError({})).toBe(false);
  });
});
