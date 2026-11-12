import { randomUUID } from "node:crypto";
import { expect, test, ticketRow, withOwnedTicket } from "@/tests/e2e/support-tickets/fixtures";

test.describe("support ticket conversation", () => {
  test("ST-C01 view opens the selected UUID and back returns to the list", async ({ page, staff }) => {
    await withOwnedTicket(staff, async (ticket) => {
      await page.goto("/tickets");
      await ticketRow(page, ticket.ticket_code).getByRole("link", { name: "View", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/tickets/view/${ticket.id}$`));
      await expect(page.getByRole("heading", { name: `Ticket ${ticket.ticket_code}` })).toBeVisible();
      await expect(page.getByText(ticket.message, { exact: true })).toBeVisible();
      await expect(page.getByText(ticket.client?.name ?? "—", { exact: true })).toBeVisible();
      await expect(page.getByText(ticket.subject?.name ?? "—", { exact: true })).toBeVisible();
      await expect(page.getByText("Not Assigned", { exact: true })).toBeVisible();
      await expect(page.getByText("open", { exact: true })).toBeVisible();
      await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();

      await page.getByRole("link", { name: "Back to Tickets", exact: true }).click();
      await expect(page).toHaveURL(/\/tickets$/);
      await expect(page.getByText(ticket.ticket_code, { exact: true })).toBeVisible();
    });
  });

  test("ST-C02 a staff reply is stored once and remains after reload", async ({ page, staff }) => {
    await withOwnedTicket(staff, async (ticket) => {
      const reply = `E2E reply ${randomUUID()}`;
      await page.goto(`/tickets/view/${ticket.id}`);
      const composer = page.getByPlaceholder("Type your reply here...");
      await composer.fill(reply);
      await page.getByRole("button", { name: "Send Reply", exact: true }).click();

      await expect(composer).toHaveValue("");
      await expect(page.getByText(reply, { exact: true })).toHaveCount(1);
      await expect(page.getByText("Replies (1)", { exact: true })).toBeVisible();

      const stored = await staff.messages(ticket.id);
      const matches = stored.filter((row) => row.message === reply);
      expect(matches).toHaveLength(1);
      const author = matches[0].staff?.name ?? matches[0].client?.name ?? "—";
      await expect(page.getByText(author, { exact: true }).first()).toBeVisible();
      if (matches[0].created_at) {
        await expect(page.getByText(matches[0].created_at, { exact: true })).toBeVisible();
      }

      await page.reload();
      await expect(page.getByText(reply, { exact: true })).toHaveCount(1);
      await expect(page.getByText(ticket.message, { exact: true })).toBeVisible();
      const reread = await staff.messages(ticket.id);
      expect(reread.filter((row) => row.message === reply)).toHaveLength(1);
    });
  });

  test("ST-C03 an empty reply is rejected and adds no message", async ({ page, staff }) => {
    await withOwnedTicket(staff, async (ticket) => {
      await page.goto(`/tickets/view/${ticket.id}`);
      const composer = page.getByPlaceholder("Type your reply here...");
      await composer.fill("kept draft");
      await composer.fill("");
      await page.getByRole("button", { name: "Send Reply", exact: true }).click();

      await expect(page.getByText("Reply message is required", { exact: true })).toBeVisible();
      await expect(page.getByText("Reply sent successfully")).toHaveCount(0);
      await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();
      await expect(page.getByText("Replies (0)", { exact: true })).toBeVisible();
      expect(await staff.messages(ticket.id)).toHaveLength(0);
    });
  });
});
