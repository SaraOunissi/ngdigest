/**
 * q135 — tague les offres scannées de la couche SÉLECTIVE (`src/content/jobs/*.md`)
 * au schéma ObserveOffer, sans toucher à la couche de publication.
 *
 * Run: node scripts/tag-jobs-metadata.mjs   (ou `npm run tag:jobs`)
 *      node scripts/tag-jobs-metadata.mjs --check   → ne réécrit rien, sort 1 si périmé
 *
 * ⚠️ Ce script est en LECTURE SEULE sur tout ce qui concerne la publication :
 * il ne touche ni `jobs-data.generated.ts`, ni les fiches `.md`. Il n'est PAS
 * branché sur `prebuild` — le build reste strictement inchangé (acceptance q135
 * « couche publication inchangée »).
 *
 * Sortie : ../observatoire/data/pepites-tagged.json — fichier SÉPARÉ du store
 * marché LARGE. Ne jamais fusionner les deux (cadrage §1 : les pépites sont un
 * échantillon ultra-trié, elles biaiseraient les stats de l'observatoire).
 *
 * Pattern volontairement aligné sur generate-jobs-data.mjs.
 *
 * by project-worker 2026-08-15
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

import { buildPepitesIndex } from '../../observatoire/src/pepites-bridge.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'jobs');
const OUTPUT_DIR = join(ROOT, '..', 'observatoire', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'pepites-tagged.json');

const checkOnly = process.argv.includes('--check');

let files;
try {
  files = await readdir(CONTENT_DIR);
} catch {
  console.warn(`Directory not found: ${CONTENT_DIR} — skipping`);
  files = [];
}

const entries = [];
for (const file of files.filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const raw = await readFile(join(CONTENT_DIR, file), 'utf-8');
  const { data: frontmatter } = matter(raw);
  entries.push({ file, frontmatter });
}

// `generatedAt` est volontairement figé sur la date de scan la plus récente et
// non sur `new Date()` : le fichier reste ainsi stable d'un run à l'autre tant
// que le contenu ne bouge pas (diff git propre, mode --check fiable en CI).
const latestScan = entries
  .map((e) => e.frontmatter?.scannedAt)
  .filter(Boolean)
  .map((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)))
  .sort()
  .pop();

const index = buildPepitesIndex(entries, { generatedAt: latestScan ?? null });
const output = `${JSON.stringify(index, null, 2)}\n`;

if (checkOnly) {
  const current = existsSync(OUTPUT_FILE) ? readFileSync(OUTPUT_FILE, 'utf-8') : null;
  if (current !== output) {
    console.error(`✗ ${OUTPUT_FILE} est périmé — relancer \`npm run tag:jobs\`.`);
    process.exit(1);
  }
  console.log(`✓ ${index.counts.total} offre(s) taguée(s), fichier à jour.`);
} else {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, output, 'utf-8');
  console.log(
    `Tagged ${index.counts.total} offer(s) ` +
      `(${index.counts.active} active, ${index.counts.expired} expired) -> ${OUTPUT_FILE}`
  );
}
