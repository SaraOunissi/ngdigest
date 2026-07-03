/**
 * Prebuild script — generates src/app/features/blog/infrastructure/blog-data.generated.ts
 * from Markdown files in src/content/blog/{fr,en}/.
 *
 * Beyond plain Markdown → HTML, this pipeline bakes the NgDigest editorial charte
 * so that EVERY future .md renders automatically with the same design, without the
 * author ever writing HTML/CSS. See src/content/blog/README.md for the rules.
 *
 * Per article it produces:
 *   - contentHtml     : directives transformed, tables wrapped, `##` anchored,
 *                       trailing "Sources" block de-emphasised.
 *   - readingMinutes  : estimated reading time.
 *   - toc[]           : { id, text } extracted from the `##` headings.
 *   - cover / highlight / featured : optional frontmatter for the featured card.
 *
 * Pipeline order: transformDirectives(md) → marked.parse() → wrapTables → withToc → wrapSources.
 *
 * Run: node scripts/generate-blog-index.mjs  (also runs via the "prebuild" npm script).
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'blog');
const OUTPUT_DIR = join(ROOT, 'src', 'app', 'features', 'blog', 'infrastructure');
const OUTPUT_FILE = join(OUTPUT_DIR, 'blog-data.generated.ts');

const WORDS_PER_MINUTE = 200;

// Configure marked with highlight.js for syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

// Use GitHub-flavoured Markdown rendering
marked.use({ gfm: true, breaks: false });

// ── Helpers ────────────────────────────────────────────────────────────────

/** Parse inline Markdown (bold, em, links, code) inside a directive fragment. */
const inline = (text) => marked.parseInline(String(text ?? '').trim());

