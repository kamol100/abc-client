import { describe, expect, it } from "vitest";
import { getClientTerminationDateDisplay } from "@/components/clients/client-termination-date";

const today = new Date(2026, 9, 3, 23, 30, 0);

describe("getClientTerminationDateDisplay", () => {
    it("shows remaining calendar days after the formatted date", () => {
        expect(getClientTerminationDateDisplay("05-Oct-26", today)).toEqual({
            kind: "remaining",
            date: "05-Oct-26",
            days: 2,
        });
        expect(getClientTerminationDateDisplay("18-Oct-26", today)).toEqual({
            kind: "remaining",
            date: "18-Oct-26",
            days: 15,
        });
    });

    it("shows zero days when termination is today", () => {
        expect(getClientTerminationDateDisplay("03-Oct-26", new Date(2026, 9, 3, 0, 30))).toEqual({
            kind: "remaining",
            date: "03-Oct-26",
            days: 0,
        });
    });

    it("marks a past termination date as expired by calendar days", () => {
        expect(getClientTerminationDateDisplay("01-Oct-26", today)).toEqual({
            kind: "expired",
            date: "01-Oct-26",
            days: 2,
        });
    });

    it("parses an ISO calendar date without shifting the day", () => {
        expect(getClientTerminationDateDisplay("2026-10-05T00:00:00.000Z", today)).toEqual({
            kind: "remaining",
            date: "05-Oct-26",
            days: 2,
        });
    });

    it("returns null when the date is missing", () => {
        expect(getClientTerminationDateDisplay(null, today)).toBeNull();
        expect(getClientTerminationDateDisplay(undefined, today)).toBeNull();
        expect(getClientTerminationDateDisplay("  ", today)).toBeNull();
    });

    it("keeps an unreadable value unchanged", () => {
        expect(getClientTerminationDateDisplay("not-a-date", today)).toEqual({
            kind: "unparsed",
            text: "not-a-date",
        });
    });
});
