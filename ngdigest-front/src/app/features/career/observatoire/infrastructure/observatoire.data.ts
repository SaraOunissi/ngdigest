import { ChartMetric, Kpi, ObservatoireSnapshot } from '../domain/models/observatoire.model';

/**
 * Observatoire — snapshot 2026-07 (baseline).
 *
 * Source of truth: `_drafts/observatoire-snapshots/SNAPSHOT-2026-07.md`.
 * Only the "🟢 Assez solides pour publier" figures appear here with numbers.
 * "⚠️ à re-sourcer" items (volatile Free-Work counters, "IDF 40 %") are NOT
 * published; "🚫 non disponible (v2)" items become `soon` blocks.
 *
 * Every metric is a time series (`points` keyed by snapshot id) so the live v2
 * grows the arrays instead of reshaping the data. Colours are semantic keys
 * mapped to design tokens in `chart-block.scss`.
 */
export const OBSERVATOIRE_2026_07: ObservatoireSnapshot = {
  meta: {
    id: '2026-07',
    collected: '2026-07-03',
    baseline: true,
    label: { fr: 'Snapshot · juillet 2026', en: 'Snapshot · July 2026' },
    updated: { fr: 'Mis à jour chaque mois', en: 'Updated every month' },
  },

  // ── KPI band (big publishable numbers) ────────────────────────────────────
  kpis: [
    {
      id: 'angular-share',
      status: 'published',
      value: { fr: '18,2 %', en: '18.2%' },
      label: {
        fr: "d'usage mondial pour Angular",
        en: 'of global usage for Angular',
      },
      angle: {
        fr: "Moins « aimé », loin d'être mort — et sur les jobboards FR, souvent devant React.",
        en: 'Less “loved”, far from dead — and on French job boards, often ahead of React.',
      },
      source: {
        label: 'Stack Overflow Survey 2025',
        date: 'juil. 2025',
        url: 'https://survey.stackoverflow.co/2025/technology',
      },
    },
    {
      id: 'junior-door',
      status: 'published',
      value: { fr: '67 %', en: '67%' },
      label: {
        fr: 'des employeurs FR veulent réduire les embauches juniors',
        en: 'of French employers plan to cut junior hiring',
      },
      angle: {
        fr: "La porte junior se referme : l'IA absorbe le boulot d'entrée, pas les seniors.",
        en: 'The junior door is closing: AI absorbs entry-level work, not seniors.',
      },
      source: {
        label: 'IDC / Deel (fin 2025)',
        date: 'fin 2025',
        url: 'https://www.lemondeinformatique.fr/actualites/lire-l-ia-impacte-le-recrutement-it-des-jeunes-et-les-salaires-99689.html',
      },
    },
    {
      id: 'ia-mentions',
      status: 'published',
      value: { fr: '3,4 %', en: '3.4%' },
      label: {
        fr: "des offres FR mentionnent l'IA",
        en: 'of French job ads mention AI',
      },
      angle: {
        fr: 'Le plus faible des pays comparables — UK 7,5 · US 4,9 · Allemagne 4,1.',
        en: 'The lowest among comparable countries — UK 7.5 · US 4.9 · Germany 4.1.',
      },
      source: {
        label: 'Indeed Hiring Lab',
        date: 'avr. 2026',
        url: 'https://www.hiringlab.org/fr/blog/2026/04/01/avril-2026-lia-progresse-dans-un-marche-du-travail-en-recul/',
      },
    },
    {
      id: 'tjm-front',
      status: 'published',
      value: { fr: '536 €', en: '€536' },
      label: {
        fr: 'de TJM moyen pour un front freelance',
        en: 'average daily rate, freelance front-end',
      },
      angle: {
        fr: 'Le métier dev le moins cher après webmaster — et le junior plafonne à 299 €.',
        en: 'The cheapest dev job after webmaster — juniors capped at €299.',
      },
      source: {
        label: 'Malt Baromètre 2026',
        date: 'juil. 2026',
        url: 'https://www.malt.fr/t/barometre-tarifs/tech/developpeur-frontend',
      },
    },
  ],

  // ── Charts ────────────────────────────────────────────────────────────────
  charts: [
    // Technos — global usage share (SO 2025).
    {
      id: 'technos',
      status: 'published',
      kind: 'bar',
      title: {
        fr: 'Parts de techno front — usage mondial',
        en: 'Front-end framework share — global usage',
      },
      angle: {
        fr: "En France, ça résiste mieux qu'ailleurs : sur Free-Work, Angular fait souvent jeu égal ou devant React. La série FR propre arrive avec les snapshots.",
        en: 'In France it holds up better than elsewhere: on Free-Work, Angular often matches or beats React. The clean FR series is coming with the snapshots.',
      },
      note: {
        fr: 'Usage déclaré par les devs (biais mondial/anglo), pas la demande réelle des offres FR.',
        en: 'Self-reported developer usage (global/anglo bias), not real demand in French ads.',
      },
      unit: '%',
      series: [
        { key: 'react', label: 'React', color: 'blue', points: [{ t: '2026-07', v: 44.7 }] },
        { key: 'angular', label: 'Angular', color: 'violet', points: [{ t: '2026-07', v: 18.2 }] },
        { key: 'vue', label: 'Vue', color: 'gold', points: [{ t: '2026-07', v: 17.6 }] },
        { key: 'svelte', label: 'Svelte', color: 'green', points: [{ t: '2026-07', v: 7.2 }] },
      ],
      source: {
        label: 'Stack Overflow Developer Survey 2025',
        date: 'juil. 2025',
        url: 'https://survey.stackoverflow.co/2025/technology',
      },
    },

    // The AI "scissors" — the centrepiece. Indeed US/global index, base 100 = Feb 2020.
    {
      id: 'ia-scissors',
      status: 'published',
      kind: 'scissors',
      title: {
        fr: "L'effet ciseaux : les offres fondent, l'IA explose",
        en: 'The scissors effect: postings shrink, AI mentions soar',
      },
      angle: {
        fr: "L'IA n'a pas tué l'emploi tech — elle a fermé la porte d'entrée. Le junior est au croisement des deux lames.",
        en: 'AI didn’t kill tech jobs — it shut the entry door. Juniors sit where the two blades cross.',
      },
      note: {
        fr: "Indice base 100 = fév. 2020, données Indeed US/global (offres software dev −34 % ; mentions IA +134 %). La version FR × front pur est le trou public le plus différenciant — collecte propre (v2).",
        en: 'Index base 100 = Feb 2020, Indeed US/global (software-dev postings −34%; AI mentions +134%). The FR × pure-front version is the most differentiating public gap — own collection (v2).',
      },
      unit: '',
      axisLabel: { fr: 'Indice base 100 = fév. 2020', en: 'Index base 100 = Feb 2020' },
      x: ['fév. 2020', '2022', 'fin 2025'],
      series: [
        {
          key: 'volume',
          color: 'violet',
          label: { fr: "Volume d'offres dev", en: 'Dev postings volume' },
          points: [
            { t: '2020-02', v: 100 },
            { t: '2022', v: 210 },
            { t: '2025-12', v: 66 },
          ],
        },
        {
          key: 'ia',
          color: 'green',
          label: { fr: "Offres mentionnant l'IA", en: 'Ads mentioning AI' },
          points: [
            { t: '2020-02', v: 100 },
            { t: '2022', v: null },
            { t: '2025-12', v: 234 },
          ],
        },
      ],
      anchors: {
        fr: [
          'France : −~50 % d’offres depuis déc. 2022',
          "3,4 % des offres mentionnent l'IA",
          '67 % des boîtes veulent réduire les juniors',
        ],
        en: [
          'France: −~50% postings since Dec 2022',
          '3.4% of ads mention AI',
          '67% of firms plan to cut junior hiring',
        ],
      },
      source: {
        label: 'Indeed Hiring Lab — Labor Market Update',
        date: 'janv. 2026',
        url: 'https://www.hiringlab.org/2026/01/22/january-labor-market-update-jobs-mentioning-ai-are-growing-amid-broader-hiring-weakness/',
      },
    },

    // Remote — practice, SO 2025 France (n = 1 026).
    {
      id: 'remote',
      status: 'published',
      kind: 'donut',
      title: {
        fr: 'Télétravail — ce que vivent les devs FR',
        en: 'Remote work — what French devs actually live',
      },
      angle: {
        fr: "Le 100 % remote recule, l'hybride s'ancre. ~18 % seulement bossent full-remote.",
        en: 'Full remote is receding, hybrid is settling in. Only ~18% work fully remote.',
      },
      note: {
        fr: 'Pratique déclarée (SO 2025, France, n = 1 026), pas la part des offres.',
        en: 'Self-reported practice (SO 2025, France, n = 1,026), not the share of postings.',
      },
      unit: '%',
      segments: [
        { key: 'remote', label: { fr: 'Full remote', en: 'Full remote' }, color: 'green', value: 18.1 },
        { key: 'hybride', label: { fr: 'Hybride', en: 'Hybrid' }, color: 'blue', value: 32.8 },
        { key: 'onsite', label: { fr: 'Présentiel', en: 'On-site' }, color: 'muted', value: 49.1 },
      ],
      soon: {
        fr: 'Répartition par ville / région — bientôt',
        en: 'Breakdown by city / region — soon',
      },
      source: {
        label: 'Stack Overflow Survey 2025 (Work, France)',
        date: 'juil. 2025',
        url: 'https://survey.stackoverflow.co/2025/work',
      },
    },

    // Salary — Malt 2026 freelance daily rate by seniority.
    {
      id: 'salary',
      status: 'published',
      kind: 'hbar',
      title: {
        fr: 'TJM freelance front par séniorité',
        en: 'Freelance front-end daily rate by seniority',
      },
      angle: {
        fr: "Le front junior à 299 €/j n'est pas rentable après charges vs un CDI à 35 k€. La séniorité (8+ ans) est la vraie porte d'entrée du freelance.",
        en: 'A junior at €299/day isn’t profitable after charges vs a €35k salary. Seniority (8+ yrs) is the real freelance entry ticket.',
      },
      note: {
        fr: "CDI front médian ≈ 40 k€ (WeLoveDevs, déclaratif). Malt ne publie pas d'historique par métier — l'évolution année/année arrive en v2.",
        en: 'Median front-end salary ≈ €40k (WeLoveDevs, self-reported). Malt publishes no per-job history — year-over-year trend comes in v2.',
      },
      unit: '€/j',
      avg: 536,
      bars: [
        { key: 's1', label: { fr: '0–2 ans', en: '0–2 yrs' }, value: 299 },
        { key: 's2', label: { fr: '3–7 ans', en: '3–7 yrs' }, value: 408 },
        { key: 's3', label: { fr: '8–15 ans', en: '8–15 yrs' }, value: 536 },
        { key: 's4', label: { fr: '15 ans +', en: '15 yrs +' }, value: 585 },
      ],
      source: {
        label: 'Malt Baromètre front-end 2026',
        date: 'juil. 2026',
        url: 'https://www.malt.fr/t/barometre-tarifs/tech/developpeur-frontend',
      },
      source2: {
        label: 'WeLoveDevs — salaires front-end',
        date: '27/06/2026',
        url: 'https://welovedevs.com/fr/salaires/developpeur-front-end',
      },
    },
  ],

  // ── "Coming soon" — figures with no clean public source yet (v2) ───────────
  soon: [
    {
      id: 'front-vs-fullstack',
      title: { fr: 'Front pur vs Fullstack', en: 'Pure front vs Fullstack' },
      body: {
        fr: "Le fullstack est le métier tech n°1 en volume (HelloWork). Mais le pourcentage exact « front pur vs fullstack » dans les offres FR n'existe nulle part en source publique — je le mesure moi-même.",
        en: 'Fullstack is the #1 tech role by volume (HelloWork). But the exact “pure front vs fullstack” split in French ads exists in no public source — I measure it myself.',
      },
      tags: [],
    },
    {
      id: 'combos',
      title: { fr: 'Combos gagnants', en: 'Winning stacks' },
      body: {
        fr: 'En FR, Angular + TypeScript + (Java ou .NET) ouvre le plus d’offres. La fréquence chiffrée de chaque combo arrive avec ma collecte propre.',
        en: 'In France, Angular + TypeScript + (Java or .NET) opens the most doors. The measured frequency of each combo comes with my own collection.',
      },
      tags: ['TypeScript', 'Java / Spring', '.NET / C#', 'Node', 'RxJS', 'Nx', 'Tailwind', 'Copilot / Claude Code'],
    },
    {
      id: 'seniorite',
      title: { fr: 'Répartition par séniorité', en: 'Seniority breakdown' },
      body: {
        fr: 'La direction est claire — le sas junior se ferme (−19 % APEC, 67 % des boîtes). La clé de répartition exacte des offres par niveau ? Je la construis, snapshot après snapshot.',
        en: 'The direction is clear — the junior gate is closing (−19% APEC, 67% of firms). The exact split of postings by level? I’m building it, snapshot after snapshot.',
      },
      tags: [],
    },
  ],

  // ── Method & sources (E-E-A-T) — 🟢 publishable only ───────────────────────
  sources: [
    { label: 'Stack Overflow Developer Survey 2025', date: 'juil. 2025', url: 'https://survey.stackoverflow.co/2025/technology' },
    { label: 'Malt — Baromètre tarifs front-end 2026', date: 'juil. 2026', url: 'https://www.malt.fr/t/barometre-tarifs/tech/developpeur-frontend' },
    { label: "Indeed Hiring Lab France — l'IA dans un marché en recul", date: 'avr. 2026', url: 'https://www.hiringlab.org/fr/blog/2026/04/01/avril-2026-lia-progresse-dans-un-marche-du-travail-en-recul/' },
    { label: 'INSEE / Le Monde Informatique — emploi IT & juniors', date: 'mars 2026', url: 'https://www.lemondeinformatique.fr/actualites/lire-l-ia-impacte-le-recrutement-it-des-jeunes-et-les-salaires-99689.html' },
    { label: 'APEC — prévisions recrutements cadres 2026', date: '2026', url: 'https://www.lemondeinformatique.fr/actualites/lire-les-recrutements-de-cadres-it-repartent-a-la-hausse-en-2026-99899.html' },
    { label: 'WeLoveDevs — salaires développeur front-end', date: '27/06/2026', url: 'https://welovedevs.com/fr/salaires/developpeur-front-end' },
  ],
};

