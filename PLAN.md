# ngdigest — état courant

Ce fichier est l’unique état d’avancement technique du dépôt. NgDigest regroupe la
veille Angular, les contenus carrière, les offres sélectionnées et l’Observatoire.
Le code actif se trouve dans `ngdigest-front/` et `ngdigest-back/`.

## Version publiée

La première consolidation a été fusionnée le 26 septembre 2026 dans la
[PR #1](https://github.com/SaraOunissi/ngdigest/pull/1). Les contrôles publiés ont
validé les dépendances, le lint, la navigation clavier, les repères HTML et les
contrastes, sans abaisser les seuils :

- [Quality Gate](https://github.com/SaraOunissi/ngdigest/actions/runs/36240828585) ;
- [Dependency Audit](https://github.com/SaraOunissi/ngdigest/actions/runs/36240828483).

La recette synthétique couvre les routes configurées sur 320, 390, 768 et 1440 px.
Elle ne valide pas chaque donnée réelle ni chaque collecteur. Les preuves et leurs
limites sont conservées dans
`D:/dev/_state/_audits/consolidation-2026-09-26/README.md`.

La réconciliation des travaux locaux a ensuite été fusionnée le 27 septembre dans
la PR 2 ; la PR 3 a réaligné ce PLAN. Le déploiement de cette version produit
n'a pas été revalidé pendant la passe documentaire du 27 septembre ; ne pas
le déduire de la seule fusion.

## Organisation

Les instructions durables se trouvent dans `CLAUDE.md`, le point d’entrée dans
`AGENTS.md` et le fonctionnement dans `README.md`. Les anciens PLAN restent dans
`docs/history/`, dossier privé ignoré par Git.

Le socle maintenu est `D:/dev/_state/engineering/`. `.engineering/quality.json` est
la configuration propre au projet ; les autres fichiers de `.engineering/` sont les
exports minimaux nécessaires à une CI autonome, contrôlés par hash.

## Offres /jobs

Le 28/09/2026, le board ne comptait plus aucune offre active : les sélections de la
veille `pepites-job` restaient dans `_carriere/jobs-a-publier/` depuis juin. Rattrapage
sur la branche `feat/jobs-rattrapage-2026-09-28` : 6 offres re-vérifiées à la source le
28/09 (Agicap, Dougs, Builder.io, SerpApi ×2, ViaBill), Hospitable passée en `expired`.

- La veille écrit désormais directement dans `ngdigest-front/src/content/jobs/`
  (un fichier bilingue par offre, voir `_schema.md`), sans commande git.
- `scripts/lib/jobs-schema.mjs` fait échouer `generate-jobs-data` (prebuild) si une
  offre ne respecte pas le contrat ; tests dans `jobs-schema.test.mjs`.
- Une offre freelance payée à l'année affiche son montant annuel
  (`domain/models/job-compensation.ts`).
- Le moniteur de liens traite une redirection `?not_found=true` comme un lien mort.

Veille du 02/10/2026 : N2JSoft ajoutée
(`2026-09-11-n2jsoft-developpeur-fullstack-confirme-dotnet-angular.md`, 40-50 k€, full
remote FR) ; Agicap (404 Lever) et Builder.io (board Greenhouse vide) passées en
`expired` ; ViaBill, Dougs et SerpApi ×2 re-vérifiées (`scannedAt` 2026-10-02).
Board : 9 offres, **5 actives** (ViaBill, Dougs, SerpApi ×2, N2JSoft), 4 expirées
(Agicap, Builder.io, Hospitable, Aircall).

Statut au 03/10/2026 :

- testé localement le 02/10 : `generate-jobs-data` (9 offres), `check:tag-jobs`,
  `scripts/lib/*.test.mjs` 73/73, `observatoire/src/*.test.mjs` 65/65, `npm run build`
  vert (79 routes prérendues) ;
- fusionné : [PR #5](https://github.com/SaraOunissi/ngdigest/pull/5), merge `9f11ec4`
  le 03/10 à 19:57 UTC. [Quality](https://github.com/SaraOunissi/ngdigest/actions/runs/37149774423)
  vert sur `main` ; Dependency Audit rouge sur la PR (voir ci-dessous) ;
- déployé : Vercel Production `success` pour `9f11ec4` (03/10, 19:58 UTC) ;
- vérifié en production le 03/10 : `https://ngdigest.co/fr/jobs` et `/en/jobs`
  affichent exactement 5 offres actives (ViaBill, SerpApi ×2, Dougs, N2JSoft, 5 boutons
  « Postuler ») et 4 offres dans « Offres archivées ». Les URL sans préfixe de langue
  (`/jobs`) renvoient 404, comme les autres pages du site.

## Dépendances et Angular 22 (03-04/10/2026)

Le Dependency Audit (`.engineering/security.py`) était rouge depuis le 03/10 sur des
alertes publiées du 18/09 au 01/10. Il est revenu au vert après deux PR fusionnées et
déployées :

- [PR #7](https://github.com/SaraOunissi/ngdigest/pull/7) (merge `2589058`) : back —
  `jest` 30.5.2 et `ts-loader` 9.6.2 retirent `micromatch`/`braces`
  (GHSA-vfj7-8cjw-p6xm) ; front — Angular 21.2.25 (`@angular/router`,
  GHSA-ff3f-86qr-9cv3) et `piscina` 5.3.2 (GHSA-67c8-pqhq-4rmx, critical) ;
- [PR #8](https://github.com/SaraOunissi/ngdigest/pull/8) (merge `574501b`, 03/10
  22:06 UTC) : Angular 22.2.1, TypeScript 6.0.3, angular-eslint 22.5.0,
  typescript-eslint 8.71.0. `@angular/cli` 22 ne dépend plus de `pacote`, ce qui
  retire `http-cache-semantics` (GHSA-ch52-4w7c-c8xp, sans version corrigée).
  Migrations officielles : `withNoIncrementalHydration()` (comportement pré-v22
  conservé), `withXhr()` dans deux specs ; `baseUrl` retiré du tsconfig (TS 6).

Preuves : sur la PR #8, Dependency Audit, Quality Gate et Vercel verts, état GitHub
`clean`. Vercel Production `success` pour `574501b`. Vérifié en production le 03/10 :
pages clés en 200, `ng-version="22.2.1"`, `/` redirige vers `/fr`, `/fr/jobs` affiche
5 offres actives et 4 archivées, console sans erreur.

Points connus, sans effet en production :

- 78 routes prérendues au lieu de 79 : `/resources` (redirection, déjà 404) n'est
  plus comptée ;
- `angular.json` a `security.allowedHosts: []` : `server.mjs` refuse tout hôte non
  listé (400). Vercel sert les fichiers prérendus et n'utilise pas ce serveur. Test
  local : `NG_ALLOWED_HOSTS=localhost` ;
- `test:e2e` du back échoue, déjà avant ces PR : `test/jest-e2e.json` n'a pas le
  `moduleNameMapper` des imports `.js` (la CI ne le lance pas).

## Observatoire — données couche sélective (29 septembre → 2 octobre 2026)

`observatoire/data/pepites-tagged.json` datait du 01/06 (2 offres) ; `npm run check:tag-jobs` sortait en échec. Régénéré le 02/10 par `npm run tag:jobs` après la veille du jour : 9 offres taguées (5 actives, 4 expirées), `generatedAt` 2026-10-02, vérification `--check` verte. Fusionné avec le lot /jobs ([PR #5](https://github.com/SaraOunissi/ngdigest/pull/5), 03/10). Les snapshots mensuels `_drafts/observatoire-snapshots/` (brouillons privés) sont une autre source : leurs chiffres Free-Work (parts, variations) ont été recalculés sans écart, mais les compteurs eux-mêmes ne sont pas revérifiés. <!-- by project-worker 2026-10-01 -->

## Prochaines passes produit

- Valider la fraîcheur et les volumes du snapshot Observatoire de septembre avant publication.
- Auditer la fraîcheur par source : un flux public accessible ne valide pas tous les collecteurs.
- Décider du devenir de l’Observatoire après avoir éprouvé un second consommateur du contrat de données.

## Vérification et livraison

Exécuter `python .engineering/quality.py --mode all` avec les dépendances déclarées
dans `.github/workflows/quality.yml`. Les preuves locales restent dans
`.engineering/artifacts/` et ne valident que le commit contrôlé.

Toujours distinguer local, testé, fusionné, déployé et vérifié en production. Les
hooks locaux protègent ce poste ; la protection GitHub doit être vérifiée séparément.
