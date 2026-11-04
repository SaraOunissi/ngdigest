/**
 * Images de partage des articles (LinkedIn, Slack, X…) : un PNG 1200×630 par article
 * publié, dans `public/assets/images/og/blog/<lang>/<slug>.png`.
 *
 * Script local (Playwright + Chromium requis), pas lancé au build : les images sont
 * versionnées. À relancer quand un article est publié ou que son titre change :
 *
 *   node scripts/generate-og-images.mjs            # articles sans image
 *   node scripts/generate-og-images.mjs --force    # tout régénérer
 *
 * `generate-blog-index.mjs` renseigne `ogImage` dès que le fichier existe ; la page
 * de l'article le pose en og:image / twitter:image. Couleurs relues dans
 * `src/styles/_colors.scss`, polices de la charte embarquées (`scripts/og/fonts`, OFL).
 */
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import matter from 'gray-matter';

import { draftReason } from './lib/blog-draft-gate.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'blog');
const OUTPUT_DIR = join(ROOT, 'public', 'assets', 'images', 'og', 'blog');
const FONTS_DIR = join(ROOT, 'scripts', 'og', 'fonts');
const LOGO = join(ROOT, 'public', 'assets', 'images', 'ngdigest-logo.png');
const force = process.argv.includes('--force');

async function tokens() {
  const scss = await readFile(join(ROOT, 'src', 'styles', '_colors.scss'), 'utf-8');
  const pick = (name) => {
    const match = scss.match(new RegExp(`\\$${name}:\\s*(#[0-9a-fA-F]{3,8})`));
    if (!match) throw new Error(`jeton de couleur introuvable : $${name}`);
    return match[1];
  };
  return {
    bg: pick('color-bg'),
    surface: pick('color-surface'),
    text: pick('color-text-primary'),
    muted: pick('color-text-secondary'),
    primary: pick('color-primary'),
    primary2: pick('color-primary-2'),
    gold: pick('color-accent-gold'),
  };
}

