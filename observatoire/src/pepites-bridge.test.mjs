// Tests du pont couche SÉLECTIVE → schéma ObserveOffer (q135).
// Zéro dépendance, zéro réseau — alignés sur les suites existantes de la couche
// observatoire (`node --test "observatoire/**/*.test.mjs"`).
// by project-worker 2026-08-15

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  buildPepitesIndex,
  contractFromFrontmatter,
  remoteFromFrontmatter,
  sourceFromUrl,
  tagPepite,
  technoFromStack,
  toIsoDate,
  zoneFromFrontmatter,
} from './pepites-bridge.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(
  readFileSync(join(__dirname, '..', 'schema', 'offer-metadata.schema.json'), 'utf8'),
);

/** Fiche pépite représentative (calquée sur Hospitable, la seule offre active). */
const HOSPITABLE = {
  slug: 'hospitable-senior-frontend-angular',
  title: 'Senior Front-End Angular Product Engineer',
  company: 'Hospitable',
  type: 'CDI',
  remote: 100,
  zone: 'EU',
  location: 'Europe (remote-only)',
  salary: "134 450 - 167 258 USD/an + equity ($HOST RSUs) + PSUs jusqu'à 387k$/an",
  tjm: null,
  stack: ['Angular', 'RxJS', 'Tailwind', 'Ionic (bonus)'],
  url: 'https://apply.workable.com/hospitable/j/3C7DDE165E/',
  scannedAt: '2026-06-01',
  status: 'active',
  tags: ['angular', 'remote-eu', 'salaire-affiche'],
  editorialHook: 'Du vrai Angular moderne, 100% remote Europe.',
};

// --- mappings frontmatter ---------------------------------------------------

test('remoteFromFrontmatter mappe les 3 valeurs du schéma pépite', () => {
  assert.equal(remoteFromFrontmatter(100), 'full');
  assert.equal(remoteFromFrontmatter('hybride'), 'hybride');
  assert.equal(remoteFromFrontmatter('onsite'), 'onsite');
  assert.equal(remoteFromFrontmatter(undefined), null, 'absent → on laisse la main à l’heuristique');
});

test('contractFromFrontmatter mappe CDI / Freelance', () => {
  assert.equal(contractFromFrontmatter('CDI'), 'cdi');
  assert.equal(contractFromFrontmatter('Freelance'), 'freelance');
  assert.equal(contractFromFrontmatter('Stage'), 'autre');
  assert.equal(contractFromFrontmatter(null), null);
});

test('zoneFromFrontmatter traduit Worldwide → WW (enum du schéma)', () => {
  assert.equal(zoneFromFrontmatter('FR'), 'FR');
  assert.equal(zoneFromFrontmatter('EU'), 'EU');
  assert.equal(zoneFromFrontmatter('Worldwide'), 'WW');
  assert.equal(zoneFromFrontmatter('ailleurs'), null);
});

test('technoFromStack lit la stack curée sans se faire piéger par une sous-chaîne', () => {
  assert.equal(technoFromStack(['Angular', 'RxJS']), 'angular');
  assert.equal(technoFromStack(['React', 'Next.js']), 'react');
  assert.equal(technoFromStack(['Vue.js']), 'vue');
  assert.equal(technoFromStack(['Node', 'PostgreSQL']), null, 'aucun framework front connu');
  assert.equal(technoFromStack(undefined), null);
});

test('sourceFromUrl déduit la plateforme, défaut "autre"', () => {
  assert.equal(sourceFromUrl('https://www.welcometothejungle.com/fr/jobs/x'), 'wttj');
  assert.equal(sourceFromUrl('https://www.linkedin.com/jobs/view/1'), 'linkedin');
  assert.equal(sourceFromUrl('https://www.free-work.com/fr/tech-it/x'), 'free-work');
  assert.equal(sourceFromUrl('https://www.apec.fr/candidat/x'), 'apec');
  assert.equal(sourceFromUrl('https://apply.workable.com/hospitable/j/3C7DDE165E/'), 'autre');
  assert.equal(sourceFromUrl(undefined), 'autre');
});

