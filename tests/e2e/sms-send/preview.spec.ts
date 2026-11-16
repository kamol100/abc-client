import type { Page } from "@playwright/test";
import type { Session } from "@/tests/e2e/clients/fixtures";
import {
  cancelDialog,
  clientQuery,
  clientRow,
  confirmDialog,
  countText,
  dialogMetric,
  expect,
  expectDialogQuote,
  expectMoney,
  formMetric,
  listTemplate,
  moneyText,
  openClientList,
  openSmsPage,
  PREVIEW_BODY,
  PREVIEW_PHONE,
  selectTemplate,
  sendButton,
  singleSmsPrice,
  smsClients,
  smsRate,
  smsTemplateDetail,
  smsTemplates,
  smsUnits,
  test,
  uniqueTemplate,
  unsupportedTemplate,
  walletAvailable,
} from "@/tests/e2e/sms-send/fixtures";

async function singleDraft(page: Page, staff: Session) {
  const template = uniqueTemplate(await smsTemplates(staff), "custom_other");
  const rate = await smsRate(staff);
  const balance = await walletAvailable(staff);
  await openSmsPage(page);
  await selectTemplate(page, template);
  const detail = await smsTemplateDetail(staff, template.id);
  await expect(page.locator("#sms_body")).toHaveValue(detail.message ?? "");
  await expect(page.locator("#phone")).toBeVisible();
  await page.locator("#phone").fill(PREVIEW_PHONE);
  await page.locator("#sms_body").fill(PREVIEW_BODY);
  return { rate, balance, price: singleSmsPrice(PREVIEW_BODY, rate, balance) };
}

test("FT087-01 a live preview shows one recipient, the message units, and the wallet price", async ({ page, staff }) => {
  const before = await walletAvailable(staff);
  const { price } = await singleDraft(page, staff);
  expect(smsUnits(PREVIEW_BODY)).toBe(1);
  await sendButton(page).click();
  const dialog = confirmDialog(page);
  await expect(dialog.getByText("SMS will be sent through your SMS gateway and the cost will be deducted from your wallet.", { exact: true })).toBeVisible();
  await expectDialogQuote(dialog, price);
  if (price.sufficient && price.remaining_balance !== null) {
    await expect(dialogMetric(dialog, "Remaining balance")).toHaveText(moneyText(price.remaining_balance));
    await expect(dialog.getByRole("button", { name: "Confirm & Send SMS", exact: true })).toBeEnabled();
  }
  await expect(dialog.getByLabel("Send immediately")).toHaveCount(0);
  await cancelDialog(page);
  expectMoney(await walletAvailable(staff), before);
});

