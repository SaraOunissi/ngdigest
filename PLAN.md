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

- local : lot complet sur `feat/jobs-rattrapage-2026-09-28` (commit 3714664 + commit
  de la veille du 02/10) ;
- testé localement le 02/10 : `generate-jobs-data` (9 offres), `check:tag-jobs`,
  `scripts/lib/*.test.mjs` 73/73, `observatoire/src/*.test.mjs` 65/65, `npm run build`
  vert (79 routes prérendues) ; Quality Gate complet non exécuté en local ;
- PR vers `main` : à ouvrir ;
- fusion, déploiement et affichage des 5 offres en production : non faits.

## Observatoire — données couche sélective (29 septembre → 2 octobre 2026)

`observatoire/data/pepites-tagged.json` datait du 01/06 (2 offres) ; `npm run check:tag-jobs` sortait en échec. Régénéré le 02/10 par `npm run tag:jobs` après la veille du jour : 9 offres taguées (5 actives, 4 expirées), `generatedAt` 2026-10-02, vérification `--check` verte. Versionné avec le lot /jobs (même branche, même PR) ; non fusionné. Les snapshots mensuels `_drafts/observatoire-snapshots/` (brouillons privés) sont une autre source : leurs chiffres Free-Work (parts, variations) ont été recalculés sans écart, mais les compteurs eux-mêmes ne sont pas revérifiés. <!-- by project-worker 2026-10-01 -->

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
