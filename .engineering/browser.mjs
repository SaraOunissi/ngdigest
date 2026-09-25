// Shared browser gate. Product-specific critical journeys stay in the product.
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { serve } from './serve.mjs';

const configPath = path.resolve(process.env.QUALITY_CONFIG || '.engineering/quality.json');
const root = path.dirname(path.dirname(configPath));
const config = JSON.parse(await readFile(configPath, 'utf8'));
const require = createRequire(process.env.QUALITY_NODE_PACKAGE || path.join(root, config.browser.package || '.engineering/package.json'));
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const out = path.join(root, '.engineering/artifacts/browser');
await mkdir(out, { recursive: true });
await stat(path.join(root, config.browser.build_dir));
const results = [];
const routes = config.browser.prerender_manifest
  ? Object.keys(JSON.parse(await readFile(path.join(root, config.browser.prerender_manifest), 'utf8')).routes)
  : config.browser.routes;
if (!Array.isArray(routes) || routes.length === 0) throw new Error('No browser routes configured');
const server = await serve(path.join(root, config.browser.build_dir));
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', locale: 'fr-FR' });
    // No production API or analytics calls from synthetic browser QA.
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === server.url && !url.pathname.startsWith('/api/')) return route.continue();
      const fixture = (config.browser.fixtures || []).find(item => url.pathname === item.path);
      if (fixture) return route.fulfill({ status: fixture.status || 200, contentType: 'application/json', body: JSON.stringify(fixture.body) });
      return route.abort('blockedbyclient');
    });
    const page = await context.newPage();
    for (const entry of routes) {
      const errors = [];
      const listener = error => errors.push(error.message);
      page.on('pageerror', listener);
      const issues = [];
      try {
        const response = await page.goto(server.url + entry, { waitUntil: 'networkidle' });
        if (response.status() !== 200) issues.push('HTTP ' + response.status());
        if (await page.locator('h1').count() === 0) issues.push('No h1 on the rendered page');
        if ((await page.locator('body').innerText()).trim().length < 50) issues.push('page has no meaningful content');
        await page.evaluate(() => document.fonts.ready);
        if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) issues.push('horizontal overflow');
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
        issues.push(...axe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })));
        const broken = await page.locator('img').evaluateAll(images => images.filter(img => img.complete && img.naturalWidth === 0).map(img => img.getAttribute('src')));
        if (broken.length) issues.push({ broken_images: broken });
        await page.keyboard.press('Tab');
        if (await page.evaluate(() => document.activeElement === document.body)) issues.push('no keyboard focus target');
        await page.screenshot({ path: path.join(out, `${entry.replace(/[^a-z0-9]/gi, '_') || 'home'}-${width}.png`), fullPage: true });
      } catch (error) { issues.push(error.message); }
      results.push({ route: entry, width, issues, errors });
      page.off('pageerror', listener);
    }
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
  await writeFile(path.join(out, 'report.json'), JSON.stringify({ project: config.project, synthetic: true, results }, null, 2));
}
const failures = results.filter(item => item.issues.length || item.errors.length);
console.log(`${config.project}: ${results.length} browser checks, ${failures.length} failing. See .engineering/artifacts/browser/report.json.`);
process.exitCode = failures.length ? 1 : 0;
