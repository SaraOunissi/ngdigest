// Unit tests for the observatoire normalizer heuristics.
// Run: node --test "observatoire/**/*.test.mjs"
// by test/observatoire-hardening

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  hasWord,
  detectTechno,
  detectPosteType,
  detectSeniority,
  detectRemote,
  detectContract,
  parseSalary,
  detectTypeRecruteur,
  detectDevRel,
  detectZoneCity,
  fingerprintFor,
  normalizeOffer,
} from './normalizer.mjs';

// --- hasWord (accent- and boundary-safety) ---------------------------------

test('hasWord: matches a whole accented word but not a substring', () => {
  assert.equal(hasWord('poste confirmé requis', ['confirmé']), true);
  assert.equal(hasWord('octo technology', ['octo']), true);
  // the famous false-positive guard: "octo" must NOT hit inside "doctolib"
  assert.equal(hasWord('doctolib', ['octo']), false);
  // nor inside "feedback"
  assert.equal(hasWord('feedback culture', ['back']), false);
});

// --- techno -----------------------------------------------------------------

test('detectTechno: tags the framework that actually appears', () => {
  assert.equal(detectTechno('Développeur Angular 18'), 'angular');
  assert.equal(detectTechno('React Native app'), 'react');
  assert.equal(detectTechno('Vue.js 3 SPA'), 'vue');
  assert.equal(detectTechno('Développeur PHP Symfony'), 'autre');
});

test('detectTechno: Angular wins over React when both appear (editorial order)', () => {
  assert.equal(detectTechno('Migration React vers Angular'), 'angular');
});

// --- posteType --------------------------------------------------------------

test('detectPosteType: front / back / fullstack / inconnu', () => {
  assert.equal(detectPosteType('Développeur Front-end Angular'), 'front');
  assert.equal(detectPosteType('Développeur Backend Java'), 'back');
  assert.equal(detectPosteType('Développeur Fullstack React/Node'), 'fullstack');
  assert.equal(detectPosteType('Lead Developer Angular'), 'inconnu');
});

test('detectPosteType: front + back mentioned together reads as fullstack', () => {
  assert.equal(detectPosteType('Poste front et back, stack complète'), 'fullstack');
});

test('detectPosteType: "front end" and "front-end" normalise to front', () => {
  assert.equal(detectPosteType('Ingénieur front end'), 'front');
  assert.equal(detectPosteType('Ingénieur front-end'), 'front');
});

// --- seniority --------------------------------------------------------------

test('detectSeniority: explicit labels (accent-safe)', () => {
  assert.equal(detectSeniority('Tech Lead Angular'), 'lead');
  assert.equal(detectSeniority('Développeur Senior'), 'senior');
  assert.equal(detectSeniority('Développeur confirmé'), 'confirme');
  assert.equal(detectSeniority('Poste junior, jeune diplômé'), 'junior');
});

test('detectSeniority: years-of-experience heuristic', () => {
  assert.equal(detectSeniority('2 ans d’expérience'), 'junior');
  assert.equal(detectSeniority('3 ans d’expérience'), 'confirme');
  assert.equal(detectSeniority('6 ans d’expérience'), 'senior');
  assert.equal(detectSeniority('10 ans d’expérience'), 'lead');
});

test('detectSeniority: nothing recognised → inconnu', () => {
  assert.equal(detectSeniority('Développeur web'), 'inconnu');
});

// --- remote / office days ---------------------------------------------------

test('detectRemote: full / hybride / onsite / inconnu', () => {
  assert.deepEqual(detectRemote('100% télétravail'), { remote: 'full', officeDaysPerWeek: null });
  assert.equal(detectRemote('Full remote France').remote, 'full');
  assert.equal(detectRemote('Présentiel Lyon').remote, 'onsite');
  assert.equal(detectRemote('Développeur Angular').remote, 'inconnu');
});

test('detectRemote: parses office days for hybrid offers', () => {
  const r = detectRemote('Hybride, 2 jours sur site à Paris');
  assert.equal(r.remote, 'hybride');
  assert.equal(r.officeDaysPerWeek, 2);
});

test('detectRemote: bare "remote" mention is treated as hybride (conservative)', () => {
  assert.equal(detectRemote('Télétravail possible').remote, 'hybride');
});

// --- contract ---------------------------------------------------------------

test('detectContract: France Travail code takes priority', () => {
  assert.equal(detectContract('', 'CDI'), 'cdi');
  assert.equal(detectContract('', 'LIB'), 'freelance');
  assert.equal(detectContract('', 'FRA'), 'freelance');
});

test('detectContract: falls back to text', () => {
  assert.equal(detectContract('Mission freelance en portage', ''), 'freelance');
  assert.equal(detectContract('Poste en CDI', ''), 'cdi');
  assert.equal(detectContract('Contrat en alternance', ''), 'autre');
  assert.equal(detectContract('Développeur Angular', ''), 'inconnu');
});

// --- salary / TJM -----------------------------------------------------------

test('parseSalary: annual ranges with k and spaces', () => {
  assert.deepEqual(parseSalary('55k-70k€'), {
    salaryMin: 55000, salaryMax: 70000, tjmMin: null, tjmMax: null,
  });
  assert.deepEqual(parseSalary('50 000 - 65 000 €'), {
    salaryMin: 50000, salaryMax: 65000, tjmMin: null, tjmMax: null,
  });
});

