# Prototype navigation map (shared by all link agents)

Goal: every screen on the canvas is a click-through prototype. In Play mode a viewer can start at
auth-Splash and reach every screen, and leave every screen, by tapping things that look tappable.

## Link mechanics (Design canvas .dc.html format)
- A link to another artboard is `<a href="sub-Home.dc.html">` (flat folder, same dir, exact file name).
- Style the `<a>` itself as the control. Never put a `<button>` (or input) inside an `<a>`: it swallows the
  click. To turn a navigating `<button ...style="X">inner</button>` into a link, write
  `<a href="Target.dc.html" style="X; text-decoration: none">inner</a>` keeping every visual property
  (if the button relied on UA defaults for color/display, add them explicitly so the look is unchanged,
  e.g. `color: inherit`, `display: flex`). Keep `aria-label` on icon-only links. Drop `type="button"`.
- Whole list rows / cards that open a detail: wrap the row content in one `<a>` (or turn the row's outer
  element into an `<a>` with `display: flex/grid; color: inherit; text-decoration: none`).
- Buttons that only change the current screen (segmented controls, filter chips, toggles, steppers,
  copy, show/hide) stay `<button>`; do not invent state logic for them.
- Do not change layout, copy, colours or sizes. Only the element type / href changes.
- Targets must be one of the 61 files listed in project/canvas.json. Never invent a file.
- Do not edit canvas.json (the main session marks boards interactive) and do not publish.

## Rules every screen meets
1. Back / close button in an app bar -> its parent screen (below).
2. Bottom tab bar: every tab links to its root (also the active one, to itself).
3. Every primary CTA and every row that implies a detail goes somewhere sensible.
4. No dead end: at least one way out.

## Tab roots
- Subscriber: Home sub-Home · Bills sub-Invoices · Usage sub-Usage · Support sub-Tickets · Account sub-Profile
- Reseller/collector: Home res-Home · Clients res-Clients · Collect res-CollectPayment · Wallet res-Wallet · More adm-More
- Technician: Jobs tech-Jobs · Map tech-Map · Scan tech-ScanOnu · Tools tech-Toolkit · More adm-More
- ISP admin: Home adm-Home · Network adm-Alarms · Clients adm-Clients · Billing adm-Reports · More adm-More

## Flows and parents (child -> parent for back buttons)
Auth: auth-Splash -> auth-ChooseIsp. ChooseIsp: "scan QR" -> auth-ScanQr; picking an ISP / continue ->
  auth-StaffLogin; a "I am a subscriber" style link -> auth-SubscriberLogin. ScanQr back -> ChooseIsp,
  success -> StaffLogin. StaffLogin back -> ChooseIsp; sign in -> adm-Home; subscriber switch ->
  SubscriberLogin. SubscriberLogin back -> ChooseIsp; continue -> auth-Otp. Otp back -> SubscriberLogin;
  verify -> sub-Home. Unlock: biometric / PIN -> adm-Home; "use password" -> StaffLogin.
  ForceUpdate: update -> auth-Splash.
Subscriber: Home -> PayBill, Invoices, Usage, CheckConnection, SpeedTest, Tickets, Profile.
  PayBill (back Home) -> BkashCheckout -> PaymentSuccess -> Home / InvoiceDetail.
  Invoices -> InvoiceDetail (back Invoices) -> PayBill; Invoices -> Payments (back Invoices).
  CheckConnection (back Home) -> DiagnosisResult (back CheckConnection) -> SpeedTest / WifiHelper / Tickets.
  SpeedTest back Home. WifiHelper back DiagnosisResult. Tickets -> TicketChat (back Tickets).
  Profile: sign out -> auth-ChooseIsp; payment history -> Payments; support -> Tickets.
Reseller: Home -> Clients, CollectPayment, Recharge, Wallet. Clients -> ClientDetail (back Clients),
  NewClient (back Clients). ClientDetail -> Recharge (back ClientDetail), CollectPayment.
  CollectPayment -> Receipt (back/done -> res-Home or CollectPayment). Wallet back Home.
Technician: Jobs -> JobDetail (back Jobs) -> Map, ClientCard (back JobDetail), CloseJob (back JobDetail,
  submit -> Jobs). ScanOnu -> BindOnu (back ScanOnu, done -> JobDetail). Toolkit -> Ping, Traceroute,
  LanScan, PonCalc, SyncQueue, Terminal (each back Toolkit). Offline/sync banners -> tech-SyncQueue.
