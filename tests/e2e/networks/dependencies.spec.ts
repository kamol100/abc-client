import type { Page } from "@playwright/test";
import { openClientCreate } from "@/tests/e2e/clients/fixtures";
import {
  assertProbeSafe,
  choices,
  deleteButton,
  expect,
  listTitle,
  networkDetail,
  networkRelations,
  networkRow,
  networks,
  openNetworks,
  requirePermissions,
  sameConfig,
  test,
} from "@/tests/e2e/networks/fixtures";

const CLIENT_BOUND = "Please delete the client first!";

test("NW-D01 cancel delete keeps the unused network", async ({ page, staff }) => {
  requirePermissions(staff, "networks.delete", "networks.show", "clients.access");
  const { rows } = await networkRelations(staff);
  const unused = rows.find((row) => row.clients === 0);
  const other = rows.find((row) => row.network.id !== unused?.network.id);
  if (!unused || !other) throw new Error("Delete cancel needs an unused network and another company network.");
  const before = await networkDetail(staff, unused.network.id);
  const otherBefore = await networkDetail(staff, other.network.id);
  await openNetworks(page, staff);
  await deleteButton(networkRow(page, unused.network)).click();
  const dialog = page.getByRole("dialog", { name: "Confirm Delete" });
  await expect(dialog.getByText("Are you sure you want to delete this network?", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(sameConfig(await networkDetail(staff, unused.network.id), before)).toBe(true);
  expect(sameConfig(await networkDetail(staff, other.network.id), otherBefore)).toBe(true);
  await page.reload();
  await expect(networkRow(page, unused.network)).toBeVisible();
});

test("NW-D02 deleting a client-bound network is rejected and the records stay", async ({ page, staff }) => {
  requirePermissions(staff, "networks.delete", "networks.show", "clients.access");
  const { rows } = await networkRelations(staff);
  const bound = rows.find((row) => row.clients > 0);
  if (!bound) throw new Error("Client-bound delete needs a network that still has clients.");
  const before = await networkDetail(staff, bound.network.id);
  const denied = await staff.call(`networks/${bound.network.id}`, "DELETE");
  expect(denied.status).toBe(422);
  expect(JSON.stringify(denied.body ?? {})).toContain(CLIENT_BOUND);
  expect(sameConfig(await networkDetail(staff, bound.network.id), before)).toBe(true);

  const again = await networkRelations(staff);
  const stillBound = again.rows.find((row) => row.network.id === bound.network.id);
  expect(stillBound?.clients).toBe(bound.clients);
  expect(stillBound?.packages.map((item) => item.id).sort()).toEqual(bound.packages.map((item) => item.id).sort());

  await openNetworks(page, staff);
  await deleteButton(networkRow(page, bound.network)).click();
  const dialog = page.getByRole("dialog", { name: "Confirm Delete" });
  await dialog.getByRole("button", { name: "Confirm Delete", exact: true }).click();
  await expect(page.getByText(CLIENT_BOUND, { exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(sameConfig(await networkDetail(staff, bound.network.id), before)).toBe(true);
  await page.reload();
  await expect(networkRow(page, bound.network)).toBeVisible();
});

test("NW-D04 network choices use numeric ids and client and reseller forms list those names", async ({ page, staff }) => {
  requirePermissions(staff, "networks.access", "resellers.create", "clients.create");
  const listed = await networks(staff);
  const options = choices(await staff.get("dropdown-networks"));
  expect(options.length).toBeGreaterThan(0);
  for (const network of listed.data) {
    const option = options.filter((choice) => choice.name === network.name);
    if (option.length !== 1) throw new Error(`Dropdown needs one option for ${network.name}.`);
    const selected = choices(await staff.get(`dropdown-network-packages/${option[0].id}`));
    const byUuid = choices(await staff.get(`dropdown-network-packages/${network.id}`));
    expect(selected.length).toBeGreaterThan(0);
    expect(byUuid.some((choice) => selected.some((known) => known.id === choice.id))).toBe(false);
  }
  const allPackages = choices(await staff.get("dropdown-network-packages"));
  expect(allPackages.length).toBeGreaterThan(choices(await staff.get(`dropdown-network-packages/${options[0].id}`)).length);

  await page.goto("/resellers/create");
  await expect(page.locator("#name")).toBeVisible();
  await expectDropdownNames(page, options.map((option) => option.name));
  await openClientCreate(page);
  await expectDropdownNames(page, options.map((option) => option.name));
});

async function expectDropdownNames(page: Page, names: string[]) {
  await page.locator("#react-select-network_id-input").click();
  for (const name of names) {
    await expect(page.getByRole("option", { name, exact: true })).toBeVisible();
  }
  await page.keyboard.press("Escape");
}

test("NW-R02 mobile width keeps filters create and the connection label reachable", async ({ page, staff }) => {
  const listed = await networks(staff);
  assertProbeSafe(listed.data);
  const network = listed.data[0];
  if (!network) throw new Error("Mobile checks need a visible network.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/networks");
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeHidden();
  await expect(networkRow(page, network)).toBeVisible();
  await expect(page.getByText(Number(network.status ?? 0) === 1 ? "Active" : "Inactive", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Connected", { exact: true }).or(page.getByText("Disconnected", { exact: true })).first()).toBeVisible();
  await expect(page.getByRole("button").filter({ has: page.locator("svg.lucide-plus") })).toBeVisible();
  await page.getByRole("button").filter({ has: page.locator("svg.lucide-funnel") }).click();
  const name = page.locator("#name");
  await expect(name).toBeVisible();
  await name.focus();
  await expect(name).toBeFocused();
  await page.keyboard.type("ab");
  await expect(name).toHaveValue("ab");
  await name.fill("");
  await page.getByRole("dialog", { name: "Filter" }).getByRole("button", { name: "Close", exact: true }).click();
  await expect(networkRow(page, network)).toBeVisible();
});
