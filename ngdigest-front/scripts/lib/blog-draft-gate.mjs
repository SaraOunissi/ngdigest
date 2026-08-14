// by project-worker 2026-08-14
/**
 * Draft gate for the blog pipeline.
 *
 * Sara's working drafts live in `src/content/blog/{fr,en}/` alongside the published
 * articles, so the generator needs an explicit, predictable rule to decide what ships.
 *
 * Historically the only rule was "an article missing a required frontmatter field is a
 * draft". That rule is implicit and dangerous: the day a draft gets its frontmatter
 * completed (to prepare a future publication, or simply to preview it), it silently goes
 * live on the next build. The gate below makes the intent explicit instead:
 *
 *   1. `status: draft` (or `draft: true`) in the frontmatter  → never published.
 *   2. a `draft-` file name prefix                            → never published.
 *   3. a missing required frontmatter field                   → not publishable (WIP).
 *
 * Publishing therefore becomes a deliberate act: drop the `draft-` prefix, remove
 * `status: draft`, and complete the frontmatter.
 */

/** Frontmatter fields an article must carry to be renderable + linkable (hreflang). */
export const REQUIRED_FRONTMATTER = [
  'slug',
  'title',
  'description',
  'date',
  'author',
  'lang',
  'alternate',
];

const isBlank = (value) => value === undefined || value === null || value === '';

/**
 * Decide whether a markdown file must be kept out of the generated blog index.
 *
 * @param {string} fileName        File name, e.g. `draft-angular-22.md`.
 * @param {Record<string, unknown>} frontmatter Parsed frontmatter (`{}` when absent).
 * @returns {string | null} A human-readable reason when the file is a draft, else `null`.
 */
export function draftReason(fileName, frontmatter = {}) {
  const status = String(frontmatter['status'] ?? '')
    .trim()
    .toLowerCase();
  if (status === 'draft' || status === 'wip') {
    return `explicit status: ${status}`;
  }

  if (frontmatter['draft'] === true) {
    return 'explicit draft: true';
  }

  if (String(fileName ?? '').startsWith('draft-')) {
    return 'draft- file name prefix';
  }

  const missing = REQUIRED_FRONTMATTER.filter((key) => isBlank(frontmatter[key]));
  if (missing.length > 0) {
    return `missing frontmatter: ${missing.join(', ')}`;
  }

  return null;
}
