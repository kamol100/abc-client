# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flows\zones-crud.spec.ts >> Zones end-to-end CRUD flow >> navigates from sidebar and performs create, edit, delete
- Location: tests\e2e\flows\zones-crud.spec.ts:25:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('[role=\'dialog\']').last()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[role=\'dialog\']').last()
    8 × locator resolved to <div tabindex="-1" role="dialog" aria-modal="true" data-has-footer="true" data-nextjs-dialog="true" class="error-overlay-dialog-scroll" data-nextjs-scrollable-content="true" aria-labelledby="nextjs__container_errors_label" aria-describedby="nextjs__container_errors_desc">…</div>
      - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open issues overlay" [ref=e7]:
      - img [ref=e9]
      - generic [ref=e11]:
        - generic [ref=e12]: "1"
        - generic [ref=e13]: "2"
      - generic [ref=e14]:
        - text: Issue
        - generic [ref=e15]: s
    - button "Collapse issues badge" [ref=e16]:
      - img [ref=e17]
  - list
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - list:
              - listitem:
                - button:
                  - generic:
                    - generic:
                      - generic:
                        - img
                      - generic:
                        - generic: ISP Provider
                  - img
          - generic:
            - generic:
              - generic: Menu
              - list:
                - listitem:
                  - link:
                    - /url: /dashboard
                    - generic:
                      - img
                    - generic: Dashboard
                - listitem:
                  - link:
                    - /url: /clients
                    - generic:
                      - img
                    - generic: Clients
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Reports
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Maps
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Invoice
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Payments
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Products
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Expense
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Support Tickets
                    - img
                - listitem:
                  - link:
                    - /url: /resellers
                    - generic:
                      - img
                    - generic: Resellers
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Communication
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: SMS
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Networks
                    - img
                - listitem:
                  - link:
                    - /url: /mikrotik-commands
                    - generic:
                      - img
                    - generic: Mikrotik Commands
                - listitem:
                  - link:
                    - /url: /activity-logs
                    - generic:
                      - img
                    - generic: Activity Logs
                - listitem:
                  - link:
                    - /url: /histories
                    - generic:
                      - img
                    - generic: History
                - listitem:
                  - button [expanded]:
                    - generic:
                      - img
                    - generic: Zones
                    - img
                  - generic:
                    - list:
                      - listitem:
                        - link:
                          - /url: /zones
                          - generic: Zones
                      - listitem:
                        - link:
                          - /url: /sub-zones
                          - generic: Sub Zones
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Packages
                    - img
                - listitem:
                  - link:
                    - /url: /vendors
                    - generic:
                      - img
                    - generic: Vendors
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Funds
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Staffs
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Wallets
                    - img
                - listitem:
                  - link:
                    - /url: /users
                    - generic:
                      - img
                    - generic: Users
                - listitem:
                  - link:
                    - /url: /companies
                    - generic:
                      - img
                    - generic: Companies
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Mikrotik Sync
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Role & Permission
                    - img
                - listitem:
                  - button:
                    - generic:
                      - img
                    - generic: Settings
                    - img
          - generic:
            - list:
              - listitem:
                - button:
                  - generic:
                    - generic: SA
                  - generic:
                    - generic: Super Admin
                    - generic: superadmin@isp-provider.com
                  - img
          - button
    - main:
      - generic:
        - generic:
          - generic:
            - button:
              - img
              - generic: Toggle Sidebar
            - navigation:
              - list:
                - listitem:
                  - link:
                    - /url: /dashboard
                    - text: Dashboard
                - listitem:
                  - img
                - listitem:
                  - link [disabled]: Zones
          - generic:
            - group:
              - radio [checked]: EN
              - radio: বাং
            - button:
              - img
            - button:
              - generic: User menu
              - generic:
                - generic: SA
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic: Zones (19)
                - generic:
                  - button:
                    - img
                  - button:
                    - img
                  - button [expanded]:
                    - img
                    - generic: Add
            - generic:
              - generic:
                - table:
                  - rowgroup:
                    - row:
                      - columnheader:
                        - generic: Zone Name
                      - columnheader:
                        - generic:
                          - button:
                            - generic: Zone Name (Bangla)
                            - img
                      - columnheader:
                        - generic: Sub Zones
                      - columnheader:
                        - generic: Actions
                  - rowgroup:
                    - row:
                      - cell:
                        - generic: zone-e2e-1776007279017
                      - cell
                      - cell
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 5 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 6 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 13 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 20 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 10 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 1 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 12 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 4 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
                    - row:
                      - cell:
                        - generic: Area 18 (direct)
                      - cell
                      - cell:
                        - generic: Seeded — Main
                      - cell:
                        - generic:
                          - button:
                            - img
                          - button:
                            - img
            - generic:
              - generic:
                - generic:
                  - combobox:
                    - generic: 10 / page
                    - img
                - generic:
                  - navigation:
                    - list:
                      - listitem:
                        - button [disabled]:
                          - img
                      - listitem:
                        - button [disabled]:
                          - img
                      - listitem:
                        - button: "1"
                      - listitem:
                        - button: "2"
                      - listitem:
                        - button:
                          - img
                      - listitem:
                        - button:
                          - img
  - region "Notifications Alt+T"
  - alert
  - dialog "Add zone" [ref=e20]:
    - heading "Add zone" [level=2] [ref=e22]
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e27]:
          - generic [ref=e29]:
            - generic [ref=e30]: Zone Name
            - generic [ref=e31]: "*"
          - textbox "Enter the name of the zone" [active] [ref=e32]
        - generic [ref=e34]:
          - generic [ref=e37]: Latitude
          - spinbutton [ref=e38]
        - generic [ref=e40]:
          - generic [ref=e43]: Longitude
          - spinbutton [ref=e44]
      - generic [ref=e45]:
        - button "Cancel" [ref=e46] [cursor=pointer]:
          - img
          - generic [ref=e47]: Cancel
        - button "Save" [ref=e48] [cursor=pointer]:
          - img
          - generic [ref=e49]: Save
    - button "Close" [ref=e50] [cursor=pointer]:
      - img [ref=e51]
      - generic [ref=e54]: Close
