import { Job } from '../../../domain/models/job.model';

export type SeoLang = 'fr' | 'en';

/**
 * Titres et descriptions SEO d'une fiche offre, propres à chaque langue.
 * Avant le 16/11/2026, `/fr/jobs/<slug>` et `/en/jobs/<slug>` partageaient le même
 * `<title>` (titre du poste · entreprise · NgDigest) et une description en français :
 * deux URL du sitemap avec un titre identique.
 */
const SEO_TITLES: Record<SeoLang, (job: Job) => string> = {
  fr: (job) => `${job.title} · Offre Angular chez ${job.company} · NgDigest`,
  en: (job) => `${job.title} · Angular job at ${job.company} · NgDigest`,
};

const SEO_FALLBACK_DESCRIPTIONS: Record<SeoLang, (job: Job) => string> = {
  fr: (job) => `${job.title} chez ${job.company}. Offre Angular sélectionnée par NgDigest.`,
  en: (job) => `${job.title} at ${job.company}. Angular job hand-picked by NgDigest.`,
};

export function jobSeoTitle(job: Job, lang: SeoLang): string {
  return SEO_TITLES[lang](job);
}

export function jobSeoDescription(job: Job, lang: SeoLang): string {
  const hook = lang === 'en' ? (job.editorialHookEn ?? job.editorialHook) : job.editorialHook;
  return hook || SEO_FALLBACK_DESCRIPTIONS[lang](job);
}