Admin: Home -> Alarms, NocMap, Clients, Reports, Notifications (bell), Approvals.
  Alarms -> AlarmDetail (back Alarms) -> OltDetail, Outage. NocMap (back Home) -> OltDetail.
  OltDetail (back Alarms) -> Onus (back OltDetail) -> tech-BindOnu. Outage (back AlarmDetail) -> BulkSms.
  Clients -> Client360 (back Clients). Approvals, BulkSms, Notifications, Reports, plat-Tenants: back adm-More
  (Notifications back adm-Home).
More hub adm-More: rows to Approvals, BulkSms, Notifications, Reports, Onus, Outage, plat-Tenants;
  role switch -> res-Home (reseller) and tech-Jobs (technician) and adm-Home (admin);
  sign out -> auth-StaffLogin. plat-Tenants back -> adm-More.

## Coverage round 2: new screens (file stem · title · parent for back · web source to read for real fields)
Web source = folder under /srv/www/abc-client/components/ (form schemas, columns, view files) and the route in
app/(dashboard)/. Show the real fields/columns/actions that web screen has; keep sample data consistent with SPEC.md.
All are light (Mint) unless noted. Staff screens without a tab bar get a back button; list/hub screens get the admin tab bar.

G1 auth, subscriber, states, subscription
- auth-ForgotPassword · Forgot password · auth-StaffLogin (also from SubscriberLogin) · forgot-password page -> auth-ResetPassword
- auth-ResetPassword · Set new password · auth-ForgotPassword · reset-password page -> auth-StaffLogin
- sub-NewTicket · New support ticket · sub-Tickets · client-area/tickets -> sub-TicketChat
- sub-Notifications · Notifications · sub-Home (bell) and sub-Profile row
- sub-ChangePassword · Change password · sub-Profile
- state-Offline · No connection (staff app, cached data banner) · adm-Home
- state-Error · Something went wrong / retry · adm-Home
- state-SubscriptionExpired · ISP subscription expired (API 402) · links to adm-Subscription
- state-NoPermission · No access to this screen (permission denied) · adm-More
- adm-Subscription · Plan and billing (tenant's own plan, renew from wallet, invoices) · adm-More · components/subscription
G2 clients
- adm-ClientEdit · Edit client · adm-Client360 · clients/client-form*.tsx (all form sections)
- adm-ChangePackage · Change package (sheet) · adm-Client360 · clients/client-change-package-dialog.tsx
- adm-ArchivedClients · Archived clients (restore) · adm-Clients · archived-clients
- adm-ClientMap · Client map · adm-Clients · maps, client-maps
- adm-Packages · Client packages · adm-More · packages (client-packages)
- adm-PackageDetail · Package detail · adm-Packages · client-packages/view
- adm-ClientWallets · Client wallets · adm-More · wallets (client-wallets)
- adm-ImportClients · Import clients (file pick, mapping, progress) · adm-Clients · import-client
G3 billing, reports, lookup template
- adm-Invoices · Invoices (staff) · adm-More / adm-Home dues · invoices
- adm-InvoiceDetail · Invoice detail (print, share, collect, edit) · adm-Invoices · invoices
- adm-InvoiceCreate · Create invoice · adm-Invoices · invoices (create form)
- adm-Payments · Payments (staff list) · adm-More / adm-Home collected · payments
- adm-PaymentDetail · Payment detail · adm-Payments · payments
- adm-ReportDetail · Report: income vs expense (filters, chart, table, export) · adm-Reports · reports
- adm-BtrcExport · BTRC export · adm-Reports · reports/btrc
- adm-PaymentGateways · Payment gateways (bKash config) · set-Settings · payment-gateways
- set-Lookups · Lookup lists hub (zones, sub-zones, device types, unit types, product categories, vendors, invoice types, expense types, ticket subjects, tags, MikroTik packages) · set-Settings
- set-LookupList · Zones (template for every lookup list; add/edit sheet, sub-zones) · set-Lookups · zones, sub-zones
G4 finance and HR
- adm-Funds · Funds · adm-More · funds
- adm-FundTransfer · Fund transactions / transfer · adm-Funds · fund-transactions
- adm-Expenses · Expenses · adm-More · expenses
- adm-ExpenseAdd · Add expense (receipt photo) · adm-Expenses · expenses form
- adm-Salaries · Salaries · adm-More · salaries
- adm-SalaryPay · Pay salary · adm-Salaries · salaries form
- adm-Staff · Staff · adm-More · staffs
- adm-StaffDetail · Staff profile · adm-Staff (also adm-More header) · staffs, profiles (staff-profile)
- adm-StaffForm · Add / edit staff · adm-Staff · staffs form
G5 network
- adm-Olts · OLTs · adm-More · olt -> adm-OltDetail
- adm-Routers · MikroTik routers · adm-More · network (networks)
- adm-RouterDetail · Router detail (status, PPPoE sessions, resources) · adm-Routers · network
- adm-ReSync · Re-sync with MikroTik · adm-RouterDetail · re-sync
- adm-MikrotikCommands · Router commands · adm-RouterDetail · mikrotik-commands
- adm-Devices · Devices · adm-More · device
- tech-TjBoxes · TJ boxes (list + map toggle) · tech-Toolkit and tech-Map · tj-box (tj-boxes, tj-box-maps)
- tech-TjBoxDetail · TJ box detail (location, splitter ports, clients) · tech-TjBoxes · tj-box
- adm-MikrotikPackages · MikroTik packages (profiles) · set-Lookups · mikrotik-packages
G6 resellers, agents, inventory
- adm-Resellers · Resellers · adm-More · resellers
- adm-ResellerDetail · Reseller detail (wallet, clients, packages) · adm-Resellers · resellers view, reseller-profile
- adm-ResellerForm · Add / edit reseller · adm-Resellers · resellers form
- adm-ResellerPackages · Reseller packages · adm-ResellerDetail · packages (reseller-packages)
- adm-Agents · Agents · adm-More · agents
- adm-AgentDetail · Agent detail and transactions · adm-Agents · agents, agent-transactions
- inv-Products · Inventory · adm-More · products
- inv-StockIn · Stock in (purchase) · inv-Products · products/in
- inv-StockOut · Stock out (issue to technician / job) · inv-Products (also tech-JobDetail) · products/out
G7 support, SMS, logs
- adm-Tickets · Tickets (staff inbox) · adm-More / adm-Home open tickets · tickets
- adm-TicketDetail · Ticket detail (assign, status, replies) · adm-Tickets · tickets view
- adm-SmsTemplates · SMS templates · adm-BulkSms · sms-templates
- adm-SmsLogs · Message log · adm-More · communication-logs
- adm-SmsQueue · Message queue · adm-SmsLogs · communication-queue
- adm-ActivityLog · Activity log · adm-More · activity-logs
- adm-Histories · Change history · adm-Client360 (change history) · histories
- adm-Gateways · SMS and Telegram gateways · set-Settings · communication-gateways, telegram
G8 settings, access, platform
- set-Settings · Settings hub (every web settings page + config groups, language, theme, push) · adm-More
- set-Company · Company and invoice print (general, invoice-print, map) · set-Settings · settings
- set-Alerts · Notifications, SMS, monitoring and OLT settings · set-Settings · settings
- set-Appearance · Theme, dashboard and table preferences · set-Settings · settings
- adm-Users · Users · set-Settings · users
- adm-Roles · Roles · set-Settings · roles
- adm-RolePermissions · Role permissions (grouped toggles) · adm-Roles · permissions
- plat-CompanyDetail · Tenant detail (profile, subscription, wallet) · plat-Tenants · companies, company-profile
- plat-Plans · Subscription plans and features · plat-Tenants · subscription (plans, features, company-subscriptions)
- plat-DemoRequests · Demo requests · plat-Tenants · demo-requests

Existing files each group may update (links only, plus at most one added row/link where an entry point is missing):
G1 auth-StaffLogin, auth-SubscriberLogin, sub-Home, sub-Profile, sub-Tickets · G2 adm-Client360, adm-Clients ·
G3 adm-Reports, adm-Home · G5 tech-Toolkit, tech-Map, adm-OltDetail · G6 tech-JobDetail · G7 adm-BulkSms ·
G8 adm-More (becomes the full staff menu: one row per G1-G8 hub, grouped like the web sidebar; may scroll), plat-Tenants.
