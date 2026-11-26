import { randomUUID } from "node:crypto";
import {
  chooseDropdown,
  deleteTicket,
  expect,
  namedList,
  requirePermissions,
  test,
  uniqueNamed,
} from "@/tests/e2e/support-tickets/fixtures";

test.describe("support ticket create", () => {
  // নতুন টিকিটে Medium ও Open ডিফল্ট থাকে এবং সেভের পর বিস্তারিত রিলোডেও থাকে কি না দেখি।
  test("ST-F01 Create support ticket: use Medium/Open defaults and keep the saved details after reload", async ({ page, staff }) => {
    requirePermissions(staff, "tickets.create", "tickets.show", "tickets.delete");
    const client = uniqueNamed(namedList(await staff.get("dropdown-clients")), "client");
    const subject = uniqueNamed(namedList(await staff.get("dropdown-subjects")), "subject");
    const message = `E2E ticket ${randomUUID()}`;
    let ticketId: string | undefined;

    try {
      await page.goto("/tickets");
      await page.getByRole("button", { name: "Add", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Create Ticket" });
      await expect(dialog).toBeVisible();
      await chooseDropdown(page, "client_id", client.name);
      await chooseDropdown(page, "subject_id", subject.name);
      await dialog.locator("#message").fill(message);
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog).toBeHidden();

      let ticketCode = "";
      await expect.poll(async () => {
        const matches = (await staff.tickets()).data.filter((row) => row.message === message);
        if (matches.length !== 1) return matches.length;
        ticketId = matches[0].id;
        ticketCode = matches[0].ticket_code;
        expect(matches[0].priority).toBe("medium");
        expect(matches[0].status).toBe("open");
        expect(matches[0].subject?.name).toBe(subject.name);
        expect(matches[0].staff ?? null).toBeNull();
        return matches.length;
      }).toBe(1);
      if (!ticketId) throw new Error("Created ticket UUID was not returned.");

      await page.goto(`/tickets/view/${ticketId}`);
      await expect(page.getByRole("heading", { name: `Ticket ${ticketCode}` })).toBeVisible();
      await expect(page.getByText(message, { exact: true })).toBeVisible();
      await expect(page.getByText("medium", { exact: true })).toBeVisible();
      await expect(page.getByText("open", { exact: true })).toBeVisible();
      await expect(page.getByText("Not Assigned", { exact: true })).toBeVisible();
      await expect(page.getByText(subject.name, { exact: true })).toBeVisible();

      const detail = await staff.ticket(ticketId);
      expect(detail.id).toBe(ticketId);
      expect(detail.client?.name).toBeTruthy();
      await expect(page.getByText(detail.client?.name ?? "", { exact: true })).toBeVisible();

      await page.reload();
      await expect(page.getByRole("heading", { name: `Ticket ${ticketCode}` })).toBeVisible();
      await expect(page.getByText(message, { exact: true })).toBeVisible();
      const reread = await staff.ticket(ticketId);
      expect(reread.message).toBe(message);
      expect(reread.priority).toBe("medium");
      expect(reread.status).toBe("open");
      expect(reread.client?.id).toBe(detail.client?.id);
      expect(reread.subject?.id).toBe(detail.subject?.id);
    } finally {
      if (ticketId) await deleteTicket(staff, ticketId);
    }
  });

  // ক্লায়েন্ট না দিলে বা ছোট বার্তায় ত্রুটি দেখায় এবং টিকিট তৈরি হয় না কি না দেখি।
  test("ST-F03 Invalid support ticket: reject a missing client or short message without saving", async ({ page, staff }) => {
    requirePermissions(staff, "tickets.access", "tickets.create");
    const before = await staff.tickets();
    const marker = `E2E ticket ${randomUUID()}`;
    const subject = uniqueNamed(namedList(await staff.get("dropdown-subjects")), "subject");

    await page.goto("/tickets");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Create Ticket" });
    await chooseDropdown(page, "subject_id", subject.name);
    await dialog.locator("#message").fill("x");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Client is required", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Message must be at least 2 characters", { exact: true })).toBeVisible();

    await dialog.locator("#message").fill("");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Message must be at least 2 characters", { exact: true })).toBeVisible();
    await expect(dialog.getByText(marker)).toHaveCount(0);

    const after = await staff.tickets();
    expect(after.pagination.total).toBe(before.pagination.total);
    expect(after.data.some((row) => row.message === marker)).toBe(false);
  });
});
