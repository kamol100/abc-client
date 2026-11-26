import { randomUUID } from "node:crypto";
import {
  authenticate,
  expect,
  namedList,
  test,
  uniqueNamed,
  withOwnedTicket,
} from "@/tests/e2e/support-tickets/fixtures";

const UNKNOWN_TICKET = "00000000-0000-4000-8000-000000000001";

test.describe("support ticket access", () => {
  // লগইন ছাড়া টিকিটের তালিকা ও বিস্তারিত পেজ খুললে স্টাফ লগইন চায় কি না দেখি।
  test("ST-A01 Ticket list and details while signed out: require staff login", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      locale: "en-US",
      serviceWorkers: "block",
      storageState: { cookies: [], origins: [] },
    });
    try {
      const page = await context.newPage();
      for (const path of ["/tickets", `/tickets/view/${UNKNOWN_TICKET}`]) {
        await page.goto(path);
        await expect(page).toHaveURL((url) => (
          url.origin === baseURL
          && url.pathname === "/admin"
          && url.searchParams.get("callbackUrl") === path
        ));
        await expect(page.locator("#username")).toBeVisible();
      }
    } finally {
      await context.close();
    }
  });

  // অন্য কোম্পানির সাপোর্ট টিকিট পড়া বা বদলানো যায় না কি না যাচাই করি।
  test("ST-A03 Ticket privacy: prevent another company from reading or changing a support ticket", async ({ browser, staff }) => {
    const mk = await authenticate(browser, "mk");
    try {
      await withOwnedTicket(staff, async (ticket) => {
        const shown = await mk.call(`tickets/${ticket.id}`);
        expect([403, 404]).toContain(shown.status);
        expect(JSON.stringify(shown.body ?? {})).not.toContain(ticket.message);

        const listed = await mk.call(`tickets?ticket_id=${encodeURIComponent(ticket.ticket_code)}`);
        if (listed.status === 200) {
          const body = JSON.stringify(listed.body ?? {});
          expect(body).not.toContain(ticket.message);
          expect(body).not.toContain(ticket.ticket_code);
        } else {
          expect([403, 404]).toContain(listed.status);
        }

        const context = await browser.newContext({
          baseURL: mk.baseURL,
          storageState: mk.state,
          locale: "en-US",
          serviceWorkers: "block",
        });
        try {
          const page = await context.newPage();
          await page.goto(`/tickets/view/${ticket.id}`);
          await expect(page.getByText(ticket.message, { exact: true })).toHaveCount(0);
          await expect(page.getByRole("heading", { name: `Ticket ${ticket.ticket_code}` })).toHaveCount(0);
        } finally {
          await context.close();
        }

        const reply = `E2E foreign reply ${randomUUID()}`;
        const posted = await mk.call(`tickets/${ticket.id}/messages`, "POST", { message: reply });
        expect([403, 404]).toContain(posted.status);
        expect((await staff.messages(ticket.id)).some((row) => row.message === reply)).toBe(false);

        const removed = await mk.call(`tickets/${ticket.id}`, "DELETE");
        expect([403, 404]).toContain(removed.status);
        expect((await staff.ticket(ticket.id)).id).toBe(ticket.id);
      });
    } finally {
      await mk.dispose();
    }
  });

  // টিকিটের ক্লায়েন্টের জায়গায় অন্য কোম্পানির ক্লায়েন্ট বসানো আটকে দেয় কি না দেখি।
  test("ST-A03 Ticket client ownership: reject replacing the client with another company's client", async ({ browser, staff }) => {
    const mk = await authenticate(browser, "mk");
    try {
      await withOwnedTicket(staff, async (ticket) => {
        const foreignClient = uniqueNamed(namedList(await mk.get("dropdown-clients")), "MK client");
        const originalClientId = ticket.client?.id;
        if (!originalClientId) throw new Error("Owned ticket has no client to compare after a foreign assignment attempt.");
        await staff.call(`tickets/${ticket.id}`, "PUT", { client_id: foreignClient.id });
        try {
          const after = await staff.ticket(ticket.id);
          expect(after.client?.id).toBe(originalClientId);
          expect(after.message).toBe(ticket.message);
        } finally {
          await staff.call(`tickets/${ticket.id}`, "PUT", { client_id: originalClientId });
        }
      });
    } finally {
      await mk.dispose();
    }
  });

  // লগআউটের পর ব্রাউজারে Back দিলেও টিকিটের তালিকা ফিরে আসে না কি না দেখি।
  test("ST-A05 Ticket list after logout: keep it inaccessible after browser back", async ({ page, staff }) => {
    await withOwnedTicket(staff, async (ticket) => {
      await page.goto("/tickets");
      await expect(page.getByText(ticket.ticket_code, { exact: true })).toBeVisible();
      await page.getByRole("button", { name: /user menu/i }).click();
      await page.getByText("Sign out", { exact: true }).click();
      await expect(page).toHaveURL(/\/admin$/);
      await expect(page.locator("#username")).toBeVisible();

      await page.goBack();
      await expect(page.locator("#username")).toBeVisible();
      await expect(page.getByText(ticket.ticket_code, { exact: true })).toHaveCount(0);

      await page.reload();
      await expect(page.locator("#username")).toBeVisible();
      await expect(page.getByText(ticket.message, { exact: true })).toHaveCount(0);
    });
  });
});
