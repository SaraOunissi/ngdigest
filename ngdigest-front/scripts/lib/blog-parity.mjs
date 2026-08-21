// by project-worker 2026-08-22
/**
 * Editorial guard for the FR/EN blog pairs (q179).
 *
 * `src/content/blog/README.md` states two rules that nothing in the build enforces:
 *
 *   - rule 11 — "Parité FR/EN : même nombre et mêmes positions de `:::keyfigures`,
 *     `>`, `:::cta`, mêmes `##`. Appliquer tout delta FR côté EN dans la foulée."
 *   - rules 6 & 7 — one `:::cta` per article, at most two callouts.
 *
 * In practice the FR article gets edited first and the EN one drifts: a section is
 * added on one side only, a pull-quote disappears, the CTA is duplicated. Nothing
 * turns red — the page still renders, it is just quietly worse in one language, and
 * the language switcher sends readers to a different article than the one they left.
 *
 * The second half of the guard is about dead links. The editorial bar asks for at
 * least two internal links per article and zero dead ones; a `/fr/carriere/toolkit`
 * typed by hand in Markdown is never type-checked. So every internal link is
 * confronted with the routes actually declared in `app.routes.ts`, and every
 * `/{lang}/blog/<slug>` link with the slugs that really exist — flagging as dead any
 * link from a publishable article towards an article still gated as a draft.
 *
 * Drafts are checked too (parity is cheapest to keep while writing), except for the
 * "link to a draft" rule, which only makes sense for articles that actually ship.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { draftReason } from './blog-draft-gate.mjs';

const LANGS = ['fr', 'en'];

/** Strip the frontmatter block and return `{ frontmatter, body }` as raw strings. */
export function splitFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { frontmatter: '', body: raw };
  return { frontmatter: match[1], body: match[2] };
}

