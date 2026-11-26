import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

type Account = { uuid: string; host: string };
const accounts = JSON.parse(process.env.FR_E2E_ACCOUNTS ?? "{}") as Record<string, Account>;
const funds = accounts._funds as unknown as Record<string, string>;
const api = process.env.FR_E2E_API;
const password = process.env.FR_E2E_PASSWORD;
const origin = (user: string) => {
  const host = accounts[user]?.host;
  if (!['cp.isp.test', 'mk.isp.test', 'app.isp.test'].includes(host)) throw new Error('Use the disposable fund report runner.');
  return `http://${host}:${process.env.FR_E2E_PORT}`;
};
const row = (page: Page, name: string) => page.getByRole('row').filter({ has: page.getByText(name, { exact: true }) });
async function login(page: Page, user = 'fr_editor') {
  await page.goto(`${origin(user)}/admin`);
  await page.getByRole('textbox', { name: 'Username' }).fill(user);
  if (!password) throw new Error('Missing disposable fixture password.');
  await page.locator('#password').fill(password);
  await page.request.get(`${origin(user)}/api/auth/csrf`);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).toHaveURL(`${origin(user)}/dashboard`);
  const session = await (await page.request.get(`${origin(user)}/api/auth/session`)).json();
  expect(session.user.name).toBe(user.replace('_', ' '));
  await page.goto(`${origin(user)}/reports/funds`);
}
async function headers(request: APIRequestContext, user = 'fr_editor') {
  const response = await request.post(`${api}/api/v1/auth/login`, { data: { host: accounts[user].host, username: user, password } });
  expect(response.status()).toBe(200);
  return { Authorization: `Bearer ${(await response.json()).token}`, Accept: 'application/json' };
}
async function read(request: APIRequestContext, query = '', user = 'fr_editor') {
  const response = await request.get(`${api}/api/v1/funds${query}`, { headers: await headers(request, user) });
  expect(response.status()).toBe(200);
  return (await response.json()).data as { data: {id: string; name: string; account_number: string; balance: number}[]; report: { total_balance: number }; pagination: {total: number} };
}
async function filters(page: Page) {
  await page.getByRole('button').filter({ has: page.locator('svg.lucide-funnel') }).click();
  await expect(page.getByPlaceholder('Enter fund name', {exact:true})).toBeVisible();
}
async function baseline(page: Page) {
  await expect(row(page, 'alpha cash')).toBeVisible();
  await expect(page.getByText('Funds (12)', { exact: true })).toBeVisible();
}

// দশমিক, ঋণাত্মক ও শূন্য ব্যালেন্সের মোট সঠিক হয় এবং অন্য টেন্যান্ট-রিসেলার বাদ থাকে কি না দেখি।
test("FT063-01 Fund report balances: calculate positive, negative, and zero totals within the current company", async ({page, request}, testInfo) => {
  await login(page); await baseline(page);
  const listed = await read(request);
  expect(listed.report.total_balance).toBe(286);
  expect(listed.pagination.total).toBe(12);
  await expect(row(page, 'alpha cash')).toContainText('100.25');
  await expect(row(page, 'beta bank')).toContainText('-BDT 50.75');
  await expect(row(page, 'zero cash')).toBeVisible();
  await expect(page.getByText('BDT 286.00', {exact:true})).toBeVisible();
  await expect(page.getByText('mk secret', {exact: true})).toHaveCount(0);
  await expect(page.getByText('reseller secret', {exact: true})).toHaveCount(0);
  await expect(page.locator('span.absolute').filter({hasText:/^286\.00\/-$/})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('desktop.png'),fullPage:true});
});

// তথ্য থাকা বা খালি উভয় অবস্থায় ফান্ড রিপোর্টে এক্সপোর্ট, প্রিন্ট ও তারিখের নিয়ন্ত্রণ থাকে না কি না দেখি।
test("FT063-02 Fund report controls: hide export, print, and date actions for populated and empty lists", async ({page}) => {
  await login(page); await baseline(page);
  await expect(page.getByRole('button', {name: /export|download|print/i})).toHaveCount(0);
  await filters(page);
  await expect(page.locator('input[type="date"]')).toHaveCount(0);
  await page.getByPlaceholder('Enter fund name', {exact:true}).fill('no matching funds');
  await expect(page.getByRole('cell', {name: 'No results'})).toBeVisible();
  await expect(page.getByRole('button', {name: /export|download|print/i})).toHaveCount(0);
});