/** Estimated reading time in minutes, from the raw Markdown body. */
function readingMinutes(md) {
  const words = md
    .replace(/```[\s\S]*?```/g, ' ') // drop code blocks
    .replace(/[#>*_`\-|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Slugify a heading into a stable, accent-free anchor id. */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Decode the few HTML entities marked emits inside heading text. */
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Transform the three custom directives into HTML *before* marked runs:
 *   :::keyfigures / :::note|warn|tip / :::cta
 */
function transformDirectives(md) {
  // :::keyfigures — 3 big figures side by side.
  md = md.replace(/:::keyfigures([^\n]*)\n([\s\S]*?)\n:::/g, (_m, title, rows) => {
    const items = rows
      .trim()
      .split('\n')
      .map((line) => {
        const [variant, value, label] = line
          .replace(/^\s*-\s*/, '')
          .split('|')
          .map((s) => s.trim());
        const cls = ['bad', 'good', 'gold', 'neutral'].includes(variant) ? variant : 'neutral';
        return `<div class="keyfigure keyfigure--${cls}"><div class="keyfigure__num">${value ?? ''}</div><div class="keyfigure__label">${inline(label)}</div></div>`;
      })
      .join('');
    const head = title.trim() ? `<div class="keyfigures__head">${inline(title)}</div>` : '';
    return `\n\n<div class="keyfigures">${head}<div class="keyfigures__grid">${items}</div></div>\n\n`;
  });

  // :::note / :::warn / :::tip — callout box.
  md = md.replace(/:::(note|warn|tip)([^\n]*)\n([\s\S]*?)\n:::/g, (_m, kind, title, body) => {
    const cls = { note: 'info', warn: 'warn', tip: 'tip' }[kind];
    const head = title.trim() ? `<span class="callout__title">${inline(title)}</span>` : '';
    return `\n\n<div class="callout callout--${cls}">${head}<p>${inline(body)}</p></div>\n\n`;
  });

  // :::cta — end-of-article banner: Title | Subtitle | Button | URL.
  md = md.replace(/:::cta([^\n]*)\n:::/g, (_m, body) => {
    const [title, sub, btn, url] = body.split('|').map((s) => s.trim());
    return `\n\n<div class="cta-card"><div class="cta-card__text"><div class="cta-card__title">${inline(title)}</div><p class="cta-card__sub">${inline(sub)}</p></div><a class="cta-card__btn" href="${url ?? '#'}">${btn ?? ''} →</a></div>\n\n`;
  });

  return md;
}

/** Wrap every <table> in a horizontally scrollable container. */
function wrapTables(html) {
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

/** Add ids to every <h2> and collect the table of contents. */
function withToc(html) {
  const toc = [];
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, '').trim());
    const id = slugify(text);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

/**
 * De-emphasise the trailing "Sources" block: everything after the last <hr> that
 * is immediately followed by a bold paragraph gets wrapped in `.sources`, and its
 * leading `<p><strong>…</strong></p>` becomes the `.sources__title`.
 * The charte reserves the closing `---` for the sources block, so this is safe.
 */
function wrapSources(html) {
  const marker = '<hr>';
  const lastHr = html.lastIndexOf(marker);
  if (lastHr === -1) return html;

  const before = html.slice(0, lastHr + marker.length);
  const after = html.slice(lastHr + marker.length);

  // Only treat it as a sources block when it opens with a bold paragraph.
  if (!/^\s*<p><strong>/.test(after)) return html;

  const wrapped = after.replace(/^\s*<p>([\s\S]*?)<\/p>/, '<p class="sources__title">$1</p>');
  return `${before}<div class="sources">${wrapped}</div>`;
}

/** Full Markdown → editorial HTML pipeline for one article body. */
function renderArticle(md) {
  const transformed = transformDirectives(md);
  const parsed = /** @type {string} */ (marked.parse(transformed));
  const tabled = wrapTables(parsed);
  const { html, toc } = withToc(tabled);
  return { contentHtml: wrapSources(html), toc };
}

// ── Build ──────────────────────────────────────────────────────────────────

const articles = [];

for (const lang of ['fr', 'en']) {
  const langDir = join(CONTENT_DIR, lang);

  let files;
  try {
    files = await readdir(langDir);
  } catch {
    console.warn(`Directory not found: ${langDir} — skipping`);
    continue;
  }

  for (const file of files.filter((f) => f.endsWith('.md'))) {
    const raw = await readFile(join(langDir, file), 'utf-8');
    const { data: frontmatter, content: mdContent } = matter(raw);

    // Skip drafts and WIP articles: a publishable article must have all required fields.
    // Sara's working drafts in src/content/blog/ live alongside published ones.
    const required = ['slug', 'title', 'description', 'date', 'author', 'lang', 'alternate'];
    const missing = required.filter(
      (key) => frontmatter[key] === undefined || frontmatter[key] === null || frontmatter[key] === '',
    );
    if (missing.length > 0) {
      console.warn(`Skipping blog draft ${lang}/${file} — missing frontmatter: ${missing.join(', ')}`);
      continue;
    }

    const { contentHtml, toc } = renderArticle(mdContent);

    articles.push({
      slug: frontmatter['slug'],
      title: frontmatter['title'],
      description: frontmatter['description'],
      date: String(frontmatter['date']),
      author: frontmatter['author'],
      tags: frontmatter['tags'] ?? [],
      lang: frontmatter['lang'],
      alternate: frontmatter['alternate'],
      contentHtml,
      readingMinutes: readingMinutes(mdContent),
      toc,
      cover: frontmatter['cover'] ?? null,
      highlight: frontmatter['highlight'] ?? null,
      featured: frontmatter['featured'] === true,
    });
  }
}

// Sort articles: newest first within each language
articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const output = `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
// Run \`npm run generate:blog\` (or \`npm run build\`) to regenerate.
import type { Article } from '../domain/models/article.model';

export const BLOG_DATA: readonly Article[] = ${JSON.stringify(articles, null, 2)} as const;
`;

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_FILE, output, 'utf-8');
console.log(`✓ Generated ${articles.length} article(s) → ${OUTPUT_FILE}`);
