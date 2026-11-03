/**
 * Outil « Ma version d'Angular est-elle encore supportée ? » — logique pure, sans Angular.
 *
 * Politique officielle (https://angular.dev/reference/releases, relue le 2026-11-03) :
 * une majeure environ tous les 12 mois depuis la v22 (tous les 6 mois avant),
 * 12 mois de support actif puis 12 mois de LTS (correctifs critiques et de sécurité
 * seulement). Les dates de chaque version viennent du fichier généré au build ;
 * le statut est toujours recalculé à partir de la date du jour.
 */

export interface AngularCycle {
  readonly major: number;
  /** Dates ISO `AAAA-MM-JJ`. */
  readonly releaseDate: string;
  readonly activeSupportEnd: string;
  readonly ltsEnd: string;
  /** Dernier correctif publié pour cette majeure, ex. `20.3.34`. */
  readonly latest: string;
  readonly latestReleaseDate: string | null;
}

export interface AngularReleasesData {
  /** Date de collecte `AAAA-MM-JJ`. */
  readonly fetchedAt: string;
  readonly source: string;
  /** Du plus récent au plus ancien. */
  readonly cycles: readonly AngularCycle[];
}

export type SupportStatus = 'active' | 'lts' | 'eol';

/** Fenêtre (en jours) sous laquelle une fin de LTS devient urgente. */
export const ENDING_SOON_DAYS = 90;

/**
 * Prochaines versions annoncées par angular.dev (tableau « release schedule »).
 * Absentes de la source automatique : relues à la main, d'où `RELEASE_SCHEDULE_CHECKED_ON`
 * affichée sur la page. Une ligne passée disparaît d'elle-même (cf. `upcomingReleases`).
 */
export interface UpcomingRelease {
  readonly version: string;
  /** Premier jour de la période annoncée (`AAAA-MM-JJ`) ; `approximate` = « ~ mois ». */
  readonly date: string;
  readonly approximate: boolean;
  readonly major: boolean;
}

export const RELEASE_SCHEDULE_CHECKED_ON = '2026-11-03';

export const RELEASE_SCHEDULE: readonly UpcomingRelease[] = [
  { version: '22.3', date: '2026-11-01', approximate: true, major: false },
  { version: '22.4', date: '2027-01-01', approximate: true, major: false },
  { version: '22.5', date: '2027-03-01', approximate: true, major: false },
  { version: '23.0', date: '2027-06-01', approximate: true, major: true },
];

export interface CycleStatus {
  readonly cycle: AngularCycle;
  readonly status: SupportStatus;
  /** Jours jusqu'à la fin du support actif (si actif) ou de la LTS (si LTS) ; 0 si fin de vie. */
  readonly daysLeft: number;
  /** Jours écoulés depuis la fin de vie (0 sinon). */
  readonly daysSinceEol: number;
  readonly endingSoon: boolean;
}