// রিলোডের পর ফান্ডের পরিচয়, অ্যাকাউন্ট ও নিযুক্ত স্টাফের তথ্য ঠিক থাকে কি না দেখি।
test("FT063-03 Fund report after reload: retain the saved account and assigned staff", async ({page}) => {
  await login(page); await baseline(page); await page.reload(); await baseline(page);
  await expect(row(page, 'alpha cash')).toContainText('MATCH-001');
  await expect(row(page, 'alpha cash')).toContainText('Alice Funds');
  await row(page,'alpha cash').getByRole('button').filter({has:page.locator('svg.lucide-eye')}).click();
  const transactions=page.getByRole('dialog');
  await expect(transactions).toContainText('Fund Transactions');
  await expect(transactions.getByRole('cell',{name:'No results'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(row(page,'alpha cash')).toBeVisible();
});

// নাম, অ্যাকাউন্ট ও স্টাফ আলাদা এবং একসঙ্গে ফিল্টার করে রিসেটের ফল যাচাই করি।
test("FT063-04 Fund report filters: filter by name, account, and staff separately or together, then reset", async ({page}) => {
  await login(page); await baseline(page); await filters(page);
  const name = page.getByPlaceholder('Enter fund name', {exact:true});
  const account = page.getByPlaceholder('Enter account number', {exact:true});
  await name.fill('alpha');
  await expect(page.getByText('BDT 300.75',{exact:true})).toBeVisible();
  await expect(row(page,'alpha bank')).toBeVisible(); await expect(row(page,'beta bank')).toHaveCount(0);
  await account.fill('MATCH');
  await expect(row(page,'alpha cash')).toBeVisible(); await expect(row(page,'alpha bank')).toHaveCount(0);
  await name.fill('');
  await expect(row(page,'beta bank')).toBeVisible();
  await expect(page.getByText('BDT 49.50',{exact:true})).toBeVisible();
  await account.fill('');
  await expect(row(page,'zero cash')).toBeVisible();
  await page.locator('#staff_id').click();
  await page.getByRole('option', {name:'Alice Funds',exact:true}).click();
  await expect(page.getByText('BDT 116.25',{exact:true})).toBeVisible();
  await expect(row(page,'alpha cash')).toBeVisible(); await expect(row(page,'alpha bank')).toHaveCount(0);
  await page.getByRole('button').filter({has:page.locator('svg.lucide-rotate-ccw')}).click();
  await expect(row(page,'alpha bank')).toBeVisible();
});

// পেজ, পেজের আকার ও কলাম বদলালেও পুরো ফলের মোট হিসাব ঠিক থাকে কি না দেখি।
test("FT063-05 Fund report table: keep full-result totals when changing pages, page size, or columns", async ({page}) => {
  await login(page); await baseline(page);
  await page.getByRole('button',{name:'Go to next page'}).click();
  await expect(row(page,'reserve 08')).toBeVisible(); await expect(row(page,'alpha cash')).toHaveCount(0);
  await expect(page.getByText('BDT 286.00', {exact:true})).toBeVisible();
  await page.locator('#results-per-page').click();
  await page.getByRole('option',{name:'25 / page',exact:true}).click();
  await expect(row(page,'alpha cash')).toBeVisible(); await expect(row(page,'reserve 08')).toBeVisible();
  await page.locator('main button[aria-haspopup="menu"]').last().click();
  await page.getByRole('menuitemcheckbox',{name:/account/i}).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('cell',{name:'MATCH-001',exact:true})).toHaveCount(0);
});

// ফান্ড এডিটে পুরোনো তথ্য আসে, বাতিলের পরিবর্তন বাদ যায় এবং সেভ করা তথ্য API-তে থাকে কি না দেখি।
test("FT063-06 Edit fund: load saved values, discard cancelled changes, and persist saved changes", async ({page,request}) => {
  await login(page); await baseline(page);
  await row(page,'alpha cash').locator('button').filter({ has: page.locator('svg.lucide-square-pen') }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByPlaceholder('Enter fund name', {exact:true})).toHaveValue('alpha cash');
  await expect(dialog.getByPlaceholder('Enter account number', {exact:true})).toHaveValue('MATCH-001');
  await expect(dialog.getByText('Alice Funds',{exact:true})).toBeVisible();
  await dialog.getByPlaceholder('Enter account number', {exact:true}).fill('CANCELLED');
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
  expect((await read(request)).data.find(f=>f.id===funds['alpha cash'])?.account_number).toBe('MATCH-001');
  await row(page,'alpha cash').locator('button').filter({ has: page.locator('svg.lucide-square-pen') }).click();
  await dialog.getByPlaceholder('Enter account number', {exact:true}).fill('SAVED-001');
  await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await expect(dialog).toBeHidden();
  expect((await read(request)).data.find(f=>f.id===funds['alpha cash'])?.account_number).toBe('SAVED-001');
  // Restore this suite-owned field so independently runnable cases retain their initial fixture.
  const response = await request.put(`${api}/api/v1/funds/${funds['alpha cash']}`, {headers:await headers(request),data:{name:'alpha cash',short_name:'ALP',account_number:'MATCH-001'}});
  expect(response.status()).toBe(200);
});

// ভুল এডিটে ফর্ম খোলা থাকে এবং সার্ভার প্রত্যাখ্যান করলে ব্যালেন্স বদলায় না কি না দেখি।
test("FT063-07 Invalid fund edit: keep the form open and preserve the balance after server rejection", async ({page,request}) => {
  await login(page); await baseline(page);
  await row(page,'alpha cash').locator('button').filter({ has: page.locator('svg.lucide-square-pen') }).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByPlaceholder('Enter fund name', {exact:true}).fill('x');
  await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Fund name must be at least 2 characters', {exact:true})).toBeVisible();
  const rejected=await request.put(`${api}/api/v1/funds/${funds['alpha cash']}`,{headers:await headers(request),data:{name:'',short_name:''}});
  expect(rejected.status()).toBe(422);
  expect((await read(request)).data.find(f=>f.id===funds['alpha cash'])?.balance).toBe(100.25);
});

// ফান্ড রিপোর্টের পাঠক ঢুকতে পারে এবং অনুমতিহীন ব্যবহারকারী UI ও API-তে আটকায় কি না দেখি।
test("FT063-08 Fund report permissions: allow readers and deny users without access in both UI and API", async ({page,request,browser}) => {
  await login(page,'fr_reader'); await baseline(page);
  await expect(row(page,'alpha cash').locator('button').filter({ has: page.locator('svg.lucide-square-pen') })).toHaveCount(0);
  const denied=await request.get(`${api}/api/v1/funds`,{headers:await headers(request,'fr_denied')}); expect(denied.status()).toBe(403);
  const write=await request.put(`${api}/api/v1/funds/${funds['alpha cash']}`,{headers:await headers(request,'fr_reader'),data:{name:'forbidden',short_name:'NO'}}); expect(write.status()).toBe(403);
  await expect(page.getByRole('button',{name:/add|create/i})).toHaveCount(0);
  const deniedContext=await browser.newContext();
  try {
    const deniedPage=await deniedContext.newPage();
    await login(deniedPage,'fr_denied');
    await expect(deniedPage.getByRole('alert').filter({hasText:'Unable to load funds'})).toBeVisible();
    await expect(row(deniedPage,'alpha cash')).toHaveCount(0);
  } finally { await deniedContext.close(); }

});

// নতুন লগইনের পরও ফান্ডের কোম্পানি, রিসেলার ও প্ল্যাটফর্মের সীমা কার্যকর থাকে কি না দেখি।
test("FT063-09 Fund ownership: enforce company, reseller, and platform boundaries after fresh login", async ({page,request}) => {
  const cp=await headers(request);
  for (const name of ['mk secret','reseller secret']) {
    const response=await request.get(`${api}/api/v1/funds/${funds[name]}`,{headers:cp});expect(response.status()).toBe(404);
  }
  const foreignStaff = accounts._staff as unknown as Record<string, number>;
  const invalidStaff = await request.put(`${api}/api/v1/funds/${funds['alpha cash']}`, {headers:cp,data:{name:'alpha cash',short_name:'ALP',staff_id:foreignStaff['MK Staff']}});
  expect(invalidStaff.status()).toBe(422);
  const reseller=await read(request,'','fr_reseller');expect(reseller.pagination.total).toBe(1);expect(reseller.report.total_balance).toBe(777);
  const platform=await read(request,'','fr_admin');expect(platform.pagination.total).toBe(1);expect(platform.data[0].name).toBe('platform only');
  await login(page); await baseline(page);
  await page.getByRole('button',{name:'User menu',exact:true}).click();
  await page.getByText(/sign out/i).click();
  await expect(page).toHaveURL(`${origin('fr_editor')}/admin`);
  await login(page,'fr_foreign');await expect(row(page,'mk secret')).toBeVisible();await page.reload();
  await expect(row(page,'alpha cash')).toHaveCount(0);
});

// খালি ফল ও লোডের ত্রুটি আলাদাভাবে দেখায় এবং পুনরুদ্ধার কাজ করে কি না দেখি।
test("FT063-10 Fund report loading failure: distinguish errors from no results and recover correctly", async ({page}) => {
  await login(page);await baseline(page);await filters(page);
  await page.getByPlaceholder('Enter fund name', {exact:true}).fill('absent');await expect(page.getByRole('cell',{name:'No results'})).toBeVisible();
  await page.getByPlaceholder('Enter fund name', {exact:true}).fill('');
  await expect(row(page,'beta bank')).toBeVisible();
  let release!: () => void;
  let held = false;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const before = await page.locator('table').boundingBox();
  await page.route('**/reports/funds',async route => {
    if (route.request().method() !== 'POST' || !route.request().postData()?.includes('name=alpha')) { await route.continue(); return; }
    held = true; await gate; await route.abort('failed');
  });
  await page.getByPlaceholder('Enter fund name', {exact:true}).fill('alpha');
  await expect.poll(() => held).toBe(true);
  await expect(row(page,'beta bank')).toBeVisible();
  expect((await page.locator('table').boundingBox())?.y).toBe(before?.y);
  release();
  await expect(page.getByRole('alert').filter({hasText:'Unable to load funds'})).toContainText(/unable/i);
  await page.unroute('**/reports/funds');
  await page.getByRole('button',{name:'Retry',exact:true}).click();
  await expect(row(page,'alpha bank')).toBeVisible();
  await expect(row(page,'beta bank')).toHaveCount(0);
  await expect(page.getByRole('alert').filter({hasText:'Unable to load funds'})).toHaveCount(0);
});

// দ্রুত রিপোর্ট সার্চে নতুন ফান্ড তৈরি বা ব্যালেন্সে দ্বৈত পরিবর্তন হয় না কি না দেখি।
test("FT063-11 Rapid fund searches: provide no create action and leave balances unchanged", async ({page,request}) => {
  await login(page);await baseline(page);await filters(page);
  const name=page.getByPlaceholder('Enter fund name', {exact:true});await name.fill('beta');await name.fill('alpha');
  await expect(page.getByText('BDT 300.75',{exact:true})).toBeVisible();
  await expect(row(page,'alpha bank')).toBeVisible();await expect(row(page,'beta bank')).toHaveCount(0);
  const current=await read(request);expect(current.pagination.total).toBe(12);expect(current.report.total_balance).toBe(286);
  await expect(page.getByRole('button',{name:/add fund|create fund/i})).toHaveCount(0);
});

// মোবাইলে কিবোর্ড, বাংলা ও ডার্ক থিমে ফান্ডের ফিল্টার ব্যবহারযোগ্য থাকে কি না দেখি।
test("FT063-12 Fund report on mobile: keep filters usable with keyboard, Bangla, and dark theme", async ({page}, testInfo) => {
  await login(page);await baseline(page);await page.context().addCookies([{name:'themeMode',value:'dark',url:origin('fr_editor')}]);
  await page.reload(); await page.setViewportSize({width:390,height:844});
  await page.getByRole('button').filter({ has: page.locator('svg.lucide-funnel') }).click();
  await expect(page.getByPlaceholder('Enter fund name', {exact:true})).toBeVisible();
  await page.getByPlaceholder('Enter fund name', {exact:true}).fill('alpha');await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await page.getByRole('radio',{name:'Bangla',exact:true}).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('body')).not.toContainText('fund.name.label');
  await expect(page.locator('span.absolute').filter({hasText:/^৩০০\.৭৫\/-$/})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('mobile-bangla-dark.png'),fullPage:true});
});
