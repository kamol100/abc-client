import {
  expect,
  formMetric,
  moneyText,
  openSmsPage,
  smsRate,
  test,
} from "@/tests/e2e/sms-send/fixtures";

// SMS পেজে লাইভ মোড ও প্রতি মেসেজের রেট দেখা যায় এবং রিলোডেও রেট একই থাকে কি না দেখি।
test("FT087-04 Send SMS page: show live mode and retain the per-message rate after reload", async ({ page, staff }) => {
  const rate = await smsRate(staff);
  await openSmsPage(page);
  await expect(page.getByRole("radio", { name: "Test Mode", exact: true })).not.toBeChecked();
  await expect(page.getByText("Select an SMS template to send SMS to your clients, or choose Custom Other to send SMS to any phone number.", { exact: true })).toBeVisible();
  await expect(formMetric(page, "Per SMS")).toHaveText(moneyText(rate));
  await expect(page.getByRole("button", { name: "Send SMS", exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Send SMS", exact: true })).toBeVisible();
  await expect(formMetric(page, "Per SMS")).toHaveText(moneyText(await smsRate(staff)));
  await expect(page.getByRole("radio", { name: "Live Mode", exact: true })).toBeChecked();
});
