# ngdigest — état courant

Réconcilié le 21 septembre 2026. **Seul fichier d'avancement technique du dépôt.**
Veille et ressources Angular, contenus carrière, offres sélectionnées et observatoire. Code actif : `ngdigest-front/` et `ngdigest-back/`.

## Consolidation

Instructions durables dans `CLAUDE.md`, point d'entrée `AGENTS.md`, fonctionnement
dans `README.md`. Les rapports datés sont des preuves historiques, pas des listes
concurrentes. Les anciens PLAN sont conservés intégralement dans `docs/history/`
(archives privées locales, ignorées par Git). Archiver ne clôture aucune demande humaine.

Le socle maintenu est `D:/dev/_state/engineering/`. `.engineering/quality.json` est
l'unique configuration du projet ; les autres fichiers de ce dossier sont les
exports minimaux nécessaires à une CI autonome, contrôlés par hash. Surveillance,
tests du socle et installation des hooks restent centraux.

## Prochaines passes produit, séparées de ce chantier

- Traiter les erreurs de lint backend et les contrastes détectés par la recette synthétique.
- Rétablir une preuve de collecte de l'observatoire : le snapshot local de juillet est ancien ;
  conserver la page dans NgDigest tant qu'un second consommateur du contrat de données n'est pas éprouvé.
- Auditer séparément la fraîcheur par source ; un flux public accessible ne valide pas tous les collecteurs.

## Validation du 26 septembre

Correctifs de consolidation validés sur `4e3ee7b` : dépendances, lint, navigation clavier,
repères HTML et contrastes via les tokens propres au produit. Aucun seuil du gate abaissé.
[Quality Gate](https://github.com/SaraOunissi/ngdigest/actions/runs/36240828585) et
[Dependency Audit](https://github.com/SaraOunissi/ngdigest/actions/runs/36240828483) réussis.
La [PR #1](https://github.com/SaraOunissi/ngdigest/pull/1) porte la fusion et les preuves
ultérieures de livraison. La validation synthétique couvre les routes déclarées dans
quality.json sur 320, 390, 768 et 1440 px ; elle ne valide pas toutes les données réelles.

## Preuves et livraison

Lancer `python .engineering/quality.py --mode all` avec les dépendances déclarées
dans `.github/workflows/quality.yml`. Preuves locales ignorées par Git :
`.engineering/artifacts/` (`all.json` ou rapport partiel daté). Les rapports antérieurs
à la modification du socle ne valident pas automatiquement sa nouvelle version.
Historique initial : `D:/dev/_state/_audits/engineering/2026-09-21.md`.
Suivi courant de consolidation : `D:/dev/_state/_audits/consolidation-2026-09-26/README.md`.

Distinguer local, testé, déployé et vérifié en production. Les branches distantes
étaient non protégées lors de l'audit ; les hooks locaux bloquent main/master sur
ce poste, sans protéger GitHub ni les autres outils. Revoir la diff, résoudre les
contrôles rouges, publier les workflows et configurer les contrôles requis avant
de déclarer la production protégée. Le succès CI ne prouve pas une livraison : vérifier le déploiement associé à la fusion et les parcours publics ; consigner la preuve dans la PR.