test("FT087-01 test mode shows the same price as not charged and does not change the wallet", async ({ page, staff }) => {
  const before = await walletAvailable(staff);
  const { price } = await singleDraft(page, staff);
  await page.getByRole("radio", { name: "Test Mode", exact: true }).check();
  await expect(formMetric(page, "Total cost")).toHaveText(moneyText(price.total_cost));
  await expect(page.getByText("Not charged", { exact: true }).first()).toBeVisible();
  await sendButton(page, "test").click();
  const dialog = confirmDialog(page, "test");
  await expect(dialog.getByText("Test mode", { exact: true })).toBeVisible();
  await expect(dialog.getByText("The sending flow will be simulated. The SMS gateway will not be called and no SMS charge will be deducted.", { exact: true })).toBeVisible();
  await expectDialogQuote(dialog, price);
  await expect(dialog.getByText("Not charged", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Confirm & Simulate", exact: true })).toBeEnabled();
  await cancelDialog(page, "test");
  expectMoney(await walletAvailable(staff), before);
});

test("FT087-02 selected clients are quoted and an unselected client is not added", async ({ page, staff }) => {
  const template = uniqueTemplate(await smsTemplates(staff), "custom_client");
  const listed = await smsClients(staff, clientQuery(template));
  if (listed.pagination.total < 2 || listed.data.length < 2) {
    throw new Error("Recipient exclusion needs two SMS clients on the first page.");
  }
  const selected = listed.data.slice(0, listed.data.length > 2 ? 2 : 1);
  const unselected = listed.data.find((row) => selected.every((item) => item.cid !== row.cid));
  if (!unselected) throw new Error("Recipient exclusion needs a visible client that stays unselected.");
  const before = await walletAvailable(staff);
  await openClientList(page, staff, template);
  await page.locator("#sms_body").fill(PREVIEW_BODY);
  for (const client of selected) {
    await clientRow(page, client).getByRole("checkbox", { name: "Select row" }).check();
  }
  await expect(clientRow(page, unselected).getByRole("checkbox", { name: "Select row" })).not.toBeChecked();
  await expect(formMetric(page, "Total SMS")).toHaveText(countText(selected.length));
  await sendButton(page).click();
  const dialog = confirmDialog(page);
  const units = selected.length * smsUnits(PREVIEW_BODY);
  await expect(dialogMetric(dialog, "Recipients")).toHaveText(countText(selected.length));
  await expect(dialogMetric(dialog, "Total SMS")).toHaveText(countText(units));
  await cancelDialog(page);
  expectMoney(await walletAvailable(staff), before);
});

function shortageMessage(rate: number, balance: number): string | undefined {
  if (rate <= 0 || balance < 0) return undefined;
  const units = Math.floor(balance / rate) + 1;
  const length = units <= 1 ? 1 : 160 + (units - 1) * 153;
  if (length > 4_000) return undefined;
  return "a".repeat(length);
}

test("FT087-03 preview price matches the rate and an unaffordable message cannot be confirmed", async ({ page, staff }) => {
  const before = await walletAvailable(staff);
  const { rate, balance, price } = await singleDraft(page, staff);
  await sendButton(page).click();
  const dialog = confirmDialog(page);
  await expectDialogQuote(dialog, price);
  if (!price.sufficient) {
    await expect(dialog.getByRole("alert")).toContainText("Insufficient wallet balance");
    await expect(dialog.getByRole("button", { name: "Confirm & Send SMS", exact: true })).toBeDisabled();
    await cancelDialog(page);
    expectMoney(await walletAvailable(staff), before);
    return;
  }
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await cancelDialog(page);
  const longer = balance === null ? undefined : shortageMessage(rate, balance);
  if (!longer) {
    expectMoney(await walletAvailable(staff), before);
    return;
  }
  const expensive = singleSmsPrice(longer, rate, balance);
  expect(expensive.sufficient).toBe(false);
  await page.locator("#sms_body").fill(longer);
  await sendButton(page).click();
  const shortage = confirmDialog(page);
  await expectDialogQuote(shortage, expensive);
  await expect(shortage.getByRole("alert")).toContainText("Insufficient wallet balance");
  await expect(shortage.getByRole("button", { name: "Confirm & Send SMS", exact: true })).toBeDisabled();
  await cancelDialog(page);
  expectMoney(await walletAvailable(staff), before);
});

test("FT087-08 an empty body stays on the form and a one-character body can open the quote", async ({ page, staff }) => {
  const before = await walletAvailable(staff);
  const template = uniqueTemplate(await smsTemplates(staff), "custom_other");
  await openSmsPage(page);
  await selectTemplate(page, template);
  await page.locator("#phone").fill("   ");
  await expect(sendButton(page)).toBeDisabled();
  await page.keyboard.press("Escape");
  await sendButton(page).locator("xpath=..").hover();
  await expect(page.getByRole("tooltip")).toHaveText("SMS count is 0. Add a phone number or select a template with matching clients.");
  await page.locator("#phone").fill(PREVIEW_PHONE);
  await page.locator("#sms_body").fill("   ");
  await sendButton(page).click();
  await expect(page.getByText("SMS body is required", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator("#sms_body").fill("a");
  await expect(page.getByText("SMS body is required", { exact: true })).toHaveCount(0);
  await sendButton(page).click();
  const dialog = confirmDialog(page);
  await expect(dialogMetric(dialog, "Recipients")).toHaveText("1");
  await expect(dialogMetric(dialog, "Total SMS")).toHaveText("1");
  await cancelDialog(page);
  await expect(page.locator("#phone")).toHaveValue(PREVIEW_PHONE);
  await expect(page.locator("#sms_body")).toHaveValue("a");
  expectMoney(await walletAvailable(staff), before);
});

test("FT087-08 a rejected template preview shows the quote error and no success", async ({ page, staff }) => {
  const before = await walletAvailable(staff);
  const rejected = await staff.call("sms-store/preview", "POST", {
    sms_template_id: 0,
    message: "",
    custom_message: "",
    mode: "live",
  });
  expect(rejected.status).toBe(422);
  const stored = await staff.call("sms-store", "POST", {
    sms_template_id: 0,
    message: "",
    custom_message: "",
    mode: "live",
  });
  expect(stored.status).toBe(422);
  expectMoney(await walletAvailable(staff), before);
  const unsupported = unsupportedTemplate(await smsTemplates(staff));
  if (!unsupported) return;
  const listed = await smsClients(staff, clientQuery(unsupported));
  if (!listed.pagination.total) return;
  await openClientList(page, staff, unsupported);
  await page.locator("#sms_body").fill(PREVIEW_BODY);
  await sendButton(page).click();
  const dialog = confirmDialog(page);
  await expect(dialog.getByRole("alert")).toHaveText("Could not calculate the SMS cost. Please try again.");
  await expect(dialog.getByRole("button", { name: "Confirm & Send SMS", exact: true })).toBeDisabled();
  await expect(page.getByText("SMS queued successfully", { exact: true })).toHaveCount(0);
  await cancelDialog(page);
  expectMoney(await walletAvailable(staff), before);
});

test("FT087-12 opening the quote twice does not change the wallet", async ({ page, staff }) => {
  const before = await walletAvailable(staff);
  await singleDraft(page, staff);
  await sendButton(page).click();
  await expect(confirmDialog(page)).toBeVisible();
  await cancelDialog(page);
  await sendButton(page).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await cancelDialog(page);
  expectMoney(await walletAvailable(staff), before);
});
