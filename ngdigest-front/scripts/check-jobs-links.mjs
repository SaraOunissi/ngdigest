/**
 * Dead-link monitor for the /jobs offers (roadmap P1.b).
 *
 * For each published offer it probes the `url` up to MAX_ATTEMPTS times, a few
 * seconds apart, and flips the frontmatter `status` from `active` to `expired`
 * once FAIL_THRESHOLD probes in a row report the link dead (404/410 or
 * unreachable). Bot-blocks and server hiccups (401/403/429/5xx) never expire an
 * offer. The whole decision is self-contained in one run — no state is stored
 * between runs — so the accompanying workflow only opens a PR when a status
 * actually changes.
 *
 * Usage:
 *   node scripts/check-jobs-links.mjs            # probe + rewrite flipped files
 *   node scripts/check-jobs-links.mjs --dry-run  # probe + report, write nothing
 *
 * All decision logic lives in ./lib/jobs-link-health.mjs (unit-tested).
 */

import { readdir, readFile, writeFile, appendFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  FAIL_THRESHOLD,
  Outcome,
  evaluateOffer,
  readFrontmatterField,
  setFrontmatterStatus,
} from './lib/jobs-link-health.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const JOBS_DIR = join(ROOT, 'src', 'content', 'jobs');

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 3; // probes per offer; FAIL_THRESHOLD dead ones expire it
const RETRY_BACKOFF_MS = 5_000; // wait between attempts to ride out a blip
// A realistic UA cuts down on lazy bot-blocks that would otherwise read as 403.
const USER_AGENT = 'Mozilla/5.0 (compatible; NgDigestJobBot/1.0; +https://ngdigest.co)';

const isDryRun = process.argv.includes('--dry-run');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Probe a URL once, following redirects. Tries HEAD first (cheap); falls back
 * to GET when the server rejects HEAD (405/501) or errors. Never throws —
 * returns `{ status, networkError }` for the pure classifier.
 *
 * @param {string} url
 * @returns {Promise<{ status: number | null, networkError: boolean }>}
 */
async function probeOnce(url) {
  for (const method of ['HEAD', 'GET']) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT, accept: '*/*' },
      });
      // Retry with GET when HEAD is not supported by the origin.
      if (method === 'HEAD' && (response.status === 405 || response.status === 501)) {
        continue;
      }
      return { status: response.status, networkError: false };
    } catch {
      // On a HEAD failure, give GET a chance before declaring the link dead.
      if (method === 'HEAD') {
        continue;
      }
      return { status: null, networkError: true };
    } finally {
      clearTimeout(timer);
    }
  }
  return { status: null, networkError: true };
}

/**
 * Probe an offer repeatedly and decide its status. Stops early on the first
 * ALIVE response (offer is fine) or as soon as a flip is decided.
 *
 * @param {string} url
 * @param {string} currentStatus
 * @returns {Promise<{ newStatus: string, changed: boolean, outcome: string, status: number | null, strikes: number }>}
 */
async function evaluateOfferLinks(url, currentStatus) {
  let health = null;
  let last = { outcome: Outcome.INCONCLUSIVE, status: null };
  let newStatus = currentStatus;
  let changed = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const probe = await probeOnce(url);
    const evaluated = evaluateOffer({ currentStatus, previousHealth: health, probe });
    health = evaluated.health;
    last = { outcome: evaluated.outcome, status: probe.status };
    newStatus = evaluated.newStatus;
    changed = evaluated.changed;

    if (evaluated.outcome === Outcome.ALIVE || changed) {
      break;
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_BACKOFF_MS);
    }
  }

  return { newStatus, changed, outcome: last.outcome, status: last.status, strikes: health.strikes };
}

/** Emit a `changed=<bool>` output for the GitHub Actions step, if running in CI. */
async function reportChangedOutput(changed) {
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
  }
}

async function main() {
  let files;
  try {
    files = await readdir(JOBS_DIR);
  } catch {
    console.warn(`Jobs directory not found: ${JOBS_DIR} — nothing to check.`);
    return;
  }

  const offerFiles = files.filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const rows = [];
  let flips = 0;

  for (const file of offerFiles) {
    const path = join(JOBS_DIR, file);
    const raw = await readFile(path, 'utf-8');
    const slug = readFrontmatterField(raw, 'slug') ?? file.replace(/\.md$/, '');
    const url = readFrontmatterField(raw, 'url');
    const currentStatus = readFrontmatterField(raw, 'status') ?? 'active';

    if (!url) {
      rows.push({ slug, status: currentStatus, outcome: 'no-url', strikes: '-' });
      continue;
    }

    const result = await evaluateOfferLinks(url, currentStatus);
    rows.push({
      slug,
      status: result.newStatus,
      outcome: `${result.outcome}${result.status ? ` (${result.status})` : ''}`,
      strikes: result.strikes,
    });

    if (result.changed) {
      flips += 1;
      const rewritten = setFrontmatterStatus(raw, result.newStatus);
      if (!isDryRun) {
        await writeFile(path, rewritten, 'utf-8');
      }
      console.log(
        `↳ ${slug}: ${currentStatus} → ${result.newStatus} ` +
          `(${result.strikes} consecutive dead probes)`,
      );
    }
  }

  console.log('');
  console.table(rows);
  console.log(
    `${offerFiles.length} offer(s) probed · ${flips} status change(s)` +
      `${isDryRun ? ' · DRY RUN (no files written)' : ''}`,
  );

  if (flips > 0) {
    console.log(
      `::notice::${flips} job offer(s) expired after ${FAIL_THRESHOLD} dead probes — ` +
        'a PR will be opened for review.',
    );
  }
  await reportChangedOutput(flips > 0 && !isDryRun);
}

main().catch((error) => {
  console.error('check-jobs-links failed:', error);
  process.exitCode = 1;
});
