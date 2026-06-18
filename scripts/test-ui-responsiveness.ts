import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/macbook/.gemini/antigravity-ide/brain/0878fed2-6355-4a89-a337-b48fbebbc1cd';
const BASE_URL = 'http://localhost:3000';

async function verifyResponsiveView(page: any, route: string, width: number, height: number, name: string) {
  console.log(`Setting viewport: ${width}x${height} for ${name}`);
  await page.setViewportSize({ width, height });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  
  // Wait a short time for transitions / layouts to settle
  await page.waitForTimeout(1000);
  
  const screenshotPath = path.join(ARTIFACTS_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Saved screenshot to: ${screenshotPath}`);

  // Perform basic layout verification checks
  const isSidebarVisible = await page.locator('aside').isVisible().catch(() => false);
  const mainWidth = await page.locator('main').boundingBox().then((box: any) => box?.width).catch(() => 0);
  
  console.log(`- Sidebar Visible: ${isSidebarVisible}`);
  console.log(`- Main Content Width: ${mainWidth}px`);

  if (width < 768) {
    if (isSidebarVisible) {
      console.warn(`[WARNING] Sidebar should be collapsed/hidden on mobile screen size (${width}px).`);
    } else {
      console.log(`[PASS] Sidebar collapsed on mobile.`);
    }
  } else {
    if (!isSidebarVisible) {
      console.warn(`[WARNING] Sidebar should be visible on desktop/tablet size (${width}px).`);
    } else {
      console.log(`[PASS] Sidebar visible.`);
    }
  }
}

async function main() {
  console.log('\n--- Running UI Responsiveness Verification using Brave ---');

  // Paths to check for Brave Browser binary
  const bravePaths = [
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Brave Browser Beta.app/Contents/MacOS/Brave Browser Beta',
    '/Applications/Brave Browser Dev.app/Contents/MacOS/Brave Browser Dev',
    '/Applications/Brave Browser Nightly.app/Contents/MacOS/Brave Browser Nightly'
  ];

  let executablePath: string | undefined;
  for (const bp of bravePaths) {
    if (fs.existsSync(bp)) {
      executablePath = bp;
      break;
    }
  }

  if (executablePath) {
    console.log(`Found Brave Browser executable at: ${executablePath}`);
  } else {
    console.log('Brave Browser binary not found. Falling back to default Playwright browser.');
  }

  const browser = await chromium.launch({
    executablePath,
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Settings Page Audit
    console.log('\n--- Auditing Settings Page (/dashboard/settings) ---');
    await verifyResponsiveView(page, '/dashboard/settings', 1280, 800, 'settings_desktop');
    await verifyResponsiveView(page, '/dashboard/settings', 768, 1024, 'settings_tablet');
    await verifyResponsiveView(page, '/dashboard/settings', 375, 812, 'settings_mobile');

    // 2. Main Dashboard Audit
    console.log('\n--- Auditing Main Dashboard Page (/dashboard) ---');
    await verifyResponsiveView(page, '/dashboard', 1280, 800, 'dashboard_desktop');
    await verifyResponsiveView(page, '/dashboard', 768, 1024, 'dashboard_tablet');
    await verifyResponsiveView(page, '/dashboard', 375, 812, 'dashboard_mobile');

    // 3. Compare Dashboard Audit
    console.log('\n--- Auditing Compare Page (/dashboard/compare) ---');
    await verifyResponsiveView(page, '/dashboard/compare', 852, 939, 'compare_852x939');

    console.log('\n--- Audits Completed successfully! ---');
  } catch (err) {
    console.error('Error during responsive viewport verification:', err);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Crash in test runner:', err);
  process.exit(1);
});