/** Reuses a July KPI/chart that no new publishable source has superseded. */
function fromJuly<T extends { readonly id: string }>(items: readonly T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Observatoire 2026-07: unknown id "${id}"`);
  }
  return item;
}

const FREE_WORK_ANGULAR: Kpi['source'] = {
  label: 'Free-Work — offres par tag (relevé direct)',
  date: '22/09/2026',
  url: 'https://www.free-work.com/fr/tech-it/jobs/angular',
};

const MALT_FRONT_SEPT: Kpi['source'] = {
  label: 'Malt Baromètre front-end 2026',
  date: 'sept. 2026',
  url: 'https://www.malt.fr/t/barometre-tarifs/tech/developpeur-frontend',
};

const APEC_TELETRAVAIL: Kpi['source'] = {
  label: 'APEC — télétravail 2026',
  date: 'déc. 2025',
  url: 'https://corporate.apec.fr/home/actus-medias/toutes-nos-actualites/teletravail-94-des-entreprises-envisagent-de-maintenir-leur-politique-en-2026.html',
};

const JULY_TECHNOS: ChartMetric = fromJuly(OBSERVATOIRE_2026_07.charts, 'technos');
const JULY_REMOTE: ChartMetric = fromJuly(OBSERVATOIRE_2026_07.charts, 'remote');
const JULY_SALARY: ChartMetric = fromJuly(OBSERVATOIRE_2026_07.charts, 'salary');

/**
 * Observatoire — snapshot 2026-09 (2nd point of the series).
 *
 * Source of truth: `_drafts/observatoire-snapshots/SNAPSHOT-2026-09.md`
 * (collection 2026-09-01 + control reading 2026-09-22, the figures used here).
 * There is NO 2026-08 snapshot: the monthly task produced none in August, so
 * every delta below spans July → September. Only the "🟢 publiable" figures of
 * the 22/09 list are shown. Not published on purpose: the "front −20 %"
 * (August seasonality, disproven on 22/09), the unverified "21 % of dev ads
 * mention AI", and isolated tag counts presented as Angular combos.
 */
export const OBSERVATOIRE_2026_09: ObservatoireSnapshot = {
  meta: {
    id: '2026-09',
    collected: '2026-09-22',
    baseline: false,
    label: { fr: 'Snapshot · septembre 2026', en: 'Snapshot · September 2026' },
    updated: { fr: 'Mis à jour chaque mois', en: 'Updated every month' },
  },

  kpis: [
    {
      id: 'angular-share-fr',
      status: 'published',
      value: { fr: '22,1 %', en: '22.1%' },
      label: {
        fr: 'des offres front FR sur le tag Angular de Free-Work',
        en: 'of French front-end ads on Free-Work’s Angular tag',
      },
      angle: {
        fr: 'Devant React (16,6 %) le même jour. Trois relevés, la part d’Angular monte : 20,7 → 21,4 → 22,1 %.',
        en: 'Ahead of React (16.6%) on the same day. Three readings, Angular’s share keeps rising: 20.7 → 21.4 → 22.1%.',
      },
      source: FREE_WORK_ANGULAR,
    },
    fromJuly(OBSERVATOIRE_2026_07.kpis, 'junior-door'),
    fromJuly(OBSERVATOIRE_2026_07.kpis, 'ia-mentions'),
    {
      id: 'tjm-front',
      status: 'published',
      value: { fr: '536 €', en: '€536' },
      label: {
        fr: 'de TJM moyen pour un front freelance',
        en: 'average daily rate, freelance front-end',
      },
      angle: {
        fr: 'Pas bougé d’un euro sur trois relevés (juillet → 22 septembre). Le junior reste à 299 €.',
        en: 'Not a euro of movement over three readings (July → 22 September). Juniors stay at €299.',
      },
      source: MALT_FRONT_SEPT,
    },
  ],

  charts: [
    {
      ...JULY_TECHNOS,
      title: {
        fr: 'Parts de techno dans les offres front FR',
        en: 'Framework share of French front-end job ads',
      },
      angle: {
        fr: 'L’exception française est mesurée : 303 offres Angular contre 228 React le même jour, et l’écart s’est creusé à la rentrée (ratio 1,15 → 1,33).',
        en: 'The French exception is measured: 303 Angular ads vs 228 React on the same day, and the gap widened after the summer (ratio 1.15 → 1.33).',
      },
      note: {
        fr: 'Compteurs des pages tag Free-Work le 22/09/2026, en part de la catégorie front (1 371 offres). Tags qui peuvent se recouvrir ; un seul jobboard. Usage mondial déclaré (Stack Overflow 2025) : React 44,7 %, Angular 18,2 %.',
        en: 'Free-Work tag-page counters on 22/09/2026, as a share of the front-end category (1,371 ads). Tags may overlap; a single job board. Self-reported global usage (Stack Overflow 2025): React 44.7%, Angular 18.2%.',
      },
      series: [
        {
          key: 'angular',
          label: 'Angular',
          color: 'violet',
          points: [
            { t: '2026-07', v: 20.7 },
            { t: '2026-09', v: 22.1 },
          ],
        },
        {
          key: 'react',
          label: 'React',
          color: 'blue',
          points: [
            { t: '2026-07', v: null },
            { t: '2026-09', v: 16.6 },
          ],
        },
        {
          key: 'vue',
          label: 'Vue',
          color: 'gold',
          points: [
            { t: '2026-07', v: null },
            { t: '2026-09', v: 11.0 },
          ],
        },
        {
          key: 'svelte',
          label: 'Svelte',
          color: 'green',
          points: [
            { t: '2026-07', v: null },
            { t: '2026-09', v: 0.5 },
          ],
        },
      ],
      source: FREE_WORK_ANGULAR,
      source2: JULY_TECHNOS.source,
    },
    fromJuly(OBSERVATOIRE_2026_07.charts, 'ia-scissors'),
    {
      ...JULY_REMOTE,
      angle: {
        fr: 'Le 100 % remote recule, l’hybride s’ancre. Côté entreprises, rien ne bouge : 94 % maintiennent leur politique de télétravail en 2026.',
        en: 'Full remote is receding, hybrid is settling in. Employers aren’t moving: 94% keep their remote policy for 2026.',
      },
      source2: APEC_TELETRAVAIL,
    },
    {
      ...JULY_SALARY,
      angle: {
        fr: 'Trois relevés, même TJM moyen (536 €) pendant que le nombre de freelances front sur Malt continue de monter (18 079). Le junior à 299 €/j reste non rentable face à un CDI.',
        en: 'Three readings, same average rate (€536) while the number of front-end freelancers on Malt keeps rising (18,079). A junior at €299/day still isn’t profitable vs a salaried job.',
      },
      note: {
        fr: 'Baromètre Malt glissant sur 3 mois : il réagit lentement. CDI front médian ≈ 40 k€ (WeLoveDevs, déclaratif, inchangé).',
        en: 'Malt’s barometer is a rolling 3-month window, so it reacts slowly. Median front-end salary ≈ €40k (WeLoveDevs, self-reported, unchanged).',
      },
      bars: [
        { key: 's1', label: { fr: '0–2 ans', en: '0–2 yrs' }, value: 299 },
        { key: 's2', label: { fr: '3–7 ans', en: '3–7 yrs' }, value: 407 },
        { key: 's3', label: { fr: '8–15 ans', en: '8–15 yrs' }, value: 536 },
        { key: 's4', label: { fr: '15 ans +', en: '15 yrs +' }, value: 582 },
      ],
      source: MALT_FRONT_SEPT,
    },
  ],

  soon: OBSERVATOIRE_2026_07.soon,

  sources: [
    FREE_WORK_ANGULAR,
    MALT_FRONT_SEPT,
    { label: 'Stack Overflow Developer Survey 2025 (édition 2026 non publiée au 22/09)', date: 'juil. 2025', url: 'https://survey.stackoverflow.co/2025/technology' },
    { label: "Indeed Hiring Lab France — l'IA dans un marché en recul", date: 'avr. 2026', url: 'https://www.hiringlab.org/fr/blog/2026/04/01/avril-2026-lia-progresse-dans-un-marche-du-travail-en-recul/' },
    { label: 'INSEE / Le Monde Informatique — emploi IT & juniors', date: 'mars 2026', url: 'https://www.lemondeinformatique.fr/actualites/lire-l-ia-impacte-le-recrutement-it-des-jeunes-et-les-salaires-99689.html' },
    APEC_TELETRAVAIL,
    { label: 'WeLoveDevs — salaires développeur front-end', date: 'sept. 2026', url: 'https://welovedevs.com/fr/salaires/developpeur-front-end' },
  ],
};

/** The snapshot rendered by /carriere/observatoire — always the latest one. */
export const OBSERVATOIRE_LATEST: ObservatoireSnapshot = OBSERVATOIRE_2026_09;
