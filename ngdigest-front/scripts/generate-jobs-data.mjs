/**
 * Prebuild script — generates src/app/features/jobs/infrastructure/jobs-data.generated.ts
 * from Markdown files in src/content/jobs/.
 *
 * Run: node scripts/generate-jobs-data.mjs
 * Automatically executed via the "prebuild" npm script.
 *
 * Pattern volontairement aligné sur generate-blog-index.mjs.
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'jobs');
const OUTPUT_DIR = join(ROOT, 'src', 'app', 'features', 'jobs', 'infrastructure');
const OUTPUT_FILE = join(OUTPUT_DIR, 'jobs-data.generated.ts');

/** Normalises a YAML date value to an ISO `YYYY-MM-DD` string. */
function toIsoDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}

const jobs = [];

let files;
try {
  files = await readdir(CONTENT_DIR);
} catch {
  console.warn(`Directory not found: ${CONTENT_DIR} — skipping`);
  files = [];
}

for (const file of files.filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const raw = await readFile(join(CONTENT_DIR, file), 'utf-8');
  const { data: frontmatter } = matter(raw);

  const entry = {
    slug: frontmatter['slug'],
    title: frontmatter['title'],
    company: frontmatter['company'],
    companyLogo: frontmatter['companyLogo'] ?? '',
    type: frontmatter['type'],
    remote: String(frontmatter['remote']),
    zone: frontmatter['zone'],
    location: frontmatter['location'] ?? null,
    language: frontmatter['language'],
    salary: frontmatter['salary'] ?? null,
    tjm: frontmatter['tjm'] ?? null,
    stack: frontmatter['stack'] ?? [],
    url: frontmatter['url'],
    scannedAt: toIsoDate(frontmatter['scannedAt']),
    status: frontmatter['status'],
    tags: frontmatter['tags'] ?? [],
    editorialHook: frontmatter['editorialHook'] ?? '',
    editorialNote: frontmatter['editorialNote'] ?? '',
  };

  if (frontmatter['editorialHookEn']) entry.editorialHookEn = frontmatter['editorialHookEn'];
  if (frontmatter['editorialNoteEn']) entry.editorialNoteEn = frontmatter['editorialNoteEn'];
  if (frontmatter['locationEn']) entry.locationEn = frontmatter['locationEn'];
  if (frontmatter['salaryEn']) entry.salaryEn = frontmatter['salaryEn'];

  jobs.push(entry);
}

// Sort jobs: most recently scanned first
jobs.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());

const header = [
  '// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY.',
  '// Run `npm run generate:jobs` (or `npm run build`) to regenerate.',
  "import type { Job } from '../domain/models/job.model';",
  '',
  'export const JOBS_DATA: readonly Job[] = ',
].join('\n');

const output = header + JSON.stringify(jobs, null, 2) + ' as const;\n';

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_FILE, output, 'utf-8');
console.log(`Generated ${jobs.length} job(s) -> ${OUTPUT_FILE}`);
