import { describe, expect, it } from "vitest";
import { directionsUrl } from "@/components/maps/map-geo";

describe("directionsUrl", () => {
  // ম্যাপের অবস্থান ও ক্লায়েন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «builds a Google Maps directions link for a valid point»।
  it("Map geo: builds a Google Maps directions link for a valid point", () => {
    expect(directionsUrl("23.8103", "90.4125")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=23.8103,90.4125",
    );
    expect(directionsUrl(23.8103, 90.4125)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=23.8103,90.4125",
    );
  });

  // ম্যাপের অবস্থান ও ক্লায়েন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns null for blank or invalid coordinates»।
  it("Map geo: returns null for blank or invalid coordinates", () => {
    for (const [lat, lng] of [
      [null, null],
      [undefined, "90.4"],
      ["", ""],
      ["  ", "90.4"],
      ["abc", "90.4"],
      ["200", "300"],
    ]) {
      expect(directionsUrl(lat, lng)).toBeNull();
    }
  });
});
