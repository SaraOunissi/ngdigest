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

Statut : réalisé et testé localement ; fusion, déploiement et affichage en production
restent à vérifier.

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
