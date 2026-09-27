// by project-worker 2026-08-22
/**
 * Tests for the FR/EN blog parity + dead-link guard (q179).
 * Run: `npm run test:scripts` (or `npm run check:blog-parity`).
 *
 * The last test is the one that matters day-to-day: it runs the guard against the
 * real repository, so a section added in FR and forgotten in EN — or a `/fr/carriere/...`
 * link typed by hand towards a route that does not exist — turns red here instead of
 * turning into a half-translated page or a 404 in production.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  checkBlogParity,
  countMarkers,
  declaredRoutes,
  internalLinks,
  parseArticle,
  splitFrontmatter,
} from './blog-parity.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const frontRoot = join(here, '..', '..');
const REAL_CONTENT = join(frontRoot, 'src', 'content', 'blog');
const REAL_ROUTES = join(frontRoot, 'src', 'app', 'app.routes.ts');

const ROUTES_FIXTURE = `
  { path: 'carriere/toolkit', component: ToolkitComponent },
  { path: 'blog/:slug', component: BlogPostComponent },
`;

/** Minimal article body honouring the charte, with knobs for each marker. */
function body({
  sections = 2,
  keyfigures = 1,
  cta = 1,
  quotes = 1,
  callouts = 1,
  links = [],
} = {}) {
  const parts = ['Intro paragraph.'];
  for (let i = 0; i < sections; i += 1) parts.push(`## Section ${i + 1}\n\nSome text.`);
  for (let i = 0; i < keyfigures; i += 1) parts.push(':::keyfigures Title\n- gold | 1 | one\n:::');
  for (let i = 0; i < callouts; i += 1) parts.push(':::warn Heads up\nBody.\n:::');
  for (let i = 0; i < quotes; i += 1) parts.push('> A strong line.\n> Still the same quote.');
  for (let i = 0; i < cta; i += 1) parts.push(':::cta A | B | C | https://ngdigest.co\n:::');
  for (const href of links) parts.push(`See [this](${href}).`);
  return parts.join('\n\n');
}

function article({ slug, alternate, lang, ...knobs }) {
  return `---\ntitle: "T"\nslug: "${slug}"\ndescription: "D"\ndate: "2026-08-22"\nauthor: "Sara Ounissi"\nlang: "${lang}"\nalternate: "${alternate}"\n---\n\n${body(knobs)}\n`;
}

/** Builds a throwaway `content/blog/{fr,en}` tree plus a routes file. */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'blog-parity-'));
  const contentDir = join(root, 'blog');
  for (const lang of ['fr', 'en']) mkdirSync(join(contentDir, lang), { recursive: true });
  for (const [relative, content] of Object.entries(files)) {
    writeFileSync(join(contentDir, relative), content, 'utf8');
  }
  const routesFile = join(root, 'app.routes.ts');
  writeFileSync(routesFile, ROUTES_FIXTURE, 'utf8');
  return { root, contentDir, routesFile };
}

// ── Parsing helpers ─────────────────────────────────────────────────────────

test('splitFrontmatter separates the frontmatter block from the body', () => {
  const { frontmatter, body: content } = splitFrontmatter('---\nslug: "a"\n---\n\nHello.\n');
  assert.match(frontmatter, /slug: "a"/);
  assert.equal(content.trim(), 'Hello.');
});

test('countMarkers counts a multi-line blockquote as one pull-quote', () => {
  const markers = countMarkers('> line one\n> line two\n\ntext\n\n> another quote');
  assert.equal(markers.pullQuotes, 2);
});

test('countMarkers ignores `##` inside prose and counts the directives', () => {
  const markers = countMarkers(body({ sections: 3, keyfigures: 2, cta: 1, callouts: 2 }));
  assert.deepEqual(
    { sections: markers.sections, keyfigures: markers.keyfigures, callouts: markers.callouts },
    { sections: 3, keyfigures: 2, callouts: 2 }
  );
});

test('internalLinks only picks up /fr and /en targets', () => {
  const links = internalLinks('[a](/fr/carriere/toolkit) [b](https://x.com) [c](/en/blog/slug)');
  assert.deepEqual(links, ['/fr/carriere/toolkit', '/en/blog/slug']);
});

test('declaredRoutes reads the path literals of app.routes.ts', () => {
  assert.ok(declaredRoutes(ROUTES_FIXTURE).has('carriere/toolkit'));
});

test('parseArticle reports the draft gate reason', () => {
  const parsed = parseArticle(
    'fr',
    'draft-x.md',
    article({ slug: 'x', alternate: 'y', lang: 'fr' })
  );
  assert.equal(parsed.draft, 'draft- file name prefix');
  assert.equal(parsed.slug, 'x');
});

// ── The guard itself ────────────────────────────────────────────────────────