/** Read a scalar frontmatter field, unquoted. `null`/empty become `''`. */
export function frontmatterValue(frontmatter, key) {
  const match = new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(frontmatter);
  if (!match) return '';
  const value = match[1].trim().replace(/^["']|["']$/g, '');
  return value === 'null' ? '' : value;
}

/**
 * Count the editorial markers that rule 11 asks to keep in sync.
 *
 * Pull-quotes are `>` lines that stand alone; consecutive `>` lines belong to the
 * same quote, so only the first line of each run is counted.
 */
export function countMarkers(body) {
  const lines = body.split(/\r?\n/);
  let pullQuotes = 0;
  let previousWasQuote = false;
  for (const line of lines) {
    const isQuote = /^\s*>/.test(line);
    if (isQuote && !previousWasQuote) pullQuotes += 1;
    previousWasQuote = isQuote;
  }
  return {
    sections: (body.match(/^##\s+\S/gm) ?? []).length,
    keyfigures: (body.match(/^:::keyfigures\b/gm) ?? []).length,
    callouts: (body.match(/^:::(note|warn|tip)\b/gm) ?? []).length,
    cta: (body.match(/^:::cta\b/gm) ?? []).length,
    pullQuotes,
  };
}

/** Every `/fr/...` or `/en/...` link target found in the Markdown body. */
export function internalLinks(body) {
  return [...body.matchAll(/]\((\/(?:fr|en)[^)\s]*)\)/g)].map(([, href]) => href);
}

/** Route paths declared under the `:lang` shell, e.g. `carriere/toolkit`, `blog/:slug`. */
export function declaredRoutes(routesSource) {
  return new Set([...routesSource.matchAll(/path:\s*'([^']*)'/g)].map(([, path]) => path));
}

/** Parse one article file into the shape the checks need. */
export function parseArticle(lang, fileName, raw) {
  const { frontmatter, body } = splitFrontmatter(raw);
  const parsed = Object.fromEntries(
    ['slug', 'title', 'description', 'date', 'author', 'lang', 'alternate', 'status', 'draft'].map(
      (key) => [key, frontmatterValue(frontmatter, key)]
    )
  );
  return {
    id: `${lang}/${fileName}`,
    lang,
    fileName,
    slug: parsed.slug,
    alternate: parsed.alternate,
    draft: draftReason(fileName, { ...parsed, draft: parsed.draft === 'true' }),
    markers: countMarkers(body),
    links: internalLinks(body),
  };
}

/** Read every article under `contentDir/{fr,en}`. */
export function readArticles(contentDir) {
  return LANGS.flatMap((lang) => {
    let files = [];
    try {
      files = readdirSync(join(contentDir, lang)).filter((name) => name.endsWith('.md'));
    } catch {
      return [];
    }
    return files.map((fileName) =>
      parseArticle(lang, fileName, readFileSync(join(contentDir, lang, fileName), 'utf8'))
    );
  });
}

const MARKER_LABELS = {
  sections: '## sections',
  keyfigures: ':::keyfigures blocks',
  cta: ':::cta blocks',
  pullQuotes: 'pull-quotes',
};

/**
 * Confront the FR and EN articles with the editorial charte.
 *
 * @param {object} io
 * @param {string} io.contentDir Absolute path to `src/content/blog`.
 * @param {string} io.routesFile Absolute path to `src/app/app.routes.ts`.
 * @returns {string[]} Human-readable problems; an empty array means everything checks out.
 */
export function checkBlogParity({ contentDir, routesFile }) {
  const articles = readArticles(contentDir);
  const routes = declaredRoutes(readFileSync(routesFile, 'utf8'));
  const problems = [];

  const bySlug = new Map(articles.map((article) => [`${article.lang}/${article.slug}`, article]));
  const other = (lang) => (lang === 'fr' ? 'en' : 'fr');

  for (const article of articles) {
    // ── Rules 6 & 7: one CTA, at most two callouts ────────────────────────────
    if (article.markers.cta > 1) {
      problems.push(`${article.id}: ${article.markers.cta} :::cta blocks (charte allows 1)`);
    }
    if (article.markers.callouts > 2) {
      problems.push(
        `${article.id}: ${article.markers.callouts} callouts (charte allows 2 at most)`
      );
    }

    // ── Dead internal links ───────────────────────────────────────────────────
    for (const href of article.links) {
      const [, lang, ...rest] = href.split('#')[0].split('?')[0].split('/');
      const path = rest.join('/').replace(/\/$/, '');
      if (path.startsWith('blog/')) {
        const target = bySlug.get(`${lang}/${path.slice('blog/'.length)}`);
        if (!target) {
          problems.push(`${article.id}: dead link ${href} (no ${lang} article with that slug)`);
        } else if (!article.draft && target.draft) {
          problems.push(
            `${article.id}: link ${href} targets a draft (${target.id}: ${target.draft})`
          );
        }
        continue;
      }
      if (!routes.has(path)) {
        problems.push(`${article.id}: dead link ${href} (no route '${path}' in app.routes.ts)`);
      }
    }

    // ── Rule 11: FR/EN parity ─────────────────────────────────────────────────
    if (!article.alternate) continue;
    const twin = bySlug.get(`${other(article.lang)}/${article.alternate}`);
    if (!twin) {
      problems.push(
        `${article.id}: alternate '${article.alternate}' has no ${other(article.lang)} article`
      );
      continue;
    }
    if (twin.alternate !== article.slug) {
      problems.push(
        `${article.id}: alternate is not reciprocal (${twin.id} points at '${twin.alternate}')`
      );
    }
    // Compare each pair once, from the FR side.
    if (article.lang !== 'fr') continue;
    for (const [key, label] of Object.entries(MARKER_LABELS)) {
      if (article.markers[key] !== twin.markers[key]) {
        problems.push(
          `${article.id} vs ${twin.id}: ${article.markers[key]} vs ${twin.markers[key]} ${label}`
        );
      }
    }
  }

  return problems;
}