/** Nombre de jours entiers entre deux dates ISO (UTC), positif si `to` est après `from`. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Date du jour `AAAA-MM-JJ` (heure de Paris : l'audience est d'abord française). */
export function isoToday(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function statusOn(cycle: AngularCycle, today: string): CycleStatus {
  if (today < cycle.activeSupportEnd) {
    return { cycle, status: 'active', daysLeft: daysBetween(today, cycle.activeSupportEnd), daysSinceEol: 0, endingSoon: false };
  }
  if (today < cycle.ltsEnd) {
    const daysLeft = daysBetween(today, cycle.ltsEnd);
    return { cycle, status: 'lts', daysLeft, daysSinceEol: 0, endingSoon: daysLeft <= ENDING_SOON_DAYS };
  }
  return { cycle, status: 'eol', daysLeft: 0, daysSinceEol: daysBetween(cycle.ltsEnd, today), endingSoon: false };
}

export function allStatuses(data: AngularReleasesData, today: string): CycleStatus[] {
  return data.cycles.map((cycle) => statusOn(cycle, today));
}

/** Versions encore couvertes (actif ou LTS), de la plus récente à la plus ancienne. */
export function supportedCycles(data: AngularReleasesData, today: string): CycleStatus[] {
  return allStatuses(data, today).filter((entry) => entry.status !== 'eol');
}

/** La plus récente version publiée (déjà sortie à la date donnée). */
export function latestCycle(data: AngularReleasesData, today: string): AngularCycle {
  const released = data.cycles.filter((cycle) => cycle.releaseDate <= today);
  return released.reduce((best, cycle) => (cycle.major > best.major ? cycle : best), released[0] ?? data.cycles[0]);
}

/** Version présélectionnée : la plus ancienne encore couverte, la plus utile à vérifier. */
export function defaultMajor(data: AngularReleasesData, today: string): number {
  const supported = supportedCycles(data, today);
  return supported.length > 0 ? supported[supported.length - 1].cycle.major : latestCycle(data, today).major;
}

/**
 * Majeures à traverser pour aller de `fromMajor` à la dernière version, dans l'ordre.
 * Calculé sur la liste réelle des versions (pas d'arithmétique : il n'y a jamais eu de v3).
 */
export function migrationPath(data: AngularReleasesData, fromMajor: number, today: string): number[] {
  const target = latestCycle(data, today).major;
  return data.cycles
    .map((cycle) => cycle.major)
    .filter((major) => major > fromMajor && major <= target)
    .sort((a, b) => a - b);
}

/**
 * Lien vers le guide officiel de mise à jour pour un saut de majeure.
 * `l=1` = niveau « basique » du guide.
 */
export function updateGuideUrl(fromMajor: number, toMajor: number): string {
  return `https://angular.dev/update-guide?v=${fromMajor}.0-${toMajor}.0&l=1`;
}

/**
 * Lit une version saisie librement : `20`, `v20`, `20.3.1`, `^19.2.0`, `~18.1`,
 * ou une ligne de package.json (`"@angular/core": "^19.0.0"`). Null si illisible.
 */
export function parseMajor(input: string | null | undefined): number | null {
  if (!input) return null;
  const text = input.trim();
  const coreLine = text.match(/@angular\/core["']?\s*:\s*["']?[\^~>=v\s]*(\d+)/i);
  const plain = text.match(/^[\^~>=v\s]*(\d+)(?:\.\d+){0,2}(?:[-+.\w]*)?$/i);
  const raw = coreLine?.[1] ?? plain?.[1];
  if (!raw) return null;
  const major = Number(raw);
  return Number.isInteger(major) && major >= 2 && major <= 99 ? major : null;
}

export function findCycle(data: AngularReleasesData, major: number): AngularCycle | null {
  return data.cycles.find((cycle) => cycle.major === major) ?? null;
}

/** Ancienne version absente de la source (AngularJS ou Angular 2 à 8) : forcément en fin de vie. */
export function isOlderThanTracked(data: AngularReleasesData, major: number): boolean {
  const oldest = data.cycles.reduce((min, cycle) => Math.min(min, cycle.major), Number.POSITIVE_INFINITY);
  return major < oldest;
}

/** Prochaines sorties encore à venir, d'après le calendrier annoncé. */
export function upcomingReleases(today: string): UpcomingRelease[] {
  // Une sortie « ~ novembre » reste à venir jusqu'à la fin du mois annoncé.
  return RELEASE_SCHEDULE.filter((release) => endOfMonth(release.date) >= today);
}

function endOfMonth(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${isoDate.slice(0, 7)}-${String(last).padStart(2, '0')}`;
}

const LOCALES: Readonly<Record<'fr' | 'en', string>> = { fr: 'fr-FR', en: 'en-GB' };

/** « 28 novembre 2026 » / « 28 November 2026 » ; `1er` en français. */
export function formatDate(isoDate: string, lang: 'fr' | 'en'): string {
  const text = new Intl.DateTimeFormat(LOCALES[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
  return lang === 'fr' ? text.replace(/^1 /, '1er ') : text;
}

/** « novembre 2026 » / « November 2026 ». */
export function formatMonth(isoDate: string, lang: 'fr' | 'en'): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${isoDate}T00:00:00Z`));
}
