import {
  CertCategory,
  Certification,
  CertVerdictEntry,
} from '../domain/models/certification.model';

/**
 * Certifications data — verified on the web 2026-07-03 (certificates.dev,
 * angulartraining.com, IAAP, Scrum.org, AWS, Microsoft Learn, Linux Foundation).
 * FR copy is the original; EN copy was authored for the bilingual site.
 * Prices/statuses to re-confirm at registration — they move fast.
 *
 * Cards are grouped on the page by ROI tier (see `roi`), not by category:
 *   top          → "Fort ROI pour un profil front"
 *   good         → "Situationnel"
 *   opt | skip   → "Faible ROI"
 *
 * IMPORTANT: only ONE credible Angular certification exists — the
 * Certificates.dev × Angular Training program (Alain Chautard, GDE), in 3 levels.
 * The OpenJS Node certs (JSNAD/JSNSD) were retired on 2025-09-30 and no longer
 * appear as an option.
 */

/**
 * The Angular program's prep block — kept as a standalone element on the page
 * (the cards themselves are distributed across the ROI tiers).
 */
export const ANGULAR_PREP: CertCategory = {
  id: 'angular',
  featured: true,
  title: { fr: 'Les certifications Angular', en: 'Angular certifications' },
  tag: {
    fr: 'La seule qui teste vraiment Angular',
    en: 'The only one that truly tests Angular',
  },
  intro: {
    fr: 'Une seule certif Angular crédible existe : le programme Certificates.dev, créé en partenariat avec Angular Training (Alain Chautard, Google Developer Expert). Trois niveaux, un examen en ligne surveillé mêlant QCM et vrais challenges de code.',
    en: 'There is only one credible Angular certification: the Certificates.dev program, built in partnership with Angular Training (Alain Chautard, Google Developer Expert). Three levels, a proctored online exam mixing MCQs and real code challenges.',
  },
  provider: {
    fr: 'Certificates.dev × Angular Training · examen proctored · QCM + code',
    en: 'Certificates.dev × Angular Training · proctored exam · MCQ + code',
  },
  prep: [
    {
      title: { fr: 'Assessment gratuit', en: 'Free assessment' },
      desc: {
        fr: 'Un test offert pour situer ton niveau et choisir Junior, Mid ou Senior.',
        en: 'A free test to gauge your level and choose Junior, Mid or Senior.',
      },
    },
    {
      title: { fr: 'Self-study officiel', en: 'Official self-study' },
      desc: {
        fr: 'Support d’auto-formation par niveau, en option payante.',
        en: 'Per-level self-study material, as a paid option.',
      },
    },
    {
      title: { fr: 'Bootcamps live', en: 'Live bootcamps' },
      desc: {
        fr: 'Sessions intensives Mid & Senior menées par des GDE.',
        en: 'Intensive Mid & Senior sessions led by GDEs.',
      },
    },
    {
      title: { fr: 'Cheat sheets & free weekends', en: 'Cheat sheets & free weekends' },
      desc: {
        fr: 'Ressources gratuites (Signals, template syntax) + week-ends de training offerts.',
        en: 'Free resources (Signals, template syntax) + free training weekends.',
      },
    },
  ],
  prepNote: {
    fr: 'Côté formateurs, Angular Training et Angular Academy proposent des cours qui préparent l’examen. Des créateurs FR commencent aussi à publier de la prépa — à confirmer avant de t’engager. À noter : réductions PPP (selon ton pays) et coupons périodiques sur certificates.dev.',
    en: 'On the training side, Angular Training and Angular Academy offer courses that prepare for the exam. French creators are also starting to publish prep content — to confirm before you commit. Note: PPP discounts (depending on your country) and periodic coupons on certificates.dev.',
  },
};

export const CERTIFICATIONS: readonly Certification[] = [
  // ---------- Angular (one program · 3 levels) ----------
  {
    id: 'ng-junior',
    cat: 'angular',
    roi: 'good',
    level: { fr: 'Niveau 1', en: 'Level 1' },
    name: { fr: 'Junior Angular Developer', en: 'Junior Angular Developer' },
    full: { fr: 'Certified Junior Angular Developer', en: 'Certified Junior Angular Developer' },
    org: 'Certificates.dev',
    lang: 'EN',
    cost: { fr: '69 $', en: '$69' },
    costNote: { fr: 'exam seul · +prépa en option', en: 'exam only · +optional prep' },
    validity: { fr: 'Sans expiration', en: 'No expiry' },
    cpf: 'verifier',
    aff: 'oui',
    who: { fr: 'Premier poste Angular', en: 'First Angular role' },
    verdict: {
      fr: 'La porte d’entrée : QCM sur les fondamentaux (composants, services, binding, routing). Idéale pour valider tes bases et crédibiliser un premier rôle Angular, ou poser un jalon avant le Mid.',
      en: 'The entry point: MCQs on the fundamentals (components, services, binding, routing). Ideal to validate your basics and add credibility to a first Angular role, or as a milestone before the Mid level.',
    },
    detail: {
      fr: '40 min · 50 QCM · en ligne surveillé.',
      en: '40 min · 50 MCQs · proctored online.',
    },
  },
  {
    id: 'ng-mid',
    cat: 'angular',
    roi: 'top',
    level: { fr: 'Niveau 2', en: 'Level 2' },
    name: { fr: 'Mid-Level Angular Developer', en: 'Mid-Level Angular Developer' },
    full: { fr: 'Certified Mid-Level Angular Developer', en: 'Certified Mid-Level Angular Developer' },
    org: 'Certificates.dev',
    lang: 'EN',
    cost: { fr: '179 $', en: '$179' },
    costNote: { fr: 'exam seul · bundles dispo', en: 'exam only · bundles available' },
    validity: { fr: 'Sans expiration', en: 'No expiry' },
    cpf: 'verifier',
    aff: 'oui',
    who: { fr: 'Dev Angular confirmé', en: 'Experienced Angular dev' },
    verdict: {
      fr: 'Le sweet spot : QCM avancés + du vrai code testé. La seule certif « front » où le signal dépasse le portfolio, parce qu’elle prouve ton niveau Angular au lieu de l’affirmer.',
      en: 'The sweet spot: advanced MCQs + real code that is actually tested. The one “front” cert where the signal beats a portfolio, because it proves your Angular level instead of claiming it.',
    },
    detail: {
      fr: '135 min · 40 QCM + challenges de code · proctored.',
      en: '135 min · 40 MCQs + code challenges · proctored.',
    },
  },
  {
    id: 'ng-senior',
    cat: 'angular',
    roi: 'top',
    level: { fr: 'Niveau 3', en: 'Level 3' },
    name: { fr: 'Senior Angular Developer', en: 'Senior Angular Developer' },
    full: { fr: 'Certified Senior Angular Developer', en: 'Certified Senior Angular Developer' },
    org: 'Certificates.dev',
    lang: 'EN',
    cost: { fr: 'Tarif premium', en: 'Premium pricing' },
    costNote: { fr: 'exam + training · à confirmer', en: 'exam + training · to confirm' },
    validity: { fr: 'Sans expiration', en: 'No expiry' },
    cpf: 'verifier',
    aff: 'oui',
    who: { fr: 'Lead / architecte', en: 'Lead / architect' },
    verdict: {
      fr: 'Le haut du panier : architecture, NgRx, RxJS, perf, sécurité, librairies réutilisables. Pour les profils qui architecturent à grande échelle. Lancée fin 2024.',
      en: 'Top of the range: architecture, NgRx, RxJS, performance, security, reusable libraries. For profiles architecting at scale. Launched late 2024.',
    },
    detail: {
      fr: '135 min · 40 QCM + challenges de code · proctored.',
      en: '135 min · 40 MCQs + code challenges · proctored.',
    },
  },

  // ---------- Accessibility ----------
  {
    id: 'iaap-was',
    cat: 'a11y',
    roi: 'top',
    name: { fr: 'IAAP WAS', en: 'IAAP WAS' },
    full: { fr: 'Web Accessibility Specialist', en: 'Web Accessibility Specialist' },
    org: 'IAAP',
    lang: 'EN',
    cost: { fr: '~ 530 $', en: '~ $530' },
    costNote: { fr: '~ 430 $ membre', en: '~ $430 for members' },
    validity: { fr: 'Recert. tous les 3 ans', en: 'Recert. every 3 years' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'Devs & QA front', en: 'Front devs & QA' },
    verdict: {
      fr: 'LE différenciateur a11y d’un·e front senior : WCAG, ARIA, tests d’accessibilité, aligné sur l’obligation légale RGAA/EAA (FR/EU). Peu de devs l’ont — tu sors du lot.',
      en: 'THE a11y differentiator of a senior frontend dev: WCAG, ARIA, accessibility testing, aligned with the RGAA/EAA legal requirement (FR/EU). Few devs hold it — you stand out.',
    },
    detail: {
      fr: '75 questions · 70 % pour réussir · proctored · recert 3 ans (points de formation continue).',
      en: '75 questions · 70% to pass · proctored · 3-year recert (continuing-education points).',
    },
  },
  {
    id: 'opquast',
    cat: 'a11y',
    roi: 'good',
    name: { fr: 'Opquast', en: 'Opquast' },
    full: {
      fr: 'Maîtrise de la qualité en projet web',
      en: 'Maîtrise de la qualité en projet web',
    },
    org: 'Opquast',
    lang: 'FR',
    cost: { fr: '~ 250 €', en: '~ €250' },
    costNote: { fr: 'à confirmer', en: 'to confirm' },
    validity: { fr: 'À vie', en: 'Lifetime' },
    cpf: 'verifier',
    aff: 'non',
    who: { fr: 'Profils front FR', en: 'French front profiles' },
    verdict: {
      fr: 'Très bon complément FR : angle « qualité web » large (a11y, SEO, perfs), plus accessible que l’IAAP et souvent finançable.',
      en: 'A very good French complement: a broad “web quality” angle (a11y, SEO, performance), more accessible than IAAP and often fundable.',
    },
    detail: {
      fr: 'Souvent éligible CPF (Répertoire Spécifique) — à vérifier sur France Compétences.',
      en: 'Often CPF-eligible (Répertoire Spécifique) — to check on France Compétences.',
    },
  },
  {
    id: 'iaap-cpacc',
    cat: 'a11y',
    roi: 'good',
    name: { fr: 'IAAP CPACC', en: 'IAAP CPACC' },
    full: { fr: 'Core Competencies in Accessibility', en: 'Core Competencies in Accessibility' },
    org: 'IAAP',
    lang: 'EN',
    cost: { fr: '485 $', en: '$485' },
    costNote: { fr: '385 $ membre', en: '$385 for members' },
    validity: { fr: 'Recert. tous les 3 ans', en: 'Recert. every 3 years' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'Transverse (PO, QA, dev)', en: 'Cross-role (PO, QA, dev)' },
    verdict: {
      fr: 'Base conceptuelle de l’accessibilité, transverse. Utile, mais moins « dev » que la WAS (ou en marche vers le CPWA = CPACC + WAS).',
      en: 'Conceptual, cross-role foundation of accessibility. Useful, but less “dev” than the WAS (or a step toward CPWA = CPACC + WAS).',
    },
    detail: {
      fr: '100 questions · 66 % pour réussir · recert 3 ans.',
      en: '100 questions · 66% to pass · 3-year recert.',
    },
  },

  // ---------- Scrum ----------
  {
    id: 'psm-i',
    cat: 'scrum',
    roi: 'top',
    name: { fr: 'PSM I', en: 'PSM I' },
    full: { fr: 'Professional Scrum Master I', en: 'Professional Scrum Master I' },
    org: 'Scrum.org',
    lang: 'EN',
    cost: { fr: '200 $', en: '$200' },
    costNote: { fr: 'par tentative', en: 'per attempt' },
    validity: { fr: 'À vie', en: 'Lifetime' },
    cpf: 'verifier',
    aff: 'non',
    who: { fr: 'Tout dev en équipe agile', en: 'Any dev in an agile team' },
    verdict: {
      fr: 'Le meilleur rapport crédibilité / prix : aucune formation obligatoire, tu révises seul (Scrum Guide + practice tests) et tu passes l’examen. À vie, reconnu mondialement.',
      en: 'The best credibility/price ratio: no mandatory training, you study on your own (Scrum Guide + practice tests) and take the exam. Lifetime, recognised worldwide.',
    },
    detail: {
      fr: '80 questions · 60 min · 85 % pour réussir. CPF possible via un organisme FR qui packages l’examen ; l’exam direct est hors CPF.',
      en: '80 questions · 60 min · 85% to pass. CPF possible via a French provider that bundles the exam; the direct exam is not CPF-eligible.',
    },
  },
  {
    id: 'psm-ii',
    cat: 'scrum',
    roi: 'good',
    name: { fr: 'PSM II', en: 'PSM II' },
    full: { fr: 'Professional Scrum Master II', en: 'Professional Scrum Master II' },
    org: 'Scrum.org',
    lang: 'EN',
    cost: { fr: '250 $', en: '$250' },
    costNote: { fr: 'par tentative', en: 'per attempt' },
    validity: { fr: 'À vie', en: 'Lifetime' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'Après la PSM I', en: 'After PSM I' },
    verdict: {
      fr: 'Le niveau avancé, pertinent une fois la PSM I en poche et un vrai vécu d’équipe.',
      en: 'The advanced level, relevant once you hold PSM I and have real team experience.',
    },
    detail: { fr: '', en: '' },
  },
  {
    id: 'csm',
    cat: 'scrum',
    roi: 'opt',
    name: { fr: 'CSM', en: 'CSM' },
    full: { fr: 'Certified ScrumMaster', en: 'Certified ScrumMaster' },
    org: 'Scrum Alliance',
    lang: 'EN',
    cost: { fr: '1 175 – 1 800 $', en: '$1,175 – $1,800' },
    costNote: { fr: 'cours inclus', en: 'course included' },
    validity: { fr: '2 ans (renouvellement payant)', en: '2 years (paid renewal)' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'Si l’employeur l’impose', en: 'If your employer requires it' },
    verdict: {
      fr: 'Plus chère et « course-gated » que la PSM, avec un renouvellement payant. À éviter sauf exigence explicite : préfère la PSM I.',
      en: 'Pricier and “course-gated” versus PSM, with paid renewal. Avoid unless explicitly required: prefer PSM I.',
    },
    detail: { fr: '', en: '' },
  },

  // ---------- Others (front / fullstack) ----------
  {
    id: 'google-ux',
    cat: 'autres',
    roi: 'good',
    name: { fr: 'Google UX Design', en: 'Google UX Design' },
    full: { fr: 'Google UX Design Certificate', en: 'Google UX Design Certificate' },
    org: 'Coursera',
    lang: 'EN',
    cost: { fr: '~ 39-49 €/mois', en: '~ €39-49/month' },
    costNote: { fr: 'abonnement Coursera', en: 'Coursera subscription' },
    validity: { fr: 'À vie', en: 'Lifetime' },
    cpf: 'verifier',
    aff: 'oui',
    who: { fr: 'Front + design/UX', en: 'Front + design/UX' },
    verdict: {
      fr: 'Renforce l’axe front + design/UX, très demandé. Sur Coursera, donc finançable et accessible.',
      en: 'Strengthens the front + design/UX axis, in high demand. On Coursera, so fundable and accessible.',
    },
    detail: {
      fr: 'Certaines offres Coursera packagées FR sont éligibles CPF — à vérifier.',
      en: 'Some bundled French Coursera offers are CPF-eligible — to check.',
    },
  },
  {
    id: 'aws-dev',
    cat: 'autres',
    roi: 'good',
    name: { fr: 'AWS Developer', en: 'AWS Developer' },
    full: { fr: 'AWS Certified Developer – Associate', en: 'AWS Certified Developer – Associate' },
    org: 'Amazon',
    lang: 'EN',
    cost: { fr: '150 $', en: '$150' },
    costNote: { fr: 'DVA-C02', en: 'DVA-C02' },
    validity: { fr: '3 ans', en: '3 years' },
    cpf: 'verifier',
    aff: 'indirecte',
    who: { fr: 'Front qui touche au déploiement', en: 'Front devs who touch deployment' },
    verdict: {
      fr: 'Utile pour le volet « fullstack / déploiement » d’un profil front senior : serverless, CI/CD. Solide sur le marché FR (démarre par le Cloud Practitioner).',
      en: 'Useful for the “fullstack / deployment” side of a senior frontend profile: serverless, CI/CD. Solid on the French market (start with the Cloud Practitioner).',
    },
    detail: {
      fr: 'Pas de programme d’affiliation grand public ; les cours de prép (Pluralsight/Udemy/Coursera) sont affiliables.',
      en: 'No public affiliate program; prep courses (Pluralsight/Udemy/Coursera) are affiliable.',
    },
  },
  {
    id: 'aws-ccp',
    cat: 'autres',
    roi: 'good',
    name: { fr: 'AWS Cloud Practitioner', en: 'AWS Cloud Practitioner' },
    full: { fr: 'AWS Certified Cloud Practitioner', en: 'AWS Certified Cloud Practitioner' },
    org: 'Amazon',
    lang: 'EN',
    cost: { fr: '100 $', en: '$100' },
    costNote: { fr: 'CLF-C02 · marche d’entrée', en: 'CLF-C02 · entry step' },
    validity: { fr: '3 ans', en: '3 years' },
    cpf: 'verifier',
    aff: 'indirecte',
    who: { fr: 'Front curieux du cloud', en: 'Front devs curious about cloud' },
    verdict: {
      fr: 'La porte d’entrée cloud, peu chère : crédibilise le volet déploiement d’un profil front avant de viser le Developer Associate.',
      en: 'The cheap cloud entry point: adds deployment credibility to a front profile before targeting the Developer Associate.',
    },
    detail: {
      fr: 'Pas d’affiliation grand public ; cours de prép (Udemy/Coursera) affiliables.',
      en: 'No public affiliate program; prep courses (Udemy/Coursera) are affiliable.',
    },
  },
  {
    id: 'az-900',
    cat: 'autres',
    roi: 'good',
    name: { fr: 'Azure Fundamentals', en: 'Azure Fundamentals' },
    full: {
      fr: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
      en: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
    },
    org: 'Microsoft',
    lang: 'EN/FR',
    cost: { fr: '~ 99 $', en: '~ $99' },
    costNote: {
      fr: 'souvent gratuit via Virtual Training Day',
      en: 'often free via Virtual Training Day',
    },
    validity: { fr: 'Ne périme pas', en: 'No expiry' },
    cpf: 'verifier',
    aff: 'non',
    who: { fr: 'Front sur écosystème Azure', en: 'Front devs on Azure stack' },
    verdict: {
      fr: 'Pertinente uniquement si ta cible est Microsoft/Azure : peu chère, parfois offerte, ne périme pas. Sinon, préfère AWS.',
      en: 'Relevant only if your target is Microsoft/Azure: cheap, sometimes free, never expires. Otherwise prefer AWS.',
    },
    detail: {
      fr: 'Examen offert après un Microsoft Virtual Training Day éligible.',
      en: 'Exam voucher available after an eligible Microsoft Virtual Training Day.',
    },
  },
  {
    id: 'ts-certdev',
    cat: 'autres',
    roi: 'good',
    name: { fr: 'TypeScript Developer', en: 'TypeScript Developer' },
    full: {
      fr: 'Certified TypeScript Developer (Certificates.dev)',
      en: 'Certified TypeScript Developer (Certificates.dev)',
    },
    org: 'Certificates.dev',
    lang: 'EN',
    cost: { fr: 'À venir', en: 'TBA' },
    costNote: { fr: 'lancement imminent — prix non publié', en: 'launching soon — price TBA' },
    validity: { fr: 'Sans expiration (à confirmer)', en: 'No expiry (to confirm)' },
    cpf: 'non',
    aff: 'oui',
    who: { fr: 'Front qui veut prouver son TS', en: 'Front devs proving their TS' },
    verdict: {
      fr: 'Par l’éditeur de la certif Angular : la première certif TypeScript vraiment crédible (challenges de code réels). À surveiller dès l’ouverture des inscriptions.',
      en: 'From the makers of the Angular cert: the first genuinely credible TypeScript certification (real code challenges). Watch for registration opening.',
    },
    detail: {
      fr: 'Deux niveaux annoncés (Developer / Senior). Statut « launching soon » au 03/07/2026.',
      en: 'Two announced levels (Developer / Senior). “Launching soon” as of 2026-07-03.',
    },
  },
  {
    id: 'ts-js',
    cat: 'autres',
    roi: 'skip',
    name: { fr: 'Certifs JS / Node génériques', en: 'Generic JS / Node certs' },
    full: {
      fr: 'Badges « langage » divers + OpenJS retirés',
      en: 'Various “language” badges + retired OpenJS',
    },
    org: '—',
    lang: '—',
    cost: { fr: '—', en: '—' },
    costNote: { fr: '', en: '' },
    validity: { fr: '—', en: '—' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'À zapper', en: 'Skip it' },
    verdict: {
      fr: 'Les badges génériques « JavaScript » ne valent pas leur prix — ton code parle plus fort. Et les certifs Node OpenJS (JSNAD/JSNSD) ont été retirées fin septembre 2025 : elles ne sont plus une option.',
      en: 'Generic “JavaScript” badges aren’t worth it — your code speaks louder. And the OpenJS Node certs (JSNAD/JSNSD) were retired end of September 2025: no longer an option.',
    },
    detail: {
      fr: 'Pour TypeScript, guetter plutôt la future certif Certificates.dev.',
      en: 'For TypeScript, watch the upcoming Certificates.dev cert instead.',
    },
  },
];

/** Sara's short-list, ordered (Angular first). */
export const CERT_VERDICT: readonly CertVerdictEntry[] = [
  {
    rank: '1',
    certId: 'ng-mid',
    line: {
      fr: 'La vraie certif Angular, créée avec des GDE — le code y est testé.',
      en: 'The real Angular certification, built with GDEs — your code is actually tested.',
    },
  },
  {
    rank: '2',
    certId: 'iaap-was',
    line: {
      fr: 'Le différenciateur a11y d’un profil front senior (RGAA/EAA = exigence légale).',
      en: 'The a11y differentiator of a senior frontend profile (RGAA/EAA = legal requirement).',
    },
  },
  {
    rank: '3',
    certId: 'psm-i',
    line: {
      fr: 'Le bonus si le budget suit : crédibilité agile à coût mini, validité à vie.',
      en: 'The bonus if budget allows: agile credibility at minimal cost, lifetime validity.',
    },
  },
];