function escapeHtml(text) {
  return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Polices et logo en data URI : une page chargée par setContent ne lit pas file://. */
async function assets() {
  const data = async (path, mime) => `data:${mime};base64,${(await readFile(path)).toString('base64')}`;
  return {
    display: await data(join(FONTS_DIR, 'space-grotesk-latin-700-normal.woff2'), 'font/woff2'),
    body: await data(join(FONTS_DIR, 'inter-latin-400-normal.woff2'), 'font/woff2'),
    bodyBold: await data(join(FONTS_DIR, 'inter-latin-600-normal.woff2'), 'font/woff2'),
    logo: await data(LOGO, 'image/png'),
  };
}

function page(article, colors, files) {
  const kicker = article.lang === 'fr' ? 'Blog NgDigest' : 'NgDigest blog';
  const highlight = article.highlight
    ? `<div class="hl"><span class="hl__value">${escapeHtml(article.highlight.value)}</span><span class="hl__label">${escapeHtml(article.highlight.label)}</span></div>`
    : '';
  return `<!doctype html><html lang="${article.lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:Display;src:url(${files.display});font-weight:700}
@font-face{font-family:Body;src:url(${files.body});font-weight:400}
@font-face{font-family:Body;src:url(${files.bodyBold});font-weight:600}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:${colors.bg};color:${colors.text};font-family:Body,sans-serif}
.card{position:relative;width:100%;height:100%;padding:64px 72px 56px;display:flex;flex-direction:column}
.card::before{content:"";position:absolute;inset:0 0 auto 0;height:10px;background:linear-gradient(115deg,${colors.primary2} 0%,${colors.primary} 52%,${colors.gold} 100%)}
.card::after{content:"";position:absolute;right:-180px;top:-180px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,${colors.primary}33 0%,transparent 70%)}
.brand{display:flex;align-items:center;gap:16px;font-family:Display,sans-serif;font-size:30px}
.brand img{width:52px;height:52px}
.kicker{margin-top:44px;font-size:22px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${colors.gold}}
h1{margin-top:18px;margin-bottom:28px;font-family:Display,sans-serif;font-weight:700;line-height:1.08;letter-spacing:-.02em;max-width:1000px}
.hl{margin-top:auto;position:relative;top:0;display:flex;align-items:baseline;gap:20px;padding:18px 24px;border-left:6px solid ${colors.gold};background:${colors.surface};border-radius:10px;max-width:960px}
.hl__value{font-family:Display,sans-serif;font-weight:700;font-size:44px;color:${colors.gold};white-space:nowrap}
.hl__label{font-size:24px;color:${colors.muted};line-height:1.3}
.foot{margin-top:28px;display:flex;justify-content:space-between;font-size:22px;color:${colors.muted}}
.card--nohl .foot{margin-top:auto}
</style></head><body><div class="card${highlight ? '' : ' card--nohl'}">
<div class="brand"><img src="${files.logo}" alt="">NgDigest</div>
<div class="kicker">${kicker}</div>
<h1 id="title">${escapeHtml(article.title)}</h1>
${highlight}
<div class="foot"><span>Sara Ounissi</span><span>ngdigest.co</span></div>
</div></body></html>`;
}

async function publishedArticles() {
  const articles = [];
  for (const lang of ['fr', 'en']) {
    const dir = join(CONTENT_DIR, lang);
    for (const file of (await readdir(dir)).filter((name) => name.endsWith('.md'))) {
      const { data } = matter(await readFile(join(dir, file), 'utf-8'));
      if (draftReason(file, data)) continue;
      articles.push({ lang, slug: data.slug, title: data.title, highlight: data.highlight ?? null });
    }
  }
  return articles;
}

async function main() {
  let chromium;
  try {
    // require() suit NODE_PATH : Playwright peut être installé globalement.
    ({ chromium } = createRequire(import.meta.url)('playwright'));
  } catch {
    console.error('[og] Playwright introuvable : lance ce script depuis une machine où `playwright` est installé.');
    process.exit(1);
  }
  const colors = await tokens();
  const files = await assets();
  const articles = (await publishedArticles()).filter(
    (article) =>
      force ||
      !existsSync(join(OUTPUT_DIR, article.lang, `${article.slug}.png`)) ||
      !existsSync(join(OUTPUT_DIR, article.lang, `${article.slug}-thumb.jpg`)),
  );
  if (articles.length === 0) {
    console.log('[og] Toutes les images de partage existent déjà (--force pour régénérer).');
    return;
  }
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  // Vignette affichée dans la liste du blog : même rendu, réduit à 480×252.
  const thumbTab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 0.4 });
  for (const article of articles) {
    for (const current of [tab, thumbTab]) {
      await current.setContent(page(article, colors, files), { waitUntil: 'load' });
      await current.evaluate(() => document.fonts.ready);
      // Titre aussi grand que possible sans dépasser trois lignes.
      await current.evaluate((hasHighlight) => {
        const title = document.getElementById('title');
        const maxLines = hasHighlight ? 3 : 4;
        for (let size = 66; size >= 40; size -= 2) {
          title.style.fontSize = `${size}px`;
          const lines = Math.round(title.getBoundingClientRect().height / (size * 1.08));
          if (lines <= maxLines) break;
        }
      }, Boolean(article.highlight));
    }
    const target = join(OUTPUT_DIR, article.lang, `${article.slug}.png`);
    await mkdir(dirname(target), { recursive: true });
    await tab.screenshot({ path: target, type: 'png' });
    await thumbTab.screenshot({
      path: join(OUTPUT_DIR, article.lang, `${article.slug}-thumb.jpg`),
      type: 'jpeg',
      quality: 82,
    });
    console.log(`[og] ${article.lang}/${article.slug}.png (+ vignette)`);
  }
  await browser.close();
}

main();