test('a well-formed FR/EN pair raises nothing', () => {
  const fx = fixture({
    'fr/a.md': article({ slug: 'a', alternate: 'b', lang: 'fr', links: ['/fr/carriere/toolkit'] }),
    'en/b.md': article({ slug: 'b', alternate: 'a', lang: 'en', links: ['/en/blog/b'] }),
  });
  try {
    assert.deepEqual(checkBlogParity(fx), []);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test('a section added on one side only is caught', () => {
  const fx = fixture({
    'fr/a.md': article({ slug: 'a', alternate: 'b', lang: 'fr', sections: 3 }),
    'en/b.md': article({ slug: 'b', alternate: 'a', lang: 'en', sections: 2 }),
  });
  try {
    const problems = checkBlogParity(fx);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /3 vs 2 ## sections/);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test('a missing pull-quote and a duplicated CTA are both caught', () => {
  const fx = fixture({
    'fr/a.md': article({ slug: 'a', alternate: 'b', lang: 'fr', quotes: 2, cta: 2 }),
    'en/b.md': article({ slug: 'b', alternate: 'a', lang: 'en', quotes: 1, cta: 1 }),
  });
  try {
    const problems = checkBlogParity(fx).join('\n');
    assert.match(problems, /2 :::cta blocks \(charte allows 1\)/);
    assert.match(problems, /2 vs 1 pull-quotes/);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test('a non-reciprocal alternate is caught in both directions', () => {
  const fx = fixture({
    'fr/a.md': article({ slug: 'a', alternate: 'b', lang: 'fr' }),
    'en/b.md': article({ slug: 'b', alternate: 'typo', lang: 'en' }),
  });
  try {
    const problems = checkBlogParity(fx).join('\n');
    assert.match(problems, /alternate is not reciprocal/);
    assert.match(problems, /alternate 'typo' has no fr article/);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test('a link to an unknown route or an unknown slug is reported as dead', () => {
  const fx = fixture({
    'fr/a.md': article({
      slug: 'a',
      alternate: 'b',
      lang: 'fr',
      links: ['/fr/carriere/tolkit', '/fr/blog/nope'],
    }),
    'en/b.md': article({ slug: 'b', alternate: 'a', lang: 'en' }),
  });
  try {
    const problems = checkBlogParity(fx).join('\n');
    assert.match(problems, /dead link \/fr\/carriere\/tolkit \(no route 'carriere\/tolkit'/);
    assert.match(problems, /dead link \/fr\/blog\/nope \(no fr article with that slug\)/);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test('a published article linking to a draft is flagged, a draft linking to a draft is not', () => {
  const published = fixture({
    'fr/a.md': article({ slug: 'a', alternate: 'b', lang: 'fr', links: ['/fr/blog/wip'] }),
    'en/b.md': article({ slug: 'b', alternate: 'a', lang: 'en' }),
    'fr/draft-wip.md': article({ slug: 'wip', alternate: '', lang: 'fr' }),
  });
  try {
    assert.match(checkBlogParity(published).join('\n'), /targets a draft/);
  } finally {
    rmSync(published.root, { recursive: true, force: true });
  }

  const draft = fixture({
    'fr/draft-a.md': article({ slug: 'a', alternate: 'b', lang: 'fr', links: ['/fr/blog/wip'] }),
    'en/draft-b.md': article({ slug: 'b', alternate: 'a', lang: 'en' }),
    'fr/draft-wip.md': article({ slug: 'wip', alternate: '', lang: 'fr' }),
  });
  try {
    assert.deepEqual(checkBlogParity(draft), []);
  } finally {
    rmSync(draft.root, { recursive: true, force: true });
  }
});

test('an empty content directory is not an error', () => {
  const fx = fixture({});
  try {
    assert.deepEqual(checkBlogParity(fx), []);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

// ── The real repository ─────────────────────────────────────────────────────

/**
 * Deviations that already existed when this guard was written (2026-08-22), kept
 * explicit so the suite can stay green while still turning red on anything NEW.
 *
 * The one entry below is a real content bug, not a false positive: the EN version of
 * the flagship rate article never received the `## Mise à jour mai 2026 — Barème
 * actualisé` section, so english readers have been served the pre-May figures. Fixing
 * it means translating that section (native EN review is already tracked by q177) —
 * editorial work, out of scope for a guard. Once it is translated, the last test below
 * will ask for this entry to be deleted.
 */
const KNOWN_DEVIATIONS = [
  'fr/tjm-developpeur-angular-2026.md vs en/angular-developer-daily-rate-2026.md: 12 vs 11 ## sections',
  'fr/tjm-developpeur-angular-2026.md vs en/angular-developer-daily-rate-2026.md: 7 vs 5 pull-quotes',
];

test('the real blog content raises no NEW parity or dead-link problem', () => {
  const problems = checkBlogParity({ contentDir: REAL_CONTENT, routesFile: REAL_ROUTES });
  const unexpected = problems.filter((problem) => !KNOWN_DEVIATIONS.includes(problem));
  assert.deepEqual(unexpected, [], `blog charte violations:\n${unexpected.join('\n')}`);
});

test('every known deviation is still real (delete the entry once fixed)', () => {
  const problems = checkBlogParity({ contentDir: REAL_CONTENT, routesFile: REAL_ROUTES });
  const stale = KNOWN_DEVIATIONS.filter((known) => !problems.includes(known));
  assert.deepEqual(stale, [], `fixed — remove from KNOWN_DEVIATIONS:\n${stale.join('\n')}`);
});
