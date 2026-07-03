# Observatoire — couche de données (large layer) `/carriere/observatoire`

<!-- by project-worker 2026-06-14 -->

Prototype **reviewable + runnable** de la couche de collecte LARGE qui alimente l'observatoire
marché (q134). Implémente les bullets 1→3 de l'acceptance q134 (**schéma méta → store marché
large → agrégats JSON**) ; le bullet 4 (la **page**) reste un chantier design de Sara.

Source de vérité des décisions : `../WORKERS_PEPITES_OBSERVATOIRE_CADRAGE.md` (§4 schéma, §8
métriques enrichies, §9 cadence hebdo + dedup + France Travail socle) et
`../_briefs/2026-06-08-observatoire-pepites-spec.md`.

## Principe (2 couches, 1 seul scraping)

- **Couche LARGE (cette couche)** = échantillon FR **non trié** (Angular *et* React/Vue, front
  *et* fullstack, remote *et* présentiel) → sert les **stats représentatives**.
- **Couche SÉLECTIVE (existante)** = tri ultra-sélectif des pépites publiées `/jobs` `/carriere`.
  **Inchangée.** Le même schéma, une fois filtré, peut l'alimenter ; on ne mélange jamais les
  deux sorties (sinon stats biaisées).

## Fichiers

| Fichier | Rôle |
|---|---|
| `schema/offer-metadata.schema.json` | Schéma JSON figé d'une offre (contrat des 2 couches). |
| `schema/offer-metadata.types.ts` | Types TS = contrat d'intégration pour le portage NestJS. |
| `src/normalizer.mjs` | Classe une offre brute → schéma (techno, posteType, séniorité, remote/jours bureau, salaire/TJM numériques, typeRecruteur ESN, DevRel, empreinte dedup). Heuristiques **accent-safe** (`hasWord`, boundaries Unicode). |
| `src/france-travail.collector.mjs` | Collecteur du **socle légal** France Travail (OAuth2). Credential-gated. |
| `src/market-store.mjs` | Store marché append-only JSONL + **dedup par empreinte** (stock vs flux). |
| `src/aggregator.mjs` | Store → **snapshot hebdo JSON** (les 6 métriques + médianes salaire/TJM par séniorité, jours bureau, top villes, DevRel). |
| `src/run-demo.mjs` | Pipeline complet sur fixtures + **smoke test** (assertions). |
| `fixtures/sample-offers.json` | 8 offres représentatives au format France Travail. |

## Lancer la démo (aucune credential requise)

```bash
node observatoire/src/run-demo.mjs
```

Affiche les offres normalisées, le round-trip store (dedup), le snapshot hebdo, et valide le tout
par assertions. Verifié OK le 2026-06-14 (9 offres après dedup, flux=1, angular=5, ESN=4,
1 DevRel, médianes TJM senior=675€).

## Tests unitaires

Suites `node:test` (aucune dépendance, aucun réseau) qui verrouillent le comportement de la
couche data avant le portage NestJS :

```bash
node --test "observatoire/**/*.test.mjs"
```

| Fichier | Couvre |
|---|---|
| `src/normalizer.test.mjs` | chaque heuristique `detect*`, `parseSalary`, `fingerprintFor`, `normalizeOffer`, et les garde-fous accent-/mot-safe (`octo` ≠ `doctolib`, ville en sous-chaîne ignorée). |
| `src/aggregator.test.mjs` | fenêtre stock/flux, distributions, `cityTop`, médianes salaire/TJM par séniorité, jours bureau moyens, DevRel, store vide. |
| `src/market-store.test.mjs` | dedup `mergeBatch` (new vs still-online), round-trip `saveStore`/`loadStore`, tolérance aux lignes JSONL corrompues. |

48 tests au total. La démo `run-demo.mjs` reste le smoke test d'intégration bout-en-bout.

## Brancher France Travail (Sara)

1. Créer un compte sur **francetravail.io** → souscrire à l'**API « Offres d'emploi v2 »**.
2. Récupérer `client_id` / `client_secret`, puis exporter :
   ```bash
   export FT_CLIENT_ID=...      # ou ajouter à ngdigest-back/.env
   export FT_CLIENT_SECRET=...
   ```
3. Relancer `run-demo.mjs` : il fera **en plus** un batch live (`collect()`), sinon il se contente
   des fixtures sans planter.

> ❌ Pas de scraping LinkedIn/Indeed (anti-bot + CGU). France Travail = officiel, gratuit, légal,
> id stable par offre (dedup facile). Free-Work / APEC = sources d'appoint ultérieures.

## Décisions encore ouvertes (Sara — cf cadrage §7)

1. **Stockage** du store marché + snapshots : `_state` (brut accumulé) + snapshot léger commité
   dans `ngdigest` pour la page ? (reco cadrage §5).
2. **Cadence** snapshots = **hebdo** (déjà actée §9) → planifier un worker `observatoire-stats`.
3. **DevRel** : rubrique de l'observatoire **ou** article éditorial dédié (q136) ?
4. **Portage** : transformer ce prototype en module NestJS `observatoire` (Passe 1 de
   `pepite-jobs` écrit le store ; worker frère calcule le snapshot) — wiring = décision archi Sara.
5. **Transparence page** : afficher la méthodologie (plateformes, requêtes, N offres, période) —
   déjà émise dans `snapshot.methodology`.

## Ce qui n'est PAS fait (volontairement)

- La **page** `/carriere/observatoire` (design + i18n) = chantier Sara (ground-truth 01/06 : pas de
  préemption design des écrans carrière).
- Le **fetch live réel** (besoin des credentials France Travail).
- Le **portage NestJS** + le câblage à `pepite-jobs` (décision archi).
- Les listes ESN / villes sont des **seeds minimales** à enrichir.
