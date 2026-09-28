/**
 * Contract for the curated /jobs offers (src/content/jobs/*.md).
 *
 * The weekly career scan writes these files directly. This validator makes the
 * build fail loudly when a file does not match what the site can render, instead
 * of silently publishing a broken card or dropping an offer.
 *
 * Used by generate-jobs-data.mjs (prebuild) and unit-tested in jobs-schema.test.mjs.
 */

export const JOB_TYPES = ['CDI', 'Freelance'];
export const JOB_REMOTES = ['100', 'hybride', 'onsite'];
export const JOB_ZONES = ['FR', 'EU', 'Worldwide'];
export const JOB_LANGUAGES = ['fr', 'en'];
export const JOB_STATUSES = ['active', 'expired'];

/** Tag that allows an active offer without a published amount (board exception). */
export const NO_SALARY_TAG = 'salaire-non-communique';

const ALLOWED_KEYS = new Set([
  'slug', 'title', 'company', 'companyLogo', 'type', 'remote', 'zone', 'location',
  'locationEn', 'language', 'salary', 'salaryEn', 'tjm', 'stack', 'url', 'scannedAt',
  'status', 'tags', 'editorialHook', 'editorialHookEn', 'editorialNote', 'editorialNoteEn',
]);

const REQUIRED_TEXT = ['slug', 'title', 'company', 'url', 'editorialHook', 'editorialNote'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

const isFilled = (value) => typeof value === 'string' && value.trim() !== '';

/** Normalises a YAML date (Date object or string) to `YYYY-MM-DD`, or null. */
export function toIsoDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return Number.isNaN(new Date(value).getTime()) ? null : value;
  }
  return null;
}

/**
 * Validates one offer.
 *
 * @param {Record<string, unknown>} frontmatter parsed YAML frontmatter
 * @param {string} fileName e.g. `2026-09-25-agicap-senior-software-engineer.md`
 * @param {{ today?: string }} [options] ISO date used to reject future scans
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateJob(frontmatter, fileName, options = {}) {
  const errors = [];
  const warnings = [];
  const today = options.today ?? new Date().toISOString().slice(0, 10);

  for (const key of Object.keys(frontmatter)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push(`unknown field "${key}" (bilingual text goes in *En fields of the same file)`);
    }
  }

  for (const key of REQUIRED_TEXT) {
    if (!isFilled(frontmatter[key])) errors.push(`missing "${key}"`);
  }

  const slug = frontmatter.slug;
  if (isFilled(slug) && !SLUG_PATTERN.test(slug)) errors.push(`slug "${slug}" must be kebab-case`);

  const fileMatch = FILE_PATTERN.exec(fileName);
  if (!fileMatch) {
    errors.push('file name must be YYYY-MM-DD-<slug>.md');
  } else if (isFilled(slug) && fileMatch[2] !== slug) {
    errors.push(`file name slug "${fileMatch[2]}" does not match slug "${slug}"`);
  }

  if (!JOB_TYPES.includes(frontmatter.type)) errors.push(`type must be one of ${JOB_TYPES.join(', ')}`);
  if (!JOB_REMOTES.includes(String(frontmatter.remote))) errors.push(`remote must be one of ${JOB_REMOTES.join(', ')}`);
  if (!JOB_ZONES.includes(frontmatter.zone)) errors.push(`zone must be one of ${JOB_ZONES.join(', ')}`);
  if (!JOB_LANGUAGES.includes(frontmatter.language)) errors.push(`language must be one of ${JOB_LANGUAGES.join(', ')}`);
  if (!JOB_STATUSES.includes(frontmatter.status)) errors.push(`status must be one of ${JOB_STATUSES.join(', ')}`);

  if (isFilled(frontmatter.url) && !/^https:\/\/\S+$/.test(frontmatter.url)) {
    errors.push('url must be an absolute https URL');
  }

  const scannedAt = toIsoDate(frontmatter.scannedAt);
  if (!scannedAt) {
    errors.push('scannedAt must be a YYYY-MM-DD date');
  } else if (scannedAt > today) {
    errors.push(`scannedAt ${scannedAt} is in the future`);
  }

  if (!Array.isArray(frontmatter.stack) || frontmatter.stack.length === 0) {
    errors.push('stack must be a non-empty list');
  }
  if (frontmatter.tags !== undefined && !Array.isArray(frontmatter.tags)) {
    errors.push('tags must be a list');
  }

  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
  const hasAmount = isFilled(frontmatter.salary) || isFilled(frontmatter.tjm);
  if (frontmatter.status === 'active' && !hasAmount && !tags.includes(NO_SALARY_TAG)) {
    errors.push(`active offer needs a salary or tjm (or the "${NO_SALARY_TAG}" tag)`);
  }

  if (frontmatter.status === 'active') {
    for (const key of ['editorialHookEn', 'editorialNoteEn']) {
      if (!isFilled(frontmatter[key])) warnings.push(`no "${key}": the English page falls back to French`);
    }
  }

  return { errors, warnings };
}

/**
 * Validates a whole collection and reports duplicated slugs.
 *
 * @param {{ fileName: string, frontmatter: Record<string, unknown> }[]} entries
 * @param {{ today?: string }} [options]
 * @returns {{ errors: string[], warnings: string[] }} messages prefixed by file name
 */
export function validateJobCollection(entries, options = {}) {
  const errors = [];
  const warnings = [];
  const seen = new Map();

  for (const { fileName, frontmatter } of entries) {
    const result = validateJob(frontmatter, fileName, options);
    errors.push(...result.errors.map((message) => `${fileName}: ${message}`));
    warnings.push(...result.warnings.map((message) => `${fileName}: ${message}`));

    const slug = frontmatter.slug;
    if (isFilled(slug)) {
      if (seen.has(slug)) errors.push(`${fileName}: slug "${slug}" already used by ${seen.get(slug)}`);
      else seen.set(slug, fileName);
    }
  }

  return { errors, warnings };
}