test('toIsoDate accepte Date et chaîne, rejette le reste', () => {
  assert.equal(toIsoDate(new Date('2026-06-01T00:00:00Z')), '2026-06-01');
  assert.equal(toIsoDate('2026-06-01'), '2026-06-01');
  assert.equal(toIsoDate('bientôt'), null);
  assert.equal(toIsoDate(undefined), null);
});

// --- taggage complet --------------------------------------------------------

test('tagPepite tague les 5 axes demandés par l’acceptance q135', () => {
  const o = tagPepite(HOSPITABLE);
  assert.equal(o.techno, 'angular'); // techno
  assert.equal(o.posteType, 'front'); // poste
  assert.equal(o.seniority, 'senior'); // séniorité
  assert.equal(o.salaryMin, 134450); // salaire (normalisé en nombre)
  assert.equal(o.salaryMax, 167258);
  assert.equal(o.remote, 'full'); // mode de travail
});

test('tagPepite : le frontmatter curé prime sur l’heuristique texte', () => {
  // Le texte dit « hybride 3 jours sur site » mais Sara a curé `remote: 100`,
  // et la stack dit Angular alors que la note parle surtout de React.
  const o = tagPepite({
    ...HOSPITABLE,
    editorialNote: 'Poste hybride, 3 jours sur site, plutôt orienté React.',
  });
  assert.equal(o.remote, 'full', 'le champ curé gagne');
  assert.equal(o.officeDaysPerWeek, null, 'pas de jours bureau hors hybride');
  assert.equal(o.techno, 'angular', 'la stack curée gagne sur le texte');
});

test('tagPepite : sans champ curé, l’heuristique du normalizer reprend la main', () => {
  const o = tagPepite({
    title: 'Développeur Fullstack Node/React confirmé',
    company: 'Capgemini',
    stack: ['Node', 'PostgreSQL'],
    editorialNote: 'Hybride, 2 jours sur site à Lyon.',
    scannedAt: '2026-08-15',
  });
  assert.equal(o.remote, 'hybride', 'la prose peut fournir le mode de travail');
  assert.equal(o.officeDaysPerWeek, 2, 'les jours bureau ne viennent que de la prose');
  assert.equal(o.techno, 'react', 'retombe sur la détection depuis l’intitulé');
  assert.equal(o.posteType, 'fullstack');
  assert.equal(o.seniority, 'confirme');
  assert.equal(o.typeRecruteur, 'esn');
  assert.equal(o.contractType, 'inconnu', 'aucun `type` curé → jamais deviné');
});

test('tagPepite : la note éditoriale ne classe PAS le poste (régression Aircall)', () => {
  // Cas réel : la note dit « 100% frontend, pas mixé back » / « pas fullstack
  // imposé ». Un détecteur par mots-clés y lit « fullstack » et inverse le
  // classement. La prose est donc exclue de techno / posteType / séniorité.
  const o = tagPepite({
    title: 'Frontend Engineer (Remote France)',
    company: 'Aircall',
    type: 'CDI',
    remote: 100,
    zone: 'FR',
    location: 'France',
    stack: ['Angular', 'TypeScript', 'GraphQL'],
    tags: ['angular', 'remote-france', 'cdi-senior'],
    editorialHook: '100% frontend, pas mixé back. Médiane FR plutôt 65-90k.',
    editorialNote: 'Position 100% frontend (pas fullstack imposé), junior s’abstenir.',
    scannedAt: '2026-05-16',
  });
  assert.equal(o.posteType, 'front', 'la négation de la prose ne doit pas basculer en fullstack');
  assert.equal(o.seniority, 'senior', 'vient du tag curé `cdi-senior`, pas du « junior » de la prose');
  assert.equal(o.techno, 'angular');
  // …mais la prose reste intégralement conservée pour l'audit.
  assert.match(o.raw, /pas fullstack imposé/);
});

