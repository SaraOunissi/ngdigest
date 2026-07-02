// Observatoire — normalizer. Pure functions that classify a raw job offer into
// the frozen ObserveOffer schema (see ../schema/offer-metadata.schema.json).
// Framework-agnostic ESM so it runs with plain `node` and is trivial to port
// into the NestJS observatoire module later.
// by project-worker 2026-06-14

import { createHash } from 'node:crypto';

const lc = (s) => (s || '').toString().toLowerCase();

// Unicode-safe word test: ASCII \b breaks around accented FR words
// ("confirmé.", "sénior") because é ∉ \w. Use letter lookarounds with the u flag
// so "confirmé" matches but "doctolib" does NOT match the seed "octo".
export function hasWord(text, words) {
  const alt = (Array.isArray(words) ? words : [words])
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alt})(?![\\p{L}\\p{N}])`, 'iu').test(text || '');
}

// --- techno -----------------------------------------------------------------
export function detectTechno(text) {
  const t = lc(text);
  // Honest tagging: only tag a techno if its word actually appears. When several
  // appear we keep the first found in Angular→React→Vue order (editorial angle),
  // but stats stay representative because the LARGE layer is unfiltered.
  if (hasWord(t, ['angular', 'angularjs'])) return 'angular';
  if (hasWord(t, ['react', 'reactjs', 'react.js', 'react native'])) return 'react';
  if (hasWord(t, ['vue', 'vuejs', 'vue.js', 'vue 3'])) return 'vue';
  return 'autre';
}

// --- posteType --------------------------------------------------------------
export function detectPosteType(text) {
  const t = lc(text).replace(/[-\s]?end\b/g, 'end'); // normalize "front-end"/"front end"→"frontend"
  const fullstack = hasWord(t, ['fullstack', 'full-stack', 'full stack']) || /full[\s-]?stack/i.test(lc(text));
  const back = hasWord(t, ['backend', 'back']);
  const front = hasWord(t, ['frontend', 'front']);
  if (fullstack) return 'fullstack';
  if (front && !back) return 'front';
  if (back && !front) return 'back';
  if (front && back) return 'fullstack';
  return 'inconnu';
}

// --- seniority --------------------------------------------------------------
export function detectSeniority(text) {
  const t = lc(text);
  if (hasWord(t, ['lead', 'tech lead', 'team lead', 'principal', 'staff'])) return 'lead';
  if (hasWord(t, ['senior', 'sénior', 'expert'])) return 'senior';
  if (hasWord(t, ['junior', 'débutant', 'jeune diplômé'])) return 'junior';
  if (hasWord(t, ['confirmé', 'confirme', 'intermédiaire', 'mid-level', 'mid level'])) return 'confirme';
  // years-of-experience heuristic
  const m = t.match(/(\d{1,2})\s*(?:\+|ans?|years?)\s*(?:d['e ]?(?:expérience|exp))?/);
  if (m) {
    const y = parseInt(m[1], 10);
    if (y <= 2) return 'junior';
    if (y <= 5) return 'confirme';
    if (y <= 8) return 'senior';
    return 'lead';
  }
  return 'inconnu';
}

// --- remote + office days ---------------------------------------------------
export function detectRemote(text) {
  const t = lc(text);
  if (/\b(100\s*%?\s*(remote|télétravail)|full[\s-]?remote|télétravail total|fully remote)\b/.test(t)) {
    return { remote: 'full', officeDaysPerWeek: null };
  }
  if (/\b(hybride|hybrid|télétravail partiel|partiel)\b/.test(t) || /\d\s*jours?\s*(?:sur site|présentiel|au bureau|de présence)/.test(t)) {
    let officeDaysPerWeek = null;
    const m = t.match(/(\d)\s*jours?\s*(?:sur site|présentiel|au bureau|de présence)/);
    if (m) officeDaysPerWeek = parseInt(m[1], 10);
    return { remote: 'hybride', officeDaysPerWeek };
  }
  if (/\b(présentiel|sur site|on[\s-]?site|aucun télétravail|pas de télétravail)\b/.test(t)) {
    return { remote: 'onsite', officeDaysPerWeek: null };
  }
  if (/\b(remote|télétravail)\b/.test(t)) {
    // mentions remote but not quantified → treat as hybride (conservative)
    return { remote: 'hybride', officeDaysPerWeek: null };
  }
  return { remote: 'inconnu', officeDaysPerWeek: null };
}

// --- contract ---------------------------------------------------------------
export function detectContract(text, ftContractCode) {
  const code = lc(ftContractCode);
  if (code === 'cdi') return 'cdi';
  if (code === 'lib' || code === 'fra') return 'freelance';
  const t = lc(text);
  if (hasWord(t, ['freelance', 'indépendant', 'portage', 'mission'])) return 'freelance';
  if (hasWord(t, ['cdi', 'permanent'])) return 'cdi';
  if (hasWord(t, ['cdd', 'stage', 'alternance', 'apprentissage'])) return 'autre';
  return 'inconnu';
}

// --- salary / TJM normalization --------------------------------------------
// Accepts "65k-90k€", "65 000 - 90 000 €", "550€/j", "TJM 550-650".
export function parseSalary(text) {
  const t = lc(text).replace(/ /g, ' ');
  const isTjm = /\btjm\b|€\s*\/\s*j|euros?\s*\/\s*jour|par jour|\/jour/.test(t);
  const nums = [];
  const re = /(\d{1,3}(?:[ .]\d{3})+|\d{1,3})\s*(k)?/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    let n = parseInt(m[1].replace(/[ .]/g, ''), 10);
    if (m[2] === 'k') n *= 1000;
    if (!Number.isNaN(n)) nums.push(n);
  }
  if (isTjm) {
    const tjm = nums.filter((n) => n >= 200 && n <= 2000);
    if (tjm.length === 0) return { salaryMin: null, salaryMax: null, tjmMin: null, tjmMax: null };
    return { salaryMin: null, salaryMax: null, tjmMin: Math.min(...tjm), tjmMax: Math.max(...tjm) };
  }
  const sal = nums.filter((n) => n >= 18000 && n <= 250000);
  if (sal.length === 0) return { salaryMin: null, salaryMax: null, tjmMin: null, tjmMax: null };
  return { salaryMin: Math.min(...sal), salaryMax: Math.max(...sal), tjmMin: null, tjmMax: null };
}

// --- typeRecruteur ----------------------------------------------------------
// Seed list of well-known FR ESN / digital consultancies. Matched by whole word
// (see hasWord), so short tokens only hit when they stand alone. Sara extends
// this over time (cadrage §9). Deliberately excludes ambiguous common-word
// tokens (e.g. "smile" is kept as it is a real ESN, but no 2-letter acronyms).
const ESN_NAMES = [
  // historical / large-cap
  'capgemini', 'sopra steria', 'sopra', 'atos', 'cgi', 'accenture', 'sogeti',
  'devoteam', 'inetum', 'gfi', 'alten', 'akka', 'akkodis', 'expleo', 'segula',
  'assystem', 'ausy', 'astek', 'scalian', 'sii', 'aubay', 'sqli', 'econocom',
  'sword', 'viseo', 'hardis',
  // digital / product studios & mid-cap consultancies
  'umanis', 'micropole', 'keyrus', 'talan', 'onepoint', 'wavestone', 'norsys',
  'zenika', 'ippon', 'octo', 'xebia', 'sfeir', 'ineat', 'cellenza', 'meritis',
  'davidson', 'mc2i', 'aneo', 'neoxia', 'younup', 'niji', 'smile', 'linagora',
  'extia', 'alteca', 'theodo', 'padok', 'jems', 'invivoo',
];
const CABINET_KW = /\b(recrutement|recruitment|cabinet|staffing|chasseur de tête|portage|esn|ssii)\b/;

export function detectTypeRecruteur(company, text) {
  const c = lc(company);
  // word-boundary match so "Octo" hits but "dOCTOlib" does not
  if (c && hasWord(c, ESN_NAMES)) return 'esn';
  if (CABINET_KW.test(c)) {
    return /esn|ssii|portage/.test(c) ? 'esn' : 'cabinet-recrutement';
  }
  if (CABINET_KW.test(lc(text)) && !c) return 'cabinet-recrutement';
  if (c) return 'client-final';
  return 'inconnu';
}

// --- DevRel -----------------------------------------------------------------
export function detectDevRel(text) {
  const t = lc(text);
  return /\bdev\s?rel\b|developer relations|developer advocate|developer advocacy|technical advocate|community engineer|developer experience engineer|\bdx engineer\b/.test(t);
}

// --- zone / city ------------------------------------------------------------
// Curated to unambiguous city tokens: matched by whole word (hasWord), so we
// avoid short names that are also common French words (e.g. "tours", "pau").
const FR_CITIES = [
  'paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'lille', 'nantes',
  'nice', 'rennes', 'strasbourg', 'montpellier', 'grenoble', 'dijon', 'angers',
  'reims', 'clermont-ferrand', 'nancy', 'metz', 'caen', 'brest', 'rouen',
  'mulhouse', 'villeurbanne', 'annecy', 'avignon', 'limoges', 'besançon',
  'aix-en-provence', 'sophia antipolis',
];
export function detectZoneCity(text, ftCity) {
  const t = lc(text);
  let city = ftCity ? ftCity.trim() : null;
  if (!city) {
    // Whole-word match (accent-safe) so "contours"/"parcours" don't leak a city.
    const found = FR_CITIES.find((c) => hasWord(t, c));
    if (found) city = found.charAt(0).toUpperCase() + found.slice(1);
  }
  let zone = 'inconnu';
  if (/\bfrance\b|\bfr\b/.test(t) || (city && FR_CITIES.includes(lc(city)))) zone = 'FR';
  else if (/\beurope\b|\beu\b|\bemea\b/.test(t)) zone = 'EU';
  else if (/\bworldwide\b|\bw* remote\b|\banywhere\b/.test(t)) zone = 'WW';
  if (/\bremote\s+(?:fr|france)\b/.test(t)) { zone = 'FR'; city = city || 'Remote FR'; }
  return { zone, city };
}

// --- fingerprint ------------------------------------------------------------
export function fingerprintFor({ sourceId, company, title, city }) {
  if (sourceId) return String(sourceId);
  const basis = `${lc(company)}|${lc(title)}|${lc(city)}`;
  return createHash('sha1').update(basis).digest('hex').slice(0, 16);
}

/**
 * Normalize a raw offer (loose shape, France-Travail-friendly) into ObserveOffer.
 * @param {object} raw  { sourceId, source, title, company, description, city, contractCode, scannedAt }
 * @returns {import('../schema/offer-metadata.types').ObserveOffer}
 */
export function normalizeOffer(raw) {
  const text = `${raw.title || ''} ${raw.description || ''}`;
  const scannedAt = raw.scannedAt || new Date().toISOString().slice(0, 10);
  const { remote, officeDaysPerWeek } = detectRemote(text);
  const { zone, city } = detectZoneCity(text, raw.city);
  const sal = parseSalary(`${text} ${raw.salaryText || ''}`);
  const fingerprint = fingerprintFor({
    sourceId: raw.sourceId,
    company: raw.company,
    title: raw.title,
    city,
  });
  return {
    fingerprint,
    sourceId: raw.sourceId || null,
    source: raw.source || 'france-travail',
    scannedAt,
    firstSeen: raw.firstSeen || scannedAt,
    lastSeen: scannedAt,
    title: raw.title || null,
    company: raw.company || null,
    techno: detectTechno(text),
    posteType: detectPosteType(text),
    seniority: detectSeniority(text),
    remote,
    officeDaysPerWeek,
    zone,
    city,
    contractType: detectContract(text, raw.contractCode),
    salaryMin: sal.salaryMin,
    salaryMax: sal.salaryMax,
    tjmMin: sal.tjmMin,
    tjmMax: sal.tjmMax,
    typeRecruteur: detectTypeRecruteur(raw.company, text),
    isDevRel: detectDevRel(text),
    raw: text.trim().slice(0, 2000) || null,
  };
}
