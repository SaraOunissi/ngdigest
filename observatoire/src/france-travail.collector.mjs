// Observatoire — France Travail collector. The LEGAL socle (cadrage §9):
// official, free, real-time, stable id per offer (easy dedup).
// API: "Offres d'emploi v2" on francetravail.io. OAuth2 client_credentials.
//
// Credential-gated: if FT_CLIENT_ID / FT_CLIENT_SECRET are absent, the collector
// reports clearly and exits (no crash) so the rest of the pipeline runs on
// fixtures. Sara registers an app on francetravail.io and plugs the 2 env vars.
// by project-worker 2026-06-14

const TOKEN_URL =
  'https://entreprise.francetravail.io/connexion/oauth2/access_token?realm=%2Fpartenaire';
const SEARCH_URL = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search';

/** Default search queries for the LARGE layer (broad, unfiltered FR front/web). */
export const DEFAULT_QUERIES = [
  'développeur angular',
  'développeur react',
  'développeur vue',
  'développeur front-end',
  'développeur fullstack',
  'developer relations',
];

export function hasCredentials(env = process.env) {
  return Boolean(env.FT_CLIENT_ID && env.FT_CLIENT_SECRET);
}

async function getToken(env) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.FT_CLIENT_ID,
    client_secret: env.FT_CLIENT_SECRET,
    // scope required by France Travail for the offers API
    scope: 'api_offresdemploiv2 o2dsoffre',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`FT token error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.access_token;
}

/** Map a raw France Travail offer object to the loose shape normalizeOffer expects. */
export function ftToLoose(offer, scannedAt) {
  return {
    sourceId: offer.id,
    source: 'france-travail',
    title: offer.intitule,
    company: offer.entreprise?.nom || null,
    description: offer.description || '',
    salaryText: offer.salaire?.libelle || '',
    city: offer.lieuTravail?.libelle || null,
    contractCode: offer.typeContrat || '', // CDI, MIS, LIB...
    scannedAt,
  };
}

/**
 * Fetch one page (max 150) of offers for a query. Returns raw FT offers.
 * `range` follows FT pagination: "0-149".
 */
async function searchPage(token, query, range) {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('motsCles', query);
  url.searchParams.set('range', range);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`FT search error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.resultats || [];
}

/**
 * Collect offers across DEFAULT_QUERIES (1 page each by default — courteous).
 * Returns { offers: loose[], queries, offersFound } or throws.
 */
export async function collect({ env = process.env, queries = DEFAULT_QUERIES, scannedAt } = {}) {
  if (!hasCredentials(env)) {
    return {
      skipped: true,
      reason:
        'FT_CLIENT_ID / FT_CLIENT_SECRET absent — register an app on francetravail.io ' +
        '("API Offres d\'emploi v2") and set both env vars. Pipeline runs on fixtures meanwhile.',
      offers: [],
      queries,
      offersFound: 0,
    };
  }
  const date = scannedAt || new Date().toISOString().slice(0, 10);
  const token = await getToken(env);
  const all = [];
  for (const q of queries) {
    const raw = await searchPage(token, q, '0-149');
    for (const o of raw) all.push(ftToLoose(o, date));
  }
  // de-dup by sourceId within this run (same offer can match several queries)
  const seen = new Set();
  const offers = all.filter((o) => (seen.has(o.sourceId) ? false : seen.add(o.sourceId)));
  return { skipped: false, offers, queries, offersFound: offers.length };
}
