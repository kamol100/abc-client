import {
  connection,
  expect,
  networkRow,
  openNetworks,
  test,
} from "@/tests/e2e/networks/fixtures";

test("NW-C01 each visible row shows its own connection label beside its operational status", async ({ page, staff }) => {
  const listed = await openNetworks(page, staff);
  expect(listed.data.length).toBeGreaterThan(1);
  for (const network of listed.data) {
    const probe = await connection(staff, network);
    const label = probe.message === "connected" ? "Connected" : "Disconnected";
    const row = networkRow(page, network);
    await expect(row.getByText(label, { exact: true })).toBeVisible();
    await expect(row.getByText(Number(network.status ?? 0) === 1 ? "Active" : "Inactive", { exact: true })).toBeVisible();
    for (const other of listed.data) {
      if (other.id === network.id) continue;
      await expect(row.getByRole("cell", { name: other.name, exact: true })).toHaveCount(0);
    }
  }
});
