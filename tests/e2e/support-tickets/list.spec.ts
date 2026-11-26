import { randomUUID } from "node:crypto";
import {
  expect,
  expectTicketRow,
  openTicketFilters,
  requirePermissions,
  test,
  withOwnedTicket,
} from "@/tests/e2e/support-tickets/fixtures";

test.describe("support ticket list", () => {
  // অনুমোদিত টিকিট API অনুযায়ী তালিকায় আসে এবং রিলোডেও সঠিক ফল থাকে কি না দেখি।
  test("ST-L01 Support ticket list: show authorized tickets and retain the expected rows after reload", async ({ page, staff }) => {
    requirePermissions(staff, "tickets.access");
    const listed = await staff.tickets();

    await page.goto("/tickets");
    if (listed.pagination.total === 0) {
      await expect(page.getByText("Tickets", { exact: true })).toBeVisible();
      await expect(page.getByText("No results", { exact: true })).toBeVisible();
    } else {
      await expect(page.getByText(`Tickets (${listed.pagination.total})`, { exact: true })).toBeVisible();
      for (const ticket of listed.data) await expectTicketRow(page, ticket);
    }

    await page.reload();
    const reloaded = await staff.tickets();
    expect(reloaded.pagination.total).toBe(listed.pagination.total);
    expect(reloaded.data.map((ticket) => ticket.ticket_code)).toEqual(
      listed.data.map((ticket) => ticket.ticket_code),
    );
    if (reloaded.pagination.total === 0) {
      await expect(page.getByText("No results", { exact: true })).toBeVisible();
    } else {
      await expect(page.getByText(`Tickets (${reloaded.pagination.total})`, { exact: true })).toBeVisible();
    }
  });

  // না মেলা টিকিট কোডে খালি ফল আসে এবং সার্চ মুছলে নিজের টিকিট ফিরে আসে কি না দেখি।
  test("ST-L04 Search tickets by unknown code: show no results and restore the ticket when cleared", async ({ page, staff }) => {
    await withOwnedTicket(staff, async (ticket) => {
      await page.goto("/tickets");
      await expect(page.getByText(ticket.ticket_code, { exact: true })).toBeVisible();

      await openTicketFilters(page);
      const filter = page.locator("#ticket_id");
      const unmatched = `E2E-NO-MATCH-${randomUUID()}`;
      await filter.fill(unmatched);
      await expect(page.getByText("No results", { exact: true })).toBeVisible();
      await expect(page.getByText(ticket.ticket_code, { exact: true })).toHaveCount(0);
      const filtered = await staff.tickets(`ticket_id=${encodeURIComponent(unmatched)}`);
      expect(filtered.pagination.total).toBe(0);

      await filter.fill("");
      await expect(page.getByText(ticket.ticket_code, { exact: true })).toBeVisible();
      await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
    });
  });
});
