// by project-worker 2026-08-21
import { ToolkitAsset } from '../domain/models/toolkit-asset.model';

/**
 * Curated toolkit assets. Every `path` MUST exist under `public/` — the guard in
 * `scripts/lib/toolkit-assets.test.mjs` fails the build-side check otherwise
 * (a dead download is worse than no download at all).
 */
export const TOOLKIT_ASSETS: readonly ToolkitAsset[] = [
  {
    id: 'cv-angular',
    category: 'cv',
    title: { fr: 'Trame de CV front Angular', en: 'Angular front-end resume template' },
    blurb: {
      fr: "Le squelette d'un CV dev front lisible en 30 secondes, avec les consignes de rédaction en commentaire.",
      en: 'The skeleton of a front-end resume readable in 30 seconds, with writing guidance inline.',
    },
    highlights: [
      {
        fr: 'Chaque expérience en Contexte → action → résultat mesurable',
        en: 'Every role as Context → action → measurable outcome',
      },
      {
        fr: 'Exemples de formulations fortes vs formulations molles',
        en: 'Examples of strong vs weak phrasing',
      },
      { fr: 'Version FR et version EN séparées', en: 'Separate FR and EN versions' },
    ],
    effort: { fr: '1 h', en: '1 h' },
    files: [
      { lang: 'fr', path: '/assets/toolkit/cv-angular-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/cv-angular-en.md', format: 'markdown' },
    ],
    updated: '2026-08-21',
  },
  {
    id: 'checklist-cv',
    category: 'cv',
    title: { fr: 'Checklist de relecture du CV', en: 'Resume review checklist' },
    blurb: {
      fr: "20 points à passer juste avant d'envoyer. Trois échecs ou plus : c'est le CV qu'il faut reprendre.",
      en: '20 checks to run right before sending. Three failures or more: rework the resume.',
    },
    highlights: [
      { fr: 'Fond, forme et liens séparés', en: 'Substance, form and links kept separate' },
      {
        fr: 'Les pièges qui trient contre toi (photo, barres de compétences, PDF image)',
        en: 'The traps that sort against you (photo, skill bars, image-only PDF)',
      },
    ],
    effort: { fr: '10 min', en: '10 min' },
    files: [
      { lang: 'fr', path: '/assets/toolkit/checklist-cv-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/checklist-cv-en.md', format: 'markdown' },
    ],
    updated: '2026-08-21',
  },
  {
    id: 'mail-candidature',
    category: 'lettres',
    title: { fr: 'Messages de candidature', en: 'Application messages' },
    blurb: {
      fr: 'Réponse à une offre, candidature spontanée, message LinkedIn de 300 caractères.',
      en: 'Answer to a job ad, cold application, 300-character LinkedIn message.',
    },
    highlights: [
      {
        fr: '120 mots max, une seule demande, zéro flatterie',
        en: '120 words max, one single ask, zero flattery',
      },
      {
        fr: 'La phrase qui fait répondre : « je ne relancerai pas deux fois »',
        en: 'The line that gets replies: "I won\'t follow up twice"',
      },
    ],
    effort: { fr: '15 min', en: '15 min' },
    files: [
      { lang: 'fr', path: '/assets/toolkit/mail-candidature-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/mail-candidature-en.md', format: 'markdown' },
    ],
    updated: '2026-08-21',
  },
  {
    id: 'mail-relance',
    category: 'lettres',
    title: { fr: 'Relances & remerciements', en: 'Follow-ups & thank-you notes' },
    blurb: {
      fr: "Le mail de J+1 (le seul endroit où rattraper une question ratée), la relance unique, et le mail d'après-refus.",
      en: 'The day-after email (the only place to recover a botched question), the single follow-up, and the post-rejection note.',
    },
    highlights: [
      { fr: 'Une relance, pas deux — et pourquoi', en: 'One follow-up, not two — and why' },
      {
        fr: 'Le mail après refus qui transforme un non en contact',
        en: 'The post-rejection email that turns a no into a contact',
      },
    ],
    effort: { fr: '10 min', en: '10 min' },
    files: [
      { lang: 'fr', path: '/assets/toolkit/mail-relance-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/mail-relance-en.md', format: 'markdown' },
    ],
    updated: '2026-08-21',
  },
  {
    id: 'prepa-entretien',
    category: 'prep',
    title: { fr: "Fiche de préparation d'entretien", en: 'Interview preparation sheet' },
    blurb: {
      fr: "À remplir avant chaque entretien : l'entreprise, le poste, tes 3 histoires, et les questions à leur poser.",
      en: 'Fill in before every interview: the company, the role, your three stories, and the questions to ask them.',
    },
    highlights: [
      {
        fr: "7 questions à poser qui font la différence en fin d'entretien",
        en: '7 questions to ask that land at the end of an interview',
      },
      {
        fr: 'Stack annoncée vs stack réelle : où vérifier',
        en: 'Advertised stack vs real stack: where to check',
      },
    ],
    effort: { fr: '30 min', en: '30 min' },
    files: [
      { lang: 'fr', path: '/assets/toolkit/prepa-entretien-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/prepa-entretien-en.md', format: 'markdown' },
    ],
    updated: '2026-08-21',
  },
  {
    id: 'debrief-entretien',
    category: 'prep',
    title: { fr: 'Débrief & suivi de négociation', en: 'Debrief & negotiation tracker' },
    blurb: {
      fr: "À remplir dans l'heure qui suit. Au bout de 5 fiches, les motifs sautent aux yeux.",
      en: 'Fill in within the hour. After five sheets, the patterns jump out.',
    },
    highlights: [
      {
        fr: 'Signaux verts / orange / rouges observés, pas espérés',
        en: 'Green / amber / red signals observed, not hoped for',
      },
      {
        fr: 'Ton plancher réel et tes variables de négociation',
        en: 'Your real floor and your negotiation variables',
      },
    ],
    effort: { fr: '15 min', en: '15 min' },
    files: [
      { lang: 'fr', path: '/assets/toolkit/debrief-entretien-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/debrief-entretien-en.md', format: 'markdown' },
    ],
    updated: '2026-08-21',
  },
];

/** Display order of the three editorial families. */
export const TOOLKIT_CATEGORY_ORDER = ['cv', 'lettres', 'prep'] as const;