test('parseSalary: TJM ranges are detected as day rates, not salaries', () => {
  assert.deepEqual(parseSalary('TJM 550-650€/j'), {
    salaryMin: null, salaryMax: null, tjmMin: 550, tjmMax: 650,
  });
});

test('parseSalary: out-of-range noise is ignored', () => {
  // "3 ans" and a phone-like number must not become a salary.
  assert.deepEqual(parseSalary('3 ans d’expérience'), {
    salaryMin: null, salaryMax: null, tjmMin: null, tjmMax: null,
  });
});

// --- typeRecruteur ----------------------------------------------------------

test('detectTypeRecruteur: known ESN by company name', () => {
  assert.equal(detectTypeRecruteur('Capgemini', ''), 'esn');
  assert.equal(detectTypeRecruteur('Octo Technology', ''), 'esn');
  // newly seeded ESN
  assert.equal(detectTypeRecruteur('Akkodis', ''), 'esn');
  assert.equal(detectTypeRecruteur('SQLI', ''), 'esn');
});

test('detectTypeRecruteur: "octo" must not false-match inside another name', () => {
  assert.equal(detectTypeRecruteur('Doctolib', ''), 'client-final');
});

test('detectTypeRecruteur: cabinet vs esn keywords', () => {
  assert.equal(detectTypeRecruteur('Cabinet de recrutement TechStaff', ''), 'cabinet-recrutement');
  assert.equal(detectTypeRecruteur('Société de portage XYZ', ''), 'esn');
});

test('detectTypeRecruteur: plain product company → client-final, empty → inconnu', () => {
  assert.equal(detectTypeRecruteur('Back Market', ''), 'client-final');
  assert.equal(detectTypeRecruteur('', ''), 'inconnu');
});

// --- DevRel -----------------------------------------------------------------

test('detectDevRel: advocacy titles are flagged, plain dev is not', () => {
  assert.equal(detectDevRel('Developer Advocate / DevRel'), true);
  assert.equal(detectDevRel('Developer Relations Engineer'), true);
  assert.equal(detectDevRel('Développeur Angular Senior'), false);
});

// --- zone / city ------------------------------------------------------------

test('detectZoneCity: France Travail city takes priority and sets FR zone', () => {
  const r = detectZoneCity('Angular CDI', 'Lille');
  assert.equal(r.city, 'Lille');
  assert.equal(r.zone, 'FR');
});

test('detectZoneCity: falls back to a whole-word city in the text', () => {
  assert.equal(detectZoneCity('Poste basé à Bordeaux', null).city, 'Bordeaux');
});

test('detectZoneCity: word-boundary guard — a city inside another word does not leak', () => {
  // "parcours" contains "cours"… and crucially no city token should hit here.
  // "Toulousain" contains "toulouse"? no; use a real substring trap:
  // "strasbourgeois" contains "strasbourg" but must NOT set the city.
  assert.equal(detectZoneCity('Candidat strasbourgeois recherché', null).city, null);
});

test('detectZoneCity: Europe and remote-FR handling', () => {
  assert.equal(detectZoneCity('Full remote Europe', null).zone, 'EU');
  const fr = detectZoneCity('Remote France', null);
  assert.equal(fr.zone, 'FR');
});

// --- fingerprint ------------------------------------------------------------

test('fingerprintFor: prefers the stable source id', () => {
  assert.equal(fingerprintFor({ sourceId: 'FT-0001' }), 'FT-0001');
});

test('fingerprintFor: hashes company|title|city when no source id, stably', () => {
  const a = fingerprintFor({ company: 'Acme', title: 'Dev Angular', city: 'Paris' });
  const b = fingerprintFor({ company: 'Acme', title: 'Dev Angular', city: 'Paris' });
  assert.equal(a, b);
  assert.equal(a.length, 16);
  const c = fingerprintFor({ company: 'Acme', title: 'Dev React', city: 'Paris' });
  assert.notEqual(a, c);
});

// --- normalizeOffer (integration) ------------------------------------------

test('normalizeOffer: maps a raw France-Travail-shaped offer to the full schema', () => {
  const offer = normalizeOffer({
    sourceId: 'FT-0001',
    source: 'france-travail',
    title: 'Développeur Angular Senior (H/F)',
    company: 'Norsys',
    description: 'CDI. Angular 18, RxJS. 100% télétravail. 5 ans. 55k-70k€.',
    salaryText: '55k-70k€ annuel',
    city: 'Lille',
    contractCode: 'CDI',
    scannedAt: '2026-06-14',
  });
  assert.equal(offer.fingerprint, 'FT-0001');
  assert.equal(offer.techno, 'angular');
  assert.equal(offer.seniority, 'senior');
  assert.equal(offer.remote, 'full');
  assert.equal(offer.contractType, 'cdi');
  assert.equal(offer.typeRecruteur, 'esn');
  assert.equal(offer.zone, 'FR');
  assert.equal(offer.city, 'Lille');
  assert.equal(offer.salaryMin, 55000);
  assert.equal(offer.salaryMax, 70000);
  assert.equal(offer.isDevRel, false);
  assert.equal(offer.firstSeen, '2026-06-14');
  assert.equal(offer.lastSeen, '2026-06-14');
});

test('normalizeOffer: fills scannedAt default and clamps raw length', () => {
  const offer = normalizeOffer({
    title: 'X',
    company: 'Y',
    description: 'z'.repeat(5000),
    scannedAt: '2026-06-14',
  });
  assert.ok(offer.raw.length <= 2000);
  assert.equal(offer.source, 'france-travail');
});
