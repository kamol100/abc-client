import { randomUUID } from "node:crypto";
import { test, expect, createForm, select, invoices, sample, detail } from "@/tests/e2e/invoices/fixtures";

const invalidCases = [
  ["client", "Client is required"], ["type", "Invoice type is required"],
  ["description", "Description is required"], ["zero amount", "Amount must be greater than 0"],
  ["negative amount", "Amount must be greater than 0"], ["zero quantity", "Quantity must be at least 1"],
] as const;
for (const [field, error] of invalidCases) {
  test(`IV-F02 invalid ${field} blocks create and preserves recoverable input`, async ({ page, staff }) => {
    const before = await invoices(staff);
    const marker = `E2E invalid invoice ${randomUUID()}`;
    await createForm(page, staff);
    // Required client/type remain unset, ensuring no valid invoice can be submitted.
    await page.locator("#note").fill(marker);
    if (field !== "description") await page.locator('[id="lines.0.description"]').fill(marker);
    if (field === "negative amount") await page.locator('[id="lines.0.amount"]').fill("-1");
    if (field === "zero quantity") await page.locator('[id="lines.0.quantity"]').fill("0");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(error, { exact: true })).toBeVisible();
    await expect(page).toHaveURL(`${staff.baseURL}/invoices/create`);
    await expect(page.locator("#note")).toHaveValue(marker);
    const after = await invoices(staff);
    expect(after.pagination.total).toBe(before.pagination.total);
    expect(after.data.map(i => i.id)).toEqual(before.data.map(i => i.id));
  });
}

test("IV-F03 adding and removing unsaved lines preserves retained values and quantity totals", async ({ page, staff }) => {
  await createForm(page, staff);
  await page.locator('[id="lines.0.description"]').fill("E2E retained line");
  await page.locator('[id="lines.0.amount"]').fill("100");
  await page.locator('[id="lines.0.quantity"]').fill("2");
  await expect(page.locator('[id="lines.0.total_amount"]')).toHaveValue("200");
  await page.getByRole("button", { name: "Add Line", exact: true }).click();
  await page.locator('[id="lines.1.description"]').fill("E2E removed line");
  const removable = page.locator("div.rounded-md.border.p-3").filter({ has: page.locator('[id="lines.1.description"]') });
  await removable.getByRole("button", { name: "Remove", exact: true }).filter({ visible: true }).click();
  await expect(page.locator('[id="lines.1.description"]')).toHaveCount(0);
  await expect(page.locator('[id="lines.0.description"]')).toHaveValue("E2E retained line");
  await expect(page.locator('[id="lines.0.total_amount"]')).toHaveValue("200");
});

test("IV-F04 create defaults to due today no SMS and cancelling creates no invoice", async ({ page, staff }) => {
  const before = await invoices(staff);
  await createForm(page, staff);
  await expect(page.locator('[id="lines.0.quantity"]')).toHaveValue("1");
  await expect(page.getByRole("radio", { name: "No", exact: true })).toBeChecked();
  await expect(page.locator("#react-select-status-input").locator("..").locator("..")).toContainText("Due");
  await expect(page.locator("#react-select-fund_id-input")).toHaveCount(0);
  await expect(page.locator("#partial_amount")).toHaveCount(0);
  const today = await page.evaluate(() => new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date()));
  // Actual date widget formatting is asserted independently of application helpers.
  const dateButtons = page.getByRole("button").filter({ hasText: today });
  await expect(dateButtons).toHaveCount(2);
  await page.locator("#note").fill(`E2E cancelled ${randomUUID()}`);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(`${staff.baseURL}/invoices`);
  expect((await invoices(staff)).pagination.total).toBe(before.pagination.total);
});

for (const [status, label] of [["paid", "Paid"], ["partial_paid", "Partial Paid"]] as const) {
  test(`IV-F07 ${status} requires payment fields and switching due hides them`, async ({ page, staff }) => {
    await createForm(page, staff);
    await select(page, "status", label);
    await expect(page.locator("#react-select-fund_id-input")).toBeVisible();
    if (status === "partial_paid") await expect(page.locator("#partial_amount")).toBeVisible();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Payment method is required", { exact: true })).toBeVisible();
    if (status === "partial_paid") await expect(page.getByText("Amount must be greater than 0", { exact: true })).toHaveCount(2);
    await select(page, "status", "Due");
    await expect(page.locator("#react-select-fund_id-input")).toHaveCount(0);
    await expect(page.locator("#partial_amount")).toHaveCount(0);
    await expect(page).toHaveURL(`${staff.baseURL}/invoices/create`);
  });
}

test("IV-F08 due edit hydrates saved description quantity and note without saving", async ({ page, staff }) => {
  const item = await sample(staff, "due");
  const saved = await detail(staff, item.id);
  if (!saved.lines?.length) throw new Error("Due invoice fixture needs at least one persisted line.");
  await page.goto(`/invoices/edit/${item.id}`);
  for (const [index, line] of saved.lines.entries()) {
    await expect(page.locator(`[id="lines.${index}.description"]`)).toHaveValue(line.description);
    await expect(page.locator(`[id="lines.${index}.quantity"]`)).toHaveValue(String(line.quantity));
    await expect(page.locator(`[id="lines.${index}.amount"]`)).toHaveValue(String(line.amount));
  }
  await expect(page.locator("#note")).toHaveValue(saved.note ?? "");
});

test("IV-F10 cancelling edited note preserves persisted invoice identity and financial fields", async ({ page, staff }) => {
  const item = await sample(staff, "due");
  const before = await detail(staff, item.id);
  await page.goto(`/invoices/edit/${item.id}`);
  await expect(page.locator("#note")).toHaveValue(before.note ?? "");
  await page.locator("#note").fill(`E2E cancelled edit ${randomUUID()}`);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(`${staff.baseURL}/invoices`);
  expect(await detail(staff, item.id)).toEqual(before);
});

test("IV-F11 oversized UTF-8 note is rejected with input preserved", async ({ page, staff }) => {
  await createForm(page, staff);
  const note = "আ".repeat(21_846); // 65,538 bytes; independent UTF-8 boundary.
  expect(Buffer.byteLength(note, "utf8")).toBeGreaterThan(65_535);
  await page.locator("#note").fill(note);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Note cannot exceed 65,535 bytes", { exact: true })).toBeVisible();
  await expect(page.locator("#note")).toHaveValue(note);
  await expect(page).toHaveURL(`${staff.baseURL}/invoices/create`);
});
