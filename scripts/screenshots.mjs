import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'screenshots');
const BASE = 'http://localhost:4028';

const EMAIL = 'anjeshsitaula.arj@gmail.com';
const PASSWORD = 'admin';

const USER_ID = 'cmpmxws680000hqmsx86u0ji1';

const PAGES = [
  // Core pages
  { path: '/login',                name: 'login',                  label: 'Login Page' },
  { path: '/dashboard',            name: 'dashboard',              label: 'Dashboard' },
  { path: '/hr',                   name: 'hr-dashboard',           label: 'HR Dashboard' },
  { path: '/hr/attendance',        name: 'hr-attendance',          label: 'Attendance Page' },
  { path: '/hr/employees',         name: 'hr-employees',           label: 'Employee List' },
  { path: `/hr/employees/${USER_ID}/face-enrollment`, name: 'hr-face-enrollment', label: 'Face Enrollment Page' },
  { path: '/hr/departments',       name: 'hr-departments',         label: 'Departments' },
  { path: '/hr/designations',      name: 'hr-designations',        label: 'Designations' },
  { path: '/hr/leave',             name: 'hr-leave',               label: 'Leave Management' },
  { path: '/hr/payroll',           name: 'hr-payroll',             label: 'Payroll' },

  // Settings tabs
  { path: '/settings?tab=localization', name: 'settings-localization', label: 'Settings - Localization' },
  { path: '/settings?tab=branches',     name: 'settings-branches',     label: 'Settings - Branches' },
  { path: '/settings?tab=roles',        name: 'settings-roles',        label: 'Settings - Roles' },
  { path: '/settings?tab=email',        name: 'settings-email',        label: 'Settings - Email' },
  { path: '/settings?tab=security',     name: 'settings-security',     label: 'Settings - Security' },
  { path: '/settings?tab=qualifications', name: 'settings-qualifications', label: 'Settings - Qualifications' },
  { path: '/settings?tab=partners',     name: 'settings-partners',     label: 'Settings - Partners' },
  { path: '/settings?tab=academics',    name: 'settings-academics',    label: 'Settings - Academics' },

  // University pages
  { path: '/universities',         name: 'universities',           label: 'Universities List' },
  { path: '/universities/add',     name: 'universities-add',       label: 'Add University' },

  // Course pages
  { path: '/courses',              name: 'courses',                label: 'Program Catalog' },
  { path: '/courses/add',          name: 'courses-add',            label: 'Add Course' },

  // Student & Application pages
  { path: '/applications',         name: 'applications',           label: 'Applications' },
  { path: '/students',             name: 'students',               label: 'Students' },
  { path: '/leads',                name: 'leads',                  label: 'Leads' },

  // Access & Staff
  { path: '/access',               name: 'access',                 label: 'Access & Roles' },
  { path: '/staff',                name: 'staff',                  label: 'Staff Management' },
  { path: '/api-keys',             name: 'api-keys',               label: 'API Keys' },

  // Reports
  { path: '/reports',              name: 'reports',                label: 'Reports' },

  // Communication
  { path: '/chat',                 name: 'chat',                   label: 'Chat' },
  { path: '/tickets',              name: 'tickets',                label: 'Support Tickets' },
  { path: '/notifications',        name: 'notifications',          label: 'Notifications' },

  // Other modules
  { path: '/tasks',                name: 'tasks',                  label: 'Tasks' },
  { path: '/automations',          name: 'automations',            label: 'Automations' },
  { path: '/featured',             name: 'featured',               label: 'Featured' },
  { path: '/expenses',             name: 'expenses',               label: 'Expenses' },
  { path: '/payments',             name: 'payments',               label: 'Payments' },
  { path: '/search',               name: 'search',                 label: 'Search' },
  { path: '/analytics',            name: 'analytics',              label: 'Analytics' },
  { path: '/learning-hub',         name: 'learning-hub',           label: 'Learning Hub' },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.createBrowserContext();
  await context.overridePermissions(BASE, ['camera']);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  // --- Login ---
  console.log('Logging in...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.type('input[type="email"]', EMAIL, { delay: 40 });
  await page.type('input[type="password"]', PASSWORD, { delay: 40 });
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Logged in, current URL:', page.url());

  // --- Screenshots ---
  let success = 0;
  let failed = 0;
  for (const p of PAGES) {
    try {
      console.log(`  ${p.label} (${p.path})...`);
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle0', timeout: 20000 });
      await sleep(2500);

      const filePath = path.join(OUT, `${p.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`    -> ${p.name}.png`);
      success++;
    } catch (err) {
      console.error(`    FAILED: ${p.path} - ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  console.log(`\nDone! ${success} screenshots captured, ${failed} failed.`);
  console.log('Saved to:', OUT);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
