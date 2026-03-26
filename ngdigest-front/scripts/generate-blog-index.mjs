/**
 * Prebuild script — generates src/app/features/blog/infrastructure/blog-data.generated.ts
 * from Markdown files in src/content/blog/{fr,en}/.
 *
 * Run: node scripts/generate-blog-index.mjs
 * Automatically executed via the "prebuild" npm script.
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

    // marked.parse returns string synchronously when no async hooks are used
    const contentHtml = /** @type {string} */ (marked.parse(mdContent));

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
