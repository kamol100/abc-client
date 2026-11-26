import { describe, expect, it } from "vitest";
import {
    clientViewModeFromSettings,
    toClientViewMode,
    withClientViewParam,
} from "@/components/clients/view-mode/client-view-mode";

describe("client view open mode", () => {
    // নতুন সেটিং থাকলে সেটিই মানা হয়, পুরনো "নতুন ট্যাব" সুইচ উপেক্ষা হয় কি না যাচাই করি।
    it.each(["modal", "drawer", "page", "new_tab"] as const)(
        "Client view mode: uses the saved choice %s even when the old new-tab switch is on",
        (mode) => {
            expect(clientViewModeFromSettings({ client_view_open_mode: mode, client_view_open_on_new_tab: 1 })).toBe(mode);
        },
    );

    // নতুন সেটিং না থাকলে পুরনো সুইচ চালু হলে নতুন ট্যাব, বন্ধ বা ফাঁকা হলে একই পেজ হয় কি না যাচাই করি।
    it.each([
        [true, "new_tab"],
        [1, "new_tab"],
        ["1", "new_tab"],
        ["true", "new_tab"],
        [false, "page"],
        [0, "page"],
        ["0", "page"],
        [undefined, "page"],
    ])("Client view mode: without a saved choice, the old new-tab switch %s gives %s", (legacy, expected) => {
        expect(clientViewModeFromSettings({ client_view_open_on_new_tab: legacy })).toBe(expected);
    });

    // অজানা বা ফাঁকা মান এলে ডিফল্ট "একই পেজ" দেখায় কি না যাচাই করি।
    it.each([null, undefined, "", "popup", 1])("Client view mode: reads %s as the default, same page", (raw) => {
        expect(toClientViewMode(raw)).toBe("page");
    });

    // মডাল/ড্রয়ারের URL প্যারামিটার যোগ, বদল ও মোছার সময় পেজের অন্য প্যারামিটার অক্ষত থাকে কি না যাচাই করি।
    it("Client view URL: adds, replaces and removes view_client and keeps the page's other parameters", () => {
        expect(withClientViewParam("/clients", "?page=2", "a")).toBe("/clients?page=2&view_client=a");
        expect(withClientViewParam("/clients", "?page=2&view_client=a", "b")).toBe("/clients?page=2&view_client=b");
        expect(withClientViewParam("/clients", "?page=2&view_client=b", null)).toBe("/clients?page=2");
        expect(withClientViewParam("/clients", "?view_client=b", null)).toBe("/clients");
    });
});
