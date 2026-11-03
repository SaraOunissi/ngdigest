/**
 * Prebuild — calendrier des versions d'Angular pour l'outil
 * `/fr/outils/support-versions-angular` (plan SEO 1.6).
 *
 * Source : https://endoflife.date/api/angular.json, qui reprend la table officielle
 * https://angular.dev/reference/releases (dates recoupées à la main le 2026-11-03 :
 * v20 LTS → 2026-11-28, v21 LTS → 2027-06, v22 active → 2027-06 / LTS → 2028-06).
 *
 * Écrit src/app/features/tools/angular-versions/infrastructure/angular-releases.generated.ts.
 * Réseau indisponible ou réponse invalide → le fichier existant est conservé (il porte
 * sa date de collecte, affichée sur la page) : le build ne casse pas pour une source
 * externe, et aucune donnée douteuse n'est écrite. Statuts et jours restants sont
 * recalculés dans la page à partir de la date du jour.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_FILE = join(ROOT, 'src', 'app', 'features', 'tools', 'angular-versions', 'infrastructure', 'angular-releases.generated.ts');
const SOURCE_URL = 'https://endoflife.date/api/angular.json';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const MIN_CYCLES = 10;

function toCycle(entry) {
  const major = Number(entry.cycle);
  const cycle = {
    major,
    releaseDate: entry.releaseDate,
    activeSupportEnd: entry.support,
    ltsEnd: entry.eol,
    latest: entry.latest,
    latestReleaseDate: entry.latestReleaseDate ?? null,
  };
  const valid =
    Number.isInteger(major) && major > 0 &&
    [cycle.releaseDate, cycle.activeSupportEnd, cycle.ltsEnd].every((date) => typeof date === 'string' && ISO_DATE.test(date)) &&
    typeof cycle.latest === 'string' && VERSION.test(cycle.latest) && cycle.latest.startsWith(`${major}.`) &&
    (cycle.latestReleaseDate === null || ISO_DATE.test(cycle.latestReleaseDate)) &&
    cycle.releaseDate <= cycle.activeSupportEnd && cycle.activeSupportEnd <= cycle.ltsEnd;
  if (!valid) throw new Error(`entrée invalide : ${JSON.stringify(entry)}`);
  return cycle;
}

async function main() {
  let payload;
  try {
    const response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(20_000), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    payload = await response.json();
  } catch (error) {
    console.warn(`[versions-angular] ${SOURCE_URL} injoignable (${error.message}) : fichier existant conservé.`);
    return;
  }

  let cycles;
  try {
    if (!Array.isArray(payload)) throw new Error('réponse non tableau');
    cycles = payload.map(toCycle).sort((a, b) => b.major - a.major);
    if (cycles.length < MIN_CYCLES) throw new Error(`${cycles.length} versions seulement`);
    if (new Set(cycles.map((cycle) => cycle.major)).size !== cycles.length) throw new Error('version en double');
  } catch (error) {
    console.warn(`[versions-angular] données refusées (${error.message}) : fichier existant conservé.`);
    return;
  }

  const data = { fetchedAt: new Date().toISOString().slice(0, 10), source: SOURCE_URL, cycles };
  const content =
    '// Généré par scripts/generate-angular-releases.mjs — ne pas modifier à la main.\n' +
    "import type { AngularReleasesData } from '../domain/angular-versions';\n\n" +
    `export const ANGULAR_RELEASES_DATA: AngularReleasesData = ${JSON.stringify(data, null, 2)};\n`;
  await writeFile(OUTPUT_FILE, content, 'utf-8');
  console.log(`[versions-angular] ${cycles.length} versions (dernière : ${cycles[0].latest}), données du ${data.fetchedAt}.`);
}

main();