test('tagPepite : salaire et TJM sont parsés séparément (jamais mélangés)', () => {
  const cdi = tagPepite({ ...HOSPITABLE, salary: '65k-90k€', tjm: null });
  assert.deepEqual(
    [cdi.salaryMin, cdi.salaryMax, cdi.tjmMin, cdi.tjmMax],
    [65000, 90000, null, null],
  );

  const freelance = tagPepite({
    ...HOSPITABLE,
    type: 'Freelance',
    salary: null,
    tjm: '550-650€/j',
  });
  assert.deepEqual(
    [freelance.salaryMin, freelance.salaryMax, freelance.tjmMin, freelance.tjmMax],
    [null, null, 550, 650],
  );
  assert.equal(freelance.contractType, 'freelance');
});

test('tagPepite : l’empreinte est stable et comparable à la couche LARGE', () => {
  const a = tagPepite(HOSPITABLE);
  const b = tagPepite({ ...HOSPITABLE, editorialHook: 'texte différent' });
  assert.equal(a.fingerprint, b.fingerprint, 'même entreprise/intitulé/lieu → même empreinte');

  const other = tagPepite({ ...HOSPITABLE, company: 'Autre Boîte' });
  assert.notEqual(a.fingerprint, other.fingerprint);
});

test('tagPepite : DevRel détecté depuis la note éditoriale', () => {
  const o = tagPepite({
    ...HOSPITABLE,
    editorialNote: 'Poste de Developer Advocate sur l’écosystème Angular.',
  });
  assert.equal(o.isDevRel, true);
  assert.equal(tagPepite(HOSPITABLE).isDevRel, false);
});

test('tagPepite : frontmatter vide → aucune exception, tout en "inconnu"', () => {
  const o = tagPepite({});
  assert.equal(o.techno, 'autre');
  assert.equal(o.posteType, 'inconnu');
  assert.equal(o.seniority, 'inconnu');
  assert.equal(o.remote, 'inconnu');
  assert.equal(o.zone, 'inconnu');
  assert.equal(o.contractType, 'inconnu');
  assert.equal(o.title, null);
  assert.equal(o.raw, null);
});

// --- conformité au schéma figé ---------------------------------------------

test('la sortie est strictement conforme à offer-metadata.schema.json', () => {
  const offer = tagPepite(HOSPITABLE);
  const props = SCHEMA.properties;

  for (const key of SCHEMA.required) {
    assert.ok(key in offer, `champ requis manquant : ${key}`);
    assert.notEqual(offer[key], undefined, `champ requis undefined : ${key}`);
  }
  for (const key of Object.keys(offer)) {
    assert.ok(props[key], `champ hors schéma (additionalProperties: false) : ${key}`);
  }
  for (const [key, spec] of Object.entries(props)) {
    if (spec.enum && offer[key] !== null) {
      assert.ok(spec.enum.includes(offer[key]), `valeur hors enum pour ${key} : ${offer[key]}`);
    }
  }
});

// --- index de sortie --------------------------------------------------------

test('buildPepitesIndex isole la couche sélective et garde ObserveOffer pur', () => {
  const index = buildPepitesIndex([
    { file: 'a.md', frontmatter: { ...HOSPITABLE, scannedAt: '2026-06-01' } },
    {
      file: 'b.md',
      frontmatter: { ...HOSPITABLE, slug: 'old', status: 'expired', scannedAt: '2026-05-16' },
    },
  ]);

  assert.equal(index.layer, 'selective');
  assert.match(index.warning, /LARGE/);
  assert.deepEqual(index.counts, { total: 2, active: 1, expired: 1 });
  assert.equal(index.offers[0].file, 'a.md', 'trié du plus récemment scanné au plus ancien');

  // slug / status / url vivent dans l'enveloppe, jamais dans ObserveOffer
  const meta = index.offers[0].metadata;
  for (const forbidden of ['slug', 'status', 'url']) {
    assert.equal(meta[forbidden], undefined, `${forbidden} ne doit pas polluer ObserveOffer`);
  }
  assert.equal(index.offers[0].slug, 'hospitable-senior-frontend-angular');
});

test('buildPepitesIndex tague AUSSI les offres expirées (offres scannées)', () => {
  const index = buildPepitesIndex([
    { file: 'x.md', frontmatter: { ...HOSPITABLE, status: 'expired' } },
  ]);
  assert.equal(index.counts.expired, 1);
  assert.equal(index.offers[0].metadata.techno, 'angular');
});
