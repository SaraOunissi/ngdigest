/**
 * Heuristics that reject non-article pages (listing / navigation / index pages)
 * before they are scored and stored as resources.
 *
 * Why: fetchers — SerpAPI in particular — surface whatever Google has indexed on
 * a trusted domain. Listing pages such as the Angular blog's "Latest" tab
 * (https://blog.angular.dev/latest, page title "Latest"), tag pages, author
 * profiles and homepages live on a trusted domain (+3) and are "recent" (+1), so
 * they reach the relevance threshold and get published as if they were articles.
 * A reader reported the "Latest" page showing up in the digest — these guards
 * keep that class of page out.
 */

/** Path segments that mark a listing / navigation page rather than an article. */
const NON_ARTICLE_PATH_SEGMENTS: ReadonlySet<string> = new Set([
  'latest',
  'tag',
  'tags',
  'tagged',
  'category',
  'categories',
  'topic',
  'topics',
  'archive',
  'archives',
  'author',
  'authors',
  'page',
  'pages',
  'search',
  'about',
  'feed',
  'feeds',
  'rss',
  'atom',
  'newsletter',
  'newsletters',
  'subscribe',
  'sitemap',
]);

/** Whole-title labels that are navigation chrome, never a real article title. */
const NON_ARTICLE_TITLES: ReadonlySet<string> = new Set([
  'latest',
  'home',
  'homepage',
  'blog',
  'archive',
  'archives',
  'tags',
  'categories',
  'topics',
  'newsletter',
  'about',
  'all posts',
  'recent posts',
]);

/**
 * Returns true when the (url, title) pair looks like an individual article and
 * false when it looks like a listing / navigation / index page.
 */
export function isLikelyArticle(
  url: string | undefined,
  title: string | undefined,
): boolean {
  if (!url || !title) return false;

  if (NON_ARTICLE_TITLES.has(title.trim().toLowerCase())) return false;

  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return false;
  }

  const segments = pathname.split('/').filter(Boolean);

  // Domain root (homepage) is a listing, not an article.
  if (segments.length === 0) return false;

  // Medium author *profile* page is a bare /@username. Note that a real Medium
  // article also lives under the handle as /@username/article-slug, so only the
  // single-segment form is a listing — don't reject the article form.
  if (segments.length === 1 && segments[0].startsWith('@')) return false;

  return !segments.some((segment) =>
    NON_ARTICLE_PATH_SEGMENTS.has(segment.toLowerCase()),
  );
}
