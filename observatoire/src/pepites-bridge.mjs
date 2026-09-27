// Observatoire — pont « pépites » (couche SÉLECTIVE) → schéma ObserveOffer.
//
// q135 : « Réorg pepites-job : enrichir métadonnées sans casser le tri sélectif
// des offres publiées. » Acceptance = chaque offre scannée taguée
// (techno / poste / séniorité / salaire / mode), couche publication INCHANGÉE.
//
// Principe (cadrage §1 « 2 couches, 1 seul scraping ») : la couche sélective
// possède déjà des métadonnées **curées à la main par Sara** (frontmatter des
// fiches `src/content/jobs/*.md`). Elles sont de meilleure qualité que
// n'importe quelle heuristique texte — donc ici :
//
//   frontmatter curé  >  heuristiques du normalizer  >  'inconnu'
//
// Le normalizer LARGE (`normalizer.mjs`) reste la seule source des heuristiques :
// aucune règle n'est dupliquée, on ne fait que **court-circuiter** celles dont
// la réponse est déjà connue de façon fiable.
//
// ⚠️ Ne JAMAIS fusionner la sortie de ce module avec le store marché LARGE :
// les pépites sont un échantillon ultra-trié, elles biaiseraient les stats
// (cadrage §1). Elles vivent dans leur propre fichier (`layer: "selective"`).
//
// Module pur, sans dépendance et sans I/O — la lecture des fichiers est faite
// par `ngdigest-front/scripts/tag-jobs-metadata.mjs`.
//
// by project-worker 2026-08-15

import {
  detectDevRel,
  detectPosteType,
  detectSeniority,
  detectTechno,
  detectRemote,
  fingerprintFor,
  parseSalary,
  detectTypeRecruteur,
} from './normalizer.mjs';

const lc = (s) => (s === null || s === undefined ? '' : String(s)).toLowerCase().trim();

/** Le frontmatter des pépites porte `remote: 100 | hybride | onsite`. */
export function remoteFromFrontmatter(value) {
  const v = lc(value);
  if (v === '100' || v === 'full' || v === 'remote') return 'full';
  if (v === 'hybride' || v === 'hybrid') return 'hybride';
  if (v === 'onsite' || v === 'présentiel' || v === 'presentiel') return 'onsite';
  return null;
}

/** `type: CDI | Freelance` (schéma des fiches pépites). */
export function contractFromFrontmatter(value) {
  const v = lc(value);
  if (v === 'cdi') return 'cdi';
  if (v === 'freelance' || v === 'indépendant' || v === 'independant') return 'freelance';
  if (v === 'cdd' || v === 'stage' || v === 'alternance') return 'autre';
  return null;
}

/** `zone: FR | EU | Worldwide` → enum du schéma (`WW`). */
export function zoneFromFrontmatter(value) {
  const v = lc(value);
  if (v === 'fr' || v === 'france') return 'FR';
  if (v === 'eu' || v === 'europe') return 'EU';
  if (v === 'worldwide' || v === 'ww' || v === 'monde') return 'WW';
  return null;
}

/**
 * `stack[]` est curée : elle tranche la techno sans ambiguïté quand elle
 * contient un framework front connu. Ordre Angular→React→Vue (angle éditorial),
 * identique au normalizer LARGE.
 */
export function technoFromStack(stack) {
  const items = (Array.isArray(stack) ? stack : []).map(lc);
  const has = (...names) => items.some((i) => names.some((n) => i === n || i.startsWith(`${n} `) || i.startsWith(`${n}(`)));
  if (has('angular', 'angularjs')) return 'angular';
  if (has('react', 'reactjs', 'react.js', 'react native')) return 'react';
  if (has('vue', 'vuejs', 'vue.js')) return 'vue';
  return null;
}

/** Plateforme d'origine déduite de l'URL externe de l'offre. */
export function sourceFromUrl(url) {
  const u = lc(url);
  if (!u) return 'autre';
  if (u.includes('welcometothejungle')) return 'wttj';
  if (u.includes('linkedin.')) return 'linkedin';
  if (u.includes('free-work.')) return 'free-work';
  if (u.includes('apec.fr')) return 'apec';
  if (u.includes('francetravail.') || u.includes('pole-emploi.')) return 'france-travail';
  return 'autre';
}

/**
 * Tague une fiche pépite (frontmatter déjà parsé) au schéma ObserveOffer.
 *
 * @param {object} fm       frontmatter de `src/content/jobs/<fichier>.md`
 * @param {object} [opts]   { scannedAt } pour figer la date en test
 * @returns {import('../schema/offer-metadata.types').ObserveOffer}
 */
