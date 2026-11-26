import {
  expect,
  openSmsPage,
  PREVIEW_BODY,
  PREVIEW_PHONE,
  selectTemplate,
  sendButton,
  smsTemplateDetail,
  smsTemplates,
  test,
  uniqueTemplate,
} from "@/tests/e2e/sms-send/fixtures";

// টেমপ্লেটের সংরক্ষিত বার্তা আসে এবং কোট বাতিল করলেও খসড়া থাকে কি না দেখি।
test("FT087-07 SMS template: load the saved message and retain the draft when cancelling the quote", async ({ page, staff }) => {
  const template = uniqueTemplate(await smsTemplates(staff), "custom_other");
  const detail = await smsTemplateDetail(staff, template.id);
  await page.goto(`/sms-send?phone=${PREVIEW_PHONE}`);
  await expect(page.getByRole("heading", { name: "Send SMS", exact: true })).toBeVisible();
  await selectTemplate(page, template);
  await expect(page.locator("#sms_body")).toHaveValue(detail.message ?? "");
  await expect(page.locator("#phone")).toHaveValue(PREVIEW_PHONE);
  await page.locator("#sms_body").fill(PREVIEW_BODY);
  await sendButton(page).click();
  await page.getByRole("dialog", { name: "Confirm SMS sending" }).getByRole("button", { name: /^cancel$/i }).click();
  await expect(page.locator("#sms_body")).toHaveValue(PREVIEW_BODY);
  await expect(page.locator("#phone")).toHaveValue(PREVIEW_PHONE);
  await page.reload();
  await expect(page.locator("#sms_body")).toHaveValue("");
  await expect(page.getByRole("heading", { name: "Send SMS", exact: true })).toBeVisible();
});

// মোবাইলে কিবোর্ড, বাংলা ও ডার্ক থিমে SMS ফর্ম ব্যবহারযোগ্য থাকে কি না দেখি।
test("FT087-13 Send SMS on mobile: support keyboard use, Bangla, and dark theme", async ({ page, staff }) => {
  const template = uniqueTemplate(await smsTemplates(staff), "custom_other");
  const detail = await smsTemplateDetail(staff, template.id);
  await page.setViewportSize({ width: 390, height: 844 });
  await openSmsPage(page);
  await expect(page.getByRole("radio", { name: "Live Mode", exact: true })).toBeVisible();
  await expect(sendButton(page)).toBeVisible();
  await page.getByRole("radio", { name: "Bangla", exact: true }).click();
  await expect(page.getByRole("heading", { name: "এসএমএস পাঠান", exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "লাইভ মোড", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Send SMS", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("button", { name: "Customize theme", exact: true }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("heading", { name: "Send SMS", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("heading", { name: "Send SMS", exact: true })).toBeVisible();
  await selectTemplate(page, template);
  await expect(page.locator("#sms_body")).toHaveValue(detail.message ?? "");
  await expect(page.locator("#phone")).toBeEditable();
  await page.locator("#phone").fill(PREVIEW_PHONE);
  await page.locator("#sms_body").fill(PREVIEW_BODY);
  await expect(page.locator("#phone")).toHaveValue(PREVIEW_PHONE);
  await expect(page.locator("#sms_body")).toHaveValue(PREVIEW_BODY);
  await expect(sendButton(page)).toBeEnabled();
  await sendButton(page).focus();
  await expect(sendButton(page)).toBeFocused();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Confirm SMS sending" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /^cancel$/i }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("SMS queued successfully", { exact: true })).toHaveCount(0);
});
