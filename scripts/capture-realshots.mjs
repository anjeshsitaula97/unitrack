import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'screenshots');
const BASE = 'http://localhost:4028';

const EMAIL = 'anjeshsitaula.arj@gmail.com';
const PASSWORD = 'admin';

const SHOTS = [
  { path: '/admin-dashboard', name: 'dashboard' },
  { path: '/universities', name: 'universities' },
  { path: '/courses', name: 'courses' },
  { path: '/students', name: 'students' },
  { path: '/leads', name: 'leads' },
  { path: '/applications', name: 'applications' },
  { path: '/tasks', name: 'tasks' },
  { path: '/analytics', name: 'analytics' },
  { path: '/reports', name: 'reports' },
  { path: '/payments', name: 'payments' },
  { path: '/chat', name: 'chat' },
  { path: '/search', name: 'search' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function navViaSidebar(page, target) {
  // Click a matching sidebar <a> (Next Link) so navigation stays client-side
  // (a full page load would force-log-out via AppLayoutWrapper).
  const clicked = await page.evaluate((href) => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const el = links.find((a) => a.getAttribute('href') === href);
    if (!el) return false;
    el.click();
    return true;
  }, target);
  return clicked;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  console.log('Logging in...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(1500);
  await page.type('input[type="email"]', EMAIL, { delay: 20 });
  await page.type('input[type="password"]', PASSWORD, { delay: 20 });
  await page.click('button[type="submit"]');
  await page.waitForFunction(
    () => window.location.pathname !== '/login',
    { timeout: 30000 }
  );
  console.log('Logged in, at:', await page.evaluate(() => window.location.pathname));

  let ok = 0;
  let failed = 0;
  for (const s of SHOTS) {
    try {
      const current = await page.evaluate(() => window.location.pathname);
      if (current !== s.path) {
        const clicked = await navViaSidebar(page, s.path);
        if (!clicked) {
          throw new Error(`No sidebar link found for "${s.path}"`);
        }
        await page.waitForFunction(
          (p) => window.location.pathname === p,
          { timeout: 30000 },
          s.path
        );
      }
      await sleep(3000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(300);
      await page.screenshot({ path: path.join(OUT, `${s.name}.png`) });
      console.log(`  OK ${s.name} (${s.path})`);
      ok++;
    } catch (err) {
      console.error(`  FAIL ${s.name} (${s.path}): ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  console.log(`\nDone: ${ok} captured, ${failed} failed -> ${OUT}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});