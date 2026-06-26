import {
  CertCategory,
  Certification,
  CertVerdictEntry,
} from '../domain/models/certification.model';

/**
 * Certifications data — verified on the web 2026-06-26 (certificates.dev,
 * angulartraining.com, blog.angularacademy.ca). FR copy is the original;
 * EN copy was authored for the bilingual site.
 *
 * IMPORTANT: only ONE credible Angular certification exists — the
 * Certificates.dev × Angular Training program (Alain Chautard, GDE), in 3 levels.
 */
export const CERT_CATEGORIES: readonly CertCategory[] = [
  {
    id: 'angular',
    featured: true,
    title: { fr: 'Les certifications Angular', en: 'Angular certifications' },
    tag: {
      fr: 'La seule qui teste vraiment Angular',
      en: 'The only one that truly tests Angular',
    },
    intro: {
      fr: 'Une seule certif Angular crédible existe : le programme Certificates.dev, créé en partenariat avec Angular Training (Alain Chautard, Google Developer Expert). Trois niveaux, un examen en ligne surveillé mêlant QCM et vrais challenges de code. Ce n’est pas une certif « officielle Google » — il n’en existe pas — mais c’est LA référence Angular reconnue par la communauté.',
      en: 'There is only one credible Angular certification: the Certificates.dev program, built in partnership with Angular Training (Alain Chautard, Google Developer Expert). Three levels, a proctored online exam mixing MCQs and real code challenges. It is not an “official Google” certification — none exists — but it is THE community-recognised Angular reference.',
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
  },
  {
    id: 'a11y',
    title: { fr: 'Accessibilité', en: 'Accessibility' },
    tag: { fr: 'Le booster le plus crédible', en: 'The most credible booster' },
    intro: {
      fr: 'WCAG/RGAA est devenu une exigence légale (FR/EU) et un vrai marqueur de séniorité front. Le complément le plus pertinent à une certif Angular.',
      en: 'WCAG/RGAA has become a legal requirement (FR/EU) and a real marker of frontend seniority. The most relevant complement to an Angular certification.',
    },
  },
  {
    id: 'scrum',
    title: { fr: 'Agilité & Scrum', en: 'Agility & Scrum' },
    tag: {
      fr: 'Le volet « équipe » attendu en senior',
      en: 'The “team” dimension expected at senior level',
    },
    intro: {
      fr: 'Une certif agile crédible rassure côté collaboration. Une seule vaut vraiment le coup pour un profil dev.',
      en: 'A credible agile certification reassures on the collaboration side. Only one is really worth it for a dev profile.',
    },
  },
  {
    id: 'autres',
    title: { fr: 'Renforcer un profil front / fullstack', en: 'Strengthen a front / fullstack profile' },
    tag: { fr: 'Élargir le profil', en: 'Broaden the profile' },
    intro: {
      fr: 'UX, cloud, déploiement : des certifs qui complètent utilement un profil Angular front ou front/fullstack, selon la direction visée.',
      en: 'UX, cloud, deployment: certifications that usefully complement an Angular front or front/fullstack profile, depending on the direction you aim for.',
    },
  },
];

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
      fr: 'La porte d’entrée : QCM sur les fondamentaux (composants, services, binding, routing). Idéale pour valider tes bases et crédibiliser un premier rôle Angular.',
      en: 'The entry point: MCQs on the fundamentals (components, services, binding, routing). Ideal to validate your basics and add credibility to a first Angular role.',
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
      fr: 'Le sweet spot : QCM avancés + 105 min de vrai code. Le signal le plus utile pour un·e dev Angular confirmé·e qui veut le prouver, pas juste l’affirmer.',
      en: 'The sweet spot: advanced MCQs + 105 min of real code. The most useful signal for an experienced Angular dev who wants to prove it, not just claim it.',
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
    costNote: { fr: 'exam + training · bundles', en: 'exam + training · bundles' },
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
    cost: { fr: '530 $', en: '$530' },
    costNote: { fr: '410-430 $ membre', en: '$410-430 for members' },
    validity: { fr: 'Recert. périodique', en: 'Periodic recert.' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'Devs & QA front', en: 'Front devs & QA' },
    verdict: {
      fr: 'LA certif a11y technique pour un·e dev front : WCAG, ARIA, tests d’accessibilité. Le meilleur complément « front senior » à une certif Angular.',
      en: 'THE technical a11y certification for a frontend dev: WCAG, ARIA, accessibility testing. The best “senior frontend” complement to an Angular certification.',
    },
    detail: {
      fr: '75 questions · 70 % pour réussir (~59 % de réussite).',
      en: '75 questions · 70% to pass (~59% pass rate).',
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
    cost: { fr: '510 $', en: '$510' },
    costNote: { fr: '410 $ membre · 170 $ pays EDE', en: '$410 members · $170 EDE countries' },
    validity: { fr: 'Recert. périodique', en: 'Periodic recert.' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'Transverse (PO, QA, dev)', en: 'Cross-role (PO, QA, dev)' },
    verdict: {
      fr: 'Base conceptuelle de l’accessibilité. Utile, mais moins « dev » que la WAS.',
      en: 'Conceptual foundation of accessibility. Useful, but less “dev” than the WAS.',
    },
    detail: {
      fr: '100 questions · 66 % pour réussir.',
      en: '100 questions · 66% to pass.',
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
      fr: 'Le meilleur rapport crédibilité / prix : aucune formation obligatoire, tu révises seul (Scrum Guide + practice tests) et tu passes l’examen. Reconnu mondialement.',
      en: 'The best credibility/price ratio: no mandatory training, you study on your own (Scrum Guide + practice tests) and take the exam. Recognised worldwide.',
    },
    detail: {
      fr: 'CPF possible via des organismes FR qui packagent l’examen ; l’exam direct est hors CPF.',
      en: 'CPF possible via French providers that bundle the exam; the direct exam is not CPF-eligible.',
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
    validity: { fr: '2 ans', en: '2 years' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'Si l’employeur l’impose', en: 'If your employer requires it' },
    verdict: {
      fr: 'Plus chère et « course-gated » que la PSM, avec un renouvellement payant. À éviter sauf exigence explicite.',
      en: 'Pricier and “course-gated” versus PSM, with paid renewal. Avoid unless explicitly required.',
    },
    detail: { fr: '', en: '' },
  },

  // ---------- Others ----------
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
    costNote: {
      fr: 'Cloud Practitioner ~100 $ pour démarrer',
      en: 'Cloud Practitioner ~$100 to start',
    },
    validity: { fr: '3 ans', en: '3 years' },
    cpf: 'verifier',
    aff: 'indirecte',
    who: { fr: 'Front qui touche au déploiement', en: 'Front devs who touch deployment' },
    verdict: {
      fr: 'Utile pour le volet « fullstack / déploiement » d’un profil front senior : serverless, CI/CD.',
      en: 'Useful for the “fullstack / deployment” side of a senior frontend profile: serverless, CI/CD.',
    },
    detail: {
      fr: 'Pas de programme d’affiliation grand public ; les cours de prép (Pluralsight/Udemy/Coursera) sont affiliables.',
      en: 'No public affiliate program; prep courses (Pluralsight/Udemy/Coursera) are affiliable.',
    },
  },
  {
    id: 'ts-js',
    cat: 'autres',
    roi: 'skip',
    name: { fr: 'Certifs JS / TS génériques', en: 'Generic JS / TS certs' },
    full: { fr: 'Badges « langage » divers', en: 'Various “language” badges' },
    org: '—',
    lang: '—',
    cost: { fr: '—', en: '—' },
    costNote: { fr: '', en: '' },
    validity: { fr: '—', en: '—' },
    cpf: 'non',
    aff: 'non',
    who: { fr: 'À zapper', en: 'Skip it' },
    verdict: {
      fr: 'Les badges génériques « JavaScript » ou « TypeScript » ne valent pas leur prix : sur ces langages, ton code et ton portfolio parlent bien plus fort qu’un certificat.',
      en: 'Generic “JavaScript” or “TypeScript” badges aren’t worth the price: on these languages, your code and portfolio speak far louder than a certificate.',
    },
    detail: { fr: '', en: '' },
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
      fr: 'Le différenciateur a11y d’un profil front senior.',
      en: 'The a11y differentiator of a senior frontend profile.',
    },
  },
  {
    rank: '3',
    certId: 'psm-i',
    line: {
      fr: 'Crédibilité agile à coût mini, validité à vie.',
      en: 'Agile credibility at minimal cost, lifetime validity.',
    },
  },
];
