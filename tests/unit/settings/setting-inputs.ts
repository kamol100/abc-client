/** Stored values every setting is checked against (see setting-values.test.ts). */
export const RAW_INPUTS: unknown[] = [
  undefined, null, "", "  ", 0, 1, 2, -1, 5, 7, 11, 12, 15, 23, 24, 30, 31, 60,
  "0", "1", "2", "5", "07", "11", "20", "1.5", 2.5, "abc", "true", "false", "TRUE",
  "sms", "voice", " sms ", "INV", " exp ", "BILL", true, false, -27, "-27", -50, "-10",
  {}, Number.NaN,
];