export function tagPepite(fm, opts = {}) {
  const frontmatter = fm || {};

  // ⚠️ Deux portées de texte, et c'est volontaire.
  //
  // `structuredText` = signaux CURÉS (intitulé exact, stack, tags, lieu). Pas de
  // prose : chaque mot y est descriptif du poste.
  //
  // `proseText` = notes éditoriales de Sara. Elles sont utiles mais **argumentées**,
  // donc pleines de négations : « position 100% frontend (pas fullstack imposé) »,
  // « 100% frontend, pas mixé back ». Un détecteur par mots-clés y lit « fullstack »
  // et classe l'offre à l'envers — cas réel constaté sur la fiche Aircall.
  // → la prose ne sert donc PAS à classer techno / posteType / séniorité.
  //   Elle n'alimente que le mode de travail (formulations chiffrées et peu
  //   ambiguës : « 3 jours sur site ») et le repérage DevRel, plus l'extrait
  //   `raw` d'audit.
  const structuredText = [
    frontmatter.title,
    Array.isArray(frontmatter.stack) ? frontmatter.stack.join(' ') : frontmatter.stack,
    Array.isArray(frontmatter.tags) ? frontmatter.tags.join(' ') : frontmatter.tags,
    frontmatter.location,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const proseText = [frontmatter.editorialHook, frontmatter.editorialNote]
    .filter(Boolean)
    .join(' ')
    .trim();

  const text = [structuredText, proseText].filter(Boolean).join(' ').trim();

  const scannedAt =
    toIsoDate(frontmatter.scannedAt) || opts.scannedAt || new Date().toISOString().slice(0, 10);

  // --- mode de travail : frontmatter d'abord, sinon heuristique texte --------
  const fmRemote = remoteFromFrontmatter(frontmatter.remote);
  const detected = detectRemote(text);
  const remote = fmRemote || detected.remote;
  // Les jours de bureau ne sont pertinents qu'en hybride ; ils ne sont jamais
  // dans le frontmatter → seule l'heuristique peut les fournir.
  const officeDaysPerWeek = remote === 'hybride' ? detected.officeDaysPerWeek : null;

  // --- rémunération : les 2 champs curés `salary` / `tjm` ------------------
  // On les parse SÉPARÉMENT pour ne pas mélanger un montant annuel et un TJM
  // dans la même passe de chiffres.
  const salaryParsed = frontmatter.salary ? parseSalary(String(frontmatter.salary)) : null;
  const tjmParsed = frontmatter.tjm ? parseSalary(`TJM ${frontmatter.tjm}`) : null;

  const city = frontmatter.location ? String(frontmatter.location).trim() : null;
  const zone = zoneFromFrontmatter(frontmatter.zone) || 'inconnu';

  return {
    fingerprint: fingerprintFor({
      sourceId: null,
      company: frontmatter.company,
      title: frontmatter.title,
      city,
    }),
    // La fiche pépite n'expose pas l'id natif de la plateforme (l'URL, oui).
    sourceId: null,
    source: sourceFromUrl(frontmatter.url),
    scannedAt,
    firstSeen: scannedAt,
    lastSeen: scannedAt,
    title: frontmatter.title ? String(frontmatter.title) : null,
    company: frontmatter.company ? String(frontmatter.company) : null,
    techno: technoFromStack(frontmatter.stack) || detectTechno(structuredText),
    posteType: detectPosteType(structuredText),
    seniority: detectSeniority(structuredText),
    remote,
    officeDaysPerWeek,
    zone,
    city,
    contractType: contractFromFrontmatter(frontmatter.type) || 'inconnu',
    salaryMin: salaryParsed ? salaryParsed.salaryMin : null,
    salaryMax: salaryParsed ? salaryParsed.salaryMax : null,
    tjmMin: tjmParsed ? tjmParsed.tjmMin : null,
    tjmMax: tjmParsed ? tjmParsed.tjmMax : null,
    typeRecruteur: detectTypeRecruteur(frontmatter.company, text),
    isDevRel: detectDevRel(text),
    raw: text.slice(0, 2000) || null,
  };
}

/** Une date YAML peut arriver en objet Date ou en chaîne. */
export function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

/**
 * Enveloppe de sortie. L'`ObserveOffer` reste strictement conforme au schéma
 * (`additionalProperties: false`) : tout ce qui est propre à la couche
 * sélective (slug, statut publié, URL) vit dans l'enveloppe, pas dedans.
 */
export function buildPepitesIndex(entries, opts = {}) {
  const generatedAt = opts.generatedAt || new Date().toISOString().slice(0, 10);
  const offers = entries.map(({ file, frontmatter }) => ({
    file,
    slug: frontmatter?.slug ?? null,
    status: frontmatter?.status ?? null,
    url: frontmatter?.url ?? null,
    metadata: tagPepite(frontmatter, opts),
  }));
  offers.sort((a, b) => String(b.metadata.scannedAt).localeCompare(String(a.metadata.scannedAt)));
  return {
    layer: 'selective',
    generatedAt,
    warning:
      "Échantillon ULTRA-TRIÉ (pépites publiées). Ne JAMAIS fusionner avec le store marché LARGE : les stats de l'observatoire seraient biaisées (cadrage §1).",
    counts: {
      total: offers.length,
      active: offers.filter((o) => o.status === 'active').length,
      expired: offers.filter((o) => o.status === 'expired').length,
    },
    offers,
  };
}
