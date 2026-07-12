import { GuideDecisionTree } from '../domain/models/guide-decision.model';

/**
 * "Oriente-toi en 3 questions" — CDI vs Freelance → employer / channel →
 * status. Editorial copy is bilingual (LocalizedText) like the interview and
 * catalog data; only the CTA link labels live in i18n. Sourced from
 * _drafts/GUIDE_CONSEIL_ET_OBSERVATOIRE_2026-07.md (§A2).
 */
export const GUIDE_DECISION_TREE: GuideDecisionTree = {
  rootId: 'track',
  questions: [
    {
      id: 'track',
      stepLabel: { fr: 'Objectif', en: 'Goal' },
      title: { fr: 'Tu veux quoi, avant tout ?', en: 'What do you want, first of all?' },
      options: [
        {
          id: 'cdi',
          label: { fr: 'Un CDI — la stabilité', en: 'A permanent role — stability' },
          hint: {
            fr: 'Un salaire qui tombe, un cadre, des congés payés, un filet.',
            en: 'A steady salary, a framework, paid leave, a safety net.',
          },
          next: 'cdi-employer',
        },
        {
          id: 'freelance',
          label: { fr: 'Le freelance — l’indépendance', en: 'Freelance — independence' },
          hint: {
            fr: 'Plus de marge et de liberté — mais c’est toi qui portes le risque.',
            en: 'More margin and freedom — but you carry the risk yourself.',
          },
          next: 'freelance-channel',
        },
      ],
    },
    {
      id: 'cdi-employer',
      stepLabel: { fr: 'Employeur', en: 'Employer' },
      title: { fr: 'En CDI, tu bosses pour qui ?', en: 'In a permanent role, who do you work for?' },
      options: [
        {
          id: 'product',
          label: {
            fr: 'Le client final — produit, scale-up, grand groupe',
            en: 'The end client — product, scale-up, large group',
          },
          hint: {
            fr: '＋ Tu construis un vrai produit, moins d’intermédiaires. − Recrutement plus exigeant, moins de postes ouverts.',
            en: '＋ You build a real product, fewer middlemen. − Tougher hiring, fewer openings.',
          },
          next: null,
          outcome: 'cdi-product',
        },
        {
          id: 'esn',
          label: { fr: 'Une ESN / société de conseil', en: 'A consultancy (ESN)' },
          hint: {
            fr: '＋ Porte d’entrée, montée en compétence, missions variées. − Tu es « vendu » à un client, marge opaque, souvent présentiel.',
            en: '＋ A way in, upskilling, varied missions. − You’re billed to a client, opaque margin, often on-site.',
          },
          next: null,
          outcome: 'cdi-esn',
        },
      ],
    },
    {
      id: 'freelance-channel',
      stepLabel: { fr: 'Canal', en: 'Channel' },
      title: { fr: 'Tu trouves tes missions comment ?', en: 'How do you find your gigs?' },
      options: [
        {
          id: 'platforms',
          label: { fr: 'Sur des plateformes — Malt, Comet, Collective…', en: 'On gig platforms — Malt, Comet, Collective…' },
          hint: {
            fr: 'Le plus accessible pour démarrer et se faire un premier réseau.',
            en: 'The most accessible way to start and build a first network.',
          },
          next: 'freelance-status',
        },
        {
          id: 'direct',
          label: { fr: 'Directement le client final', en: 'Directly the end client' },
          hint: {
            fr: 'Le graal : meilleure marge, relation directe — mais ça se construit dans le temps.',
            en: 'The grail: best margin, direct relationship — but you build it over time.',
          },
          next: 'freelance-status',
        },
        {
          id: 'via-esn',
          label: { fr: 'Via une ESN qui te sous-traite', en: 'Through a consultancy that subcontracts you' },
          hint: {
            fr: 'Oui, ça existe aussi en freelance — pratique pour lisser les périodes creuses.',
            en: 'Yes, that exists in freelancing too — handy to smooth out quiet spells.',
          },
          next: 'freelance-status',
        },
      ],
    },
    {
      id: 'freelance-status',
      stepLabel: { fr: 'Statut', en: 'Status' },
      title: { fr: 'Et ton statut de freelance ?', en: 'And your freelance status?' },
      options: [
        {
          id: 'micro',
          label: { fr: 'Auto-entreprise (micro)', en: 'Micro-enterprise (auto-entrepreneur)' },
          hint: {
            fr: 'Simple, charges basses au début — mais un plafond de chiffre d’affaires.',
            en: 'Simple, low charges early on — but a revenue ceiling.',
          },
          next: null,
          outcome: 'freelance-micro',
        },
        {
          id: 'company',
          label: { fr: 'Une société (EURL / SASU)', en: 'A company (EURL / SASU)' },
          hint: {
            fr: 'Plus de compta et de charges, mais adapté aux gros TJM et à la durée.',
            en: 'More accounting and charges, but suited to high day-rates and the long run.',
          },
          next: null,
          outcome: 'freelance-company',
        },
        {
          id: 'portage',
          label: { fr: 'Le portage salarial', en: 'An umbrella company (portage)' },
          hint: {
            fr: 'Tu factures en freelance mais tu es salarié·e porté·e : protection sociale, zéro paperasse, ~5-10 % de frais.',
            en: 'You invoice as a freelancer but you’re employed by the umbrella: social protection, zero paperwork, ~5-10% fees.',
          },
          next: null,
          outcome: 'freelance-portage',
        },
      ],
    },
  ],
  outcomes: [
    {
      id: 'cdi-product',
      title: { fr: 'Vise le produit — et soigne l’entretien', en: 'Aim for product — and nail the interview' },
      summary: {
        fr: 'Bon choix pour construire vraiment quelque chose. Le recrutement y est plus exigeant : solidifie tes fondamentaux Angular et la partie théorique. Monte en compétence, puis attaque la prépa entretien.',
        en: 'A good choice to actually build something. Hiring is tougher there: solidify your Angular fundamentals and the theory. Level up first, then tackle interview prep.',
      },
      links: [
        { target: 'formations', labelKey: 'guide.link.formations' },
        { target: 'entretien', labelKey: 'guide.link.entretien' },
      ],
    },
    {
      id: 'cdi-esn',
      title: { fr: 'L’ESN, une bonne porte d’entrée — en connaissant les règles', en: 'A consultancy is a good way in — if you know the rules' },
      summary: {
        fr: 'Idéale pour démarrer et voir des projets variés. Garde en tête que la marge est opaque et la négo encadrée (voir « L’ESN ne te dit pas à combien elle te vend » plus bas). Prépare l’entretien et continue à te former.',
        en: 'Great to start and see varied projects. Keep in mind the margin is opaque and negotiation is boxed in (see “The consultancy won’t tell you what it bills you at” below). Prep the interview and keep training.',
      },
      links: [
        { target: 'entretien', labelKey: 'guide.link.entretien' },
        { target: 'formations', labelKey: 'guide.link.formations' },
      ],
    },
    {
      id: 'freelance-micro',
      title: { fr: 'Auto-entreprise : le plus simple pour te lancer', en: 'Micro-enterprise: the simplest way to launch' },
      summary: {
        fr: 'Parfait pour tester le freelance sans usine à gaz. Surveille le plafond de chiffre d’affaires. Va chercher tes premières missions sur les plateformes, et garde tes compétences à jour.',
        en: 'Perfect to test freelancing without red tape. Watch the revenue ceiling. Go find your first gigs on the platforms, and keep your skills current.',
      },
      links: [
        { target: 'plateformes', labelKey: 'guide.link.plateformes' },
        { target: 'formations', labelKey: 'guide.link.formations' },
      ],
    },
    {
      id: 'freelance-company',
      title: { fr: 'Société : quand le TJM et la durée suivent', en: 'Company: when the day-rate and duration follow' },
      summary: {
        fr: 'EURL/SASU devient intéressant sur de gros TJM ou du long terme (plus de charges, mais optimisable). Compare les canaux de missions et sécurise un flux régulier avant de sauter le pas.',
        en: 'EURL/SASU makes sense on high day-rates or the long run (more charges, but optimizable). Compare gig channels and secure a steady flow before you jump.',
      },
      links: [
        { target: 'plateformes', labelKey: 'guide.link.plateformes' },
        { target: 'formations', labelKey: 'guide.link.formations' },
      ],
    },
    {
      id: 'freelance-portage',
      title: { fr: 'Portage : la liberté du freelance, le filet du salariat', en: 'Umbrella: freelance freedom, employee safety net' },
      summary: {
        fr: 'Tu factures en freelance mais tu es salarié·e porté·e : protection sociale et zéro paperasse, contre ~5-10 % de frais. Idéal pour démarrer serein·e. J’explique le portage en détail sur la page Plateformes & missions.',
        en: 'You invoice as a freelancer but you’re employed by the umbrella: social protection and zero paperwork, for ~5-10% fees. Ideal for a calm start. I break umbrella companies down on the Platforms & gigs page.',
      },
      links: [
        { target: 'plateformes', labelKey: 'guide.link.plateformes' },
        { target: 'entretien', labelKey: 'guide.link.entretien' },
      ],
    },
  ],
};