```

# Test source

```ts
  1   | import { expect, type APIRequestContext, type Page } from "@playwright/test";
  2   | 
  3   | import { backendBaseUrl, getBackendAccessToken } from "@/tests/e2e/helpers/auth";
  4   | import { navigateToSidebarSubmenu } from "@/tests/e2e/helpers/sidebar";
  5   | 
  6   | type ZoneFormInput = {
  7   |   name: string;
  8   |   lat: string;
  9   |   lon: string;
  10  | };
  11  | 
  12  | function zoneRowLocator(page: Page, zoneName: string) {
  13  |   return page.locator("tbody tr").filter({
  14  |     hasText: zoneName,
  15  |   });
  16  | }
  17  | 
  18  | export async function goToZonesPageFromSidebar(page: Page): Promise<void> {
  19  |   try {
  20  |     await navigateToSidebarSubmenu(page, "/zones");
  21  |   } catch {
  22  |     const sidebarContent = page.locator("[data-sidebar='content']").first();
  23  |     const zonesMenuButton = sidebarContent
  24  |       .locator("button[data-sidebar='menu-button']")
  25  |       .filter({ hasText: /^Zones$/i })
  26  |       .first();
  27  | 
  28  |     await expect(zonesMenuButton).toBeVisible({ timeout: 20000 });
  29  |     await zonesMenuButton.click();
  30  | 
  31  |     const zonesSubmenuLinkByHref = sidebarContent.locator("a[href='/zones']").first();
  32  |     if ((await zonesSubmenuLinkByHref.count()) > 0) {
  33  |       await zonesSubmenuLinkByHref.click();
  34  |     } else {
  35  |       await sidebarContent.getByRole("link", { name: /^Zones$/i }).first().click();
  36  |     }
  37  |   }
  38  | 
  39  |   await expect(page).toHaveURL(/\/zones/);
  40  |   await expect(page.locator("table").first()).toBeVisible();
  41  | }
  42  | 
  43  | export async function openZoneCreateDialog(page: Page) {
  44  |   const createButton = page
  45  |     .locator("button")
  46  |     .filter({ has: page.locator("svg.lucide-plus") })
  47  |     .first();
  48  |   await expect(createButton).toBeVisible({ timeout: 20000 });
  49  |   await createButton.click();
  50  | 
  51  |   const dialog = page.locator("[role='dialog']").last();
> 52  |   await expect(dialog).toBeVisible();
      |                        ^ Error: expect(locator).toBeVisible() failed
  53  |   return dialog;
  54  | }
  55  | 
  56  | export async function createZoneFromUI(
  57  |   page: Page,
  58  |   payload: ZoneFormInput,
  59  | ): Promise<void> {
  60  |   const dialog = await openZoneCreateDialog(page);
  61  | 
  62  |   await page.locator("#name").fill(payload.name);
  63  |   await page.locator("#lat").fill(payload.lat);
  64  |   await page.locator("#lon").fill(payload.lon);
  65  |   await dialog.getByRole("button", { name: /save/i }).click();
  66  | 
  67  |   await expect(zoneRowLocator(page, payload.name).first()).toBeVisible({
  68  |     timeout: 30000,
  69  |   });
  70  | }
  71  | 
  72  | export async function editZoneFromUI(
  73  |   page: Page,
  74  |   existingName: string,
  75  |   payload: ZoneFormInput,
  76  | ): Promise<void> {
  77  |   const row = zoneRowLocator(page, existingName).first();
  78  |   await expect(row).toBeVisible({ timeout: 30000 });
  79  | 
  80  |   const buttons = row.locator("button");
  81  |   await buttons.first().click();
  82  | 
  83  |   const dialog = page.locator("[role='dialog']").last();
  84  |   await expect(dialog).toBeVisible();
  85  | 
  86  |   await page.locator("#name").fill(payload.name);
  87  |   await page.locator("#lat").fill(payload.lat);
  88  |   await page.locator("#lon").fill(payload.lon);
  89  |   await dialog.getByRole("button", { name: /save/i }).click();
  90  | 
  91  |   await expect(zoneRowLocator(page, payload.name).first()).toBeVisible({
  92  |     timeout: 30000,
  93  |   });
  94  | }
  95  | 
  96  | export async function deleteZoneFromUI(
  97  |   page: Page,
  98  |   zoneName: string,
  99  | ): Promise<void> {
  100 |   const row = zoneRowLocator(page, zoneName).first();
  101 |   await expect(row).toBeVisible({ timeout: 30000 });
  102 | 
  103 |   const buttons = row.locator("button");
  104 |   await buttons.nth(1).click();
  105 | 
  106 |   const dialog = page.locator("[role='dialog']").last();
  107 |   await expect(dialog).toBeVisible();
  108 |   await dialog.getByRole("button", { name: /confirm delete|delete/i }).click();
  109 | 
  110 |   await expect(zoneRowLocator(page, zoneName)).toHaveCount(0, {
  111 |     timeout: 30000,
  112 |   });
  113 | }
  114 | 
  115 | type ZoneItem = {
  116 |   id?: number | string;
  117 |   name?: string;
  118 | };
  119 | 
  120 | function extractZoneItems(payload: unknown): ZoneItem[] {
  121 |   if (!payload || typeof payload !== "object") return [];
  122 |   const root = payload as { data?: unknown };
  123 |   const data = root.data;
  124 |   if (!data || typeof data !== "object") return [];
  125 |   const nested = data as { data?: unknown };
  126 |   if (!Array.isArray(nested.data)) return [];
  127 |   return nested.data as ZoneItem[];
  128 | }
  129 | 
  130 | export async function cleanupZoneByNameViaApi(
  131 |   request: APIRequestContext,
  132 |   zoneName: string,
  133 | ): Promise<void> {
  134 |   const token = await getBackendAccessToken(request);
  135 |   const listResponse = await request.get(
  136 |     `${backendBaseUrl}/api/v1/zones?page=1&per_page=100`,
  137 |     {
  138 |       headers: {
  139 |         "Content-type": "application/json",
  140 |         "X-Requested-With": "XMLHttpRequest",
  141 |         Authorization: `Bearer ${token}`,
  142 |       },
  143 |     },
  144 |   );
  145 |   if (!listResponse.ok()) return;
  146 | 
  147 |   const body = (await listResponse.json()) as unknown;
  148 |   const matchedIds = extractZoneItems(body)
  149 |     .filter((zone) => zone.name === zoneName && zone.id !== undefined)
  150 |     .map((zone) => zone.id as string | number);
  151 | 
  152 |   for (const zoneId of matchedIds) {
```