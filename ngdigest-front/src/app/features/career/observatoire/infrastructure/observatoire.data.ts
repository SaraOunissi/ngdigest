import { ObservatoireSnapshot } from '../domain/models/observatoire.model';

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
