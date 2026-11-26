import { z } from "zod";
import {
  expect,
  requirePermissions,
  resellerDetail,
  resellerRow,
  resellers,
  sample,
  test,
} from "@/tests/e2e/resellers/fixtures";

const ClientPageSchema = z.object({
  data: z.array(z.object({ name: z.string().nullable().optional() }).passthrough()),
  pagination: z.object({ total: z.coerce.number() }).passthrough(),
});

// নির্বাচিত রিসেলারের বিস্তারিত ও এডিট একই অ্যাকাউন্টের হয় কি না যাচাই করি।
test("RS-P01 Reseller details: open the selected reseller and edit the same account", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.show", "resellers.edit");
  const reseller = await sample(staff);
  await page.goto("/resellers");
  await resellerRow(page, reseller).getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "View" }).click();
  await expect(page).toHaveURL(new RegExp(`/resellers/view/${reseller.id}$`));
  await expect(page.getByRole("heading", { name: "Reseller Details" })).toBeVisible();
  await expect(page.getByText(reseller.name, { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profile Information" })).toBeVisible();
  const detail = await resellerDetail(staff, reseller.id);
  if (detail.user?.username) {
    await expect(page.getByText(detail.user.username, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Edit" })).toHaveAttribute("href", `/resellers/edit/${reseller.id}`);
  await page.getByRole("button", { name: "Package", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Package Information" })).toBeVisible();
  await page.getByRole("heading", { name: "Reseller Details" }).locator("..").locator('a[href="/resellers"]').click();
  await expect(page).toHaveURL(/\/resellers$/);
  await expect(resellerRow(page, reseller)).toBeVisible();
});

// ক্লায়েন্ট ট্যাবে সঠিক রিসেলারের তথ্য আসে এবং রিসেলার বদলালে পুরোনো তথ্য সরে যায় কি না দেখি।
test("RS-P04 Reseller clients tab: show that reseller's clients and replace them when switching resellers", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.show", "resellers.client");
  const listed = await resellers(staff);
  const rows = listed.pagination.total_pages > 1
    ? listed.data.concat((await resellers(staff, "page=2")).data)
    : listed.data;
  const first = rows[0];
  const second = rows.find((row) => row.id !== first?.id);
  if (!first) throw new Error("Client tab checks need a visible reseller.");
  const firstClients = ClientPageSchema.parse(await staff.get(`resellers/client/${first.id}`));
  await page.goto(`/resellers/view/${first.id}`);
  await page.getByRole("button", { name: "Client", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Client Information" })).toBeVisible();
  if (firstClients.pagination.total === 0) {
    await expect(page.getByText("No results", { exact: true })).toBeVisible();
  }
  for (const client of firstClients.data) {
    if (client.name) await expect(page.getByText(client.name, { exact: true }).first()).toBeVisible();
  }
  if (!second) return;
  const secondClients = ClientPageSchema.parse(await staff.get(`resellers/client/${second.id}`));
  const exclusive = firstClients.data.find((client) => (
    client.name && !secondClients.data.some((other) => other.name === client.name)
  ));
  await page.goto(`/resellers/view/${second.id}`);
  await expect(page.getByRole("heading", { name: "Reseller Details" })).toBeVisible();
  await expect(page.getByText(second.name, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Client", exact: true }).click();
  for (const client of secondClients.data) {
    if (client.name) await expect(page.getByText(client.name, { exact: true }).first()).toBeVisible();
  }
  if (exclusive?.name) await expect(page.getByText(exclusive.name, { exact: true })).toHaveCount(0);
});

// নির্বাচিত রিসেলারের প্যাকেজ ও প্রোফাইল ট্যাব ব্যবহার করা যায় কি না দেখি।
test("RS-P05 Reseller detail tabs: keep package and profile information available for the selected reseller", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.show");
  const reseller = await resellerDetail(staff, (await sample(staff)).id);
  await page.goto(`/resellers/view/${reseller.id}`);
  await expect(page.getByRole("heading", { name: "Profile Information" })).toBeVisible();
  await page.getByRole("button", { name: "Package", exact: true }).click();
  const packages = reseller.package ?? [];
  if (!packages.length) {
    await expect(page.getByText("No reseller package found.", { exact: true })).toBeVisible();
  } else {
    for (const item of packages) {
      if (item.name) await expect(page.getByText(item.name, { exact: true }).first()).toBeVisible();
    }
  }
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Profile Information" })).toBeVisible();
  await expect(page.getByText(reseller.name, { exact: true }).first()).toBeVisible();
});
