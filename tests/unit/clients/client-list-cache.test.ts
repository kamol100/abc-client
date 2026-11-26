import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { findClientInListCache, findClientListContext } from "@/components/clients/client-list-cache";

function page(rows: Array<{ id: string; name: string }>) {
    return { success: true, data: { data: rows, pagination: {} } };
}

describe("findClientInListCache", () => {
    // কোম্পানি বা রিসেলার ক্লায়েন্ট তালিকার যেকোনো পেজ থেকে আইডি মিলিয়ে সারি পাওয়া যায় কি না যাচাই করি।
    it("Client list cache: finds the row on any cached page of the company or reseller client list", () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(["clients", { page: 1 }], page([{ id: "a", name: "A" }]));
        queryClient.setQueryData(["reseller-clients", { page: 3 }, { reseller_id: 2 }], page([{ id: "b", name: "B" }]));

        expect(findClientInListCache(queryClient, "a")?.name).toBe("A");
        expect(findClientInListCache(queryClient, "b")?.name).toBe("B");
    });

    // তালিকায় না থাকলে, বা শুধু বিস্তারিত ও অন্য ক্লায়েন্ট-কুয়েরি থাকলে কিছুই ফেরত আসে না কি না যাচাই করি।
    it("Client list cache: returns nothing when only the detail or other client queries are cached", () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(["clients", "detail", "a"], { success: true, data: { id: "a", name: "A" } });
        queryClient.setQueryData(["clients", "a", "sms-status"], { success: true, data: { enabled: true } });
        queryClient.setQueryData(["clients", { page: 1 }], page([{ id: "z", name: "Z" }]));

        expect(findClientInListCache(queryClient, "a")).toBeUndefined();
    });

    // আগের/পরের জন্য ক্লায়েন্ট যে তালিকা-পেজে আছে তার ক্রম ও অবস্থান পাওয়া যায়, একাধিক পেজে থাকলে সর্বশেষ লোড হওয়াটা নেয় কি না যাচাই করি।
    it("Client list context: returns the ids and position from the most recently loaded page holding the client", () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(["clients", { page: 1 }], page([{ id: "a", name: "A" }, { id: "b", name: "B" }]), { updatedAt: 1000 });
        queryClient.setQueryData(["clients", { page: 1 }, { status: 1 }], page([{ id: "x", name: "X" }, { id: "b", name: "B" }, { id: "c", name: "C" }]), { updatedAt: 2000 });

        expect(findClientListContext(queryClient, "b")).toEqual({ ids: ["x", "b", "c"], index: 1 });
        expect(findClientListContext(queryClient, "a")).toEqual({ ids: ["a", "b"], index: 0 });
    });

    // কোনো তালিকায় না থাকলে (যেমন ইনভয়েস থেকে খোলা) কিছু ফেরত আসে না কি না যাচাই করি।
    it("Client list context: returns nothing when no cached client list holds the client", () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(["clients", "detail", "a"], { success: true, data: { id: "a", name: "A" } });

        expect(findClientListContext(queryClient, "a")).toBeUndefined();
    });
});
