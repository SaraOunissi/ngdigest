# ngdigest — état courant

Ce fichier est l’unique état d’avancement technique du dépôt. NgDigest regroupe la
veille Angular, les contenus carrière, les offres sélectionnées et l’Observatoire.
Le code actif se trouve dans `ngdigest-front/` et `ngdigest-back/`.

## Pied de page : « Un outil La Développeuse » — 4 novembre 2026 (branche `feature/footer-la-developpeuse`)

Plan SEO étape 3.4 (réseau), demandé par Sara le 04/11. Le pied de page renvoie vers l'étude de cas du site sur le Lab de La Développeuse (https://ladeveloppeuse.com/lab/ngdigest, version EN pour `/en`), libellés FR/EN dans l'i18n, couleurs par jetons existants. Fichier : `ngdigest-front/src/app/shared/components/footer/footer.html`. Vérifié en local : tests et build.

## Offres taguées pour l'Observatoire : contrôle remis au vert et ajouté à la CI — 4 novembre 2026 (branche `fix/tag-jobs-ci-2026-11-04`)

`npm run check:tag-jobs` échouait sur `main` (constat du project-worker le 03/11, revérifié le 04/11 sur `5fb3118`) : `observatoire/data/pepites-tagged.json` datait du 02/10 (9 offres) alors que le board en compte 12 depuis le 02/11. Régénéré par `npm run tag:jobs` : 12 offres, 6 actives, 6 archivées, `generatedAt` 2026-11-02. Local : `--check` vert, 79 tests scripts et 65 tests Observatoire verts, gate `policy` vert. Statut : PR #23 ouverte, fusion par Sara. Le passage du contrôle en CI est séparé (branche `ci/jobs-tag-check-2026-11-04`) car il demande une décision de Sara : ajouter `observatoire/data/pepites-tagged.json` aux chemins `jobs` de `D:/dev/_state/publish_queue/allowlist.json` et `npm run tag:jobs` aux contrôles jobs de `publier-donnees`, sinon la prochaine actualisation des offres serait bloquée en CI.

## Blog : nouvel article à la une et vignettes visibles — 4 novembre 2026 (branche `feature/blog-images-visibles`)

Retour de Sara (04/11) : le nouvel article et les images ne se voyaient pas. Les images de partage n'apparaissent que sur LinkedIn/WhatsApp. Un essai de vignettes tirées de ces images a été écarté par Sara (titre répété, pas joli). Retenu : chaque article de la liste affiche son « grand chiffre » (`highlight`) dans le style de la carte à la une, sans image ni texte répété. « Quelle version d'Angular utiliser ? » passe à la une (FR/EN). Badge « À la une » qui touchait le chiffre sur mobile : corrigé. Vérifié : lint, 225 tests, build, rendu 390 et 1440 px sans débordement. Suite possible : de vraies illustrations de couverture (prompts ChatGPT dans le style NgDigest).

## Page Entretien : uniquement les questions réellement posées — 4 novembre 2026 (branche `feature/entretien-vraies-questions`)

Demande de Sara (04/11) : garder seulement les questions qu'on lui a vraiment posées, retirer celles de l'agent, revoir toutes les réponses (justes, humaines, ni trop théoriques ni trop courtes). Source : sa liste de 53 questions (Drive, `questions-seulement.md`, mars 2026). Les 16 questions « seed » de l'agent (31/05) et les doublons ajoutés (bundler, API REST) sont retirés ; le thème Accessibilité disparaît faute de question réelle. Les 53 réponses FR/EN sont réécrites (médiane ≈ 95 mots), vérifiées sur Angular 21 et 22 (zoneless par défaut en 21, OnPush par défaut et `Eager` en 22, Vitest par défaut, `httpResource` stable, `*ngIf` déprécié en 20). « C'est quoi les balises CI ? » : réponse honnête sur l'ambiguïté (tags GitLab des runners, tags Git de livraison). Textes de la page et compteurs passés de 69 à 53. Nouveau test `interview-questions.data.spec.ts` (53 questions, aucune seed, thèmes non vides, réponses de plus de 50 mots, parité de la note 2026).

Source des réponses : `D:/dev/_state/_briefs/ngdigest/entretien/questions.py` (génère `interview-questions.data.ts`).

Statut : à relire par Sara avant fusion (contenu technique publié sous son nom).

## Article « Quelle version d'Angular utiliser ? » publié — 4 novembre 2026 (branche `content/angular-support-pragmatique`)

Réécriture FR validée par Sara le 04/11 (« je le valide comme ça, on peut le mettre en ligne ») : introduction de trois paragraphes, sans tournure dévalorisante (« Je n'ai jamais été très bonne pour faire ma veille Angular »), dates clés en `:::keyfigures`, renvoi vers l'outil de support des versions, anecdote 14 → 15 → 16 conservée. Version EN alignée section par section. Fichiers sortis du préfixe `draft-`, date 2026-11-04, `highlight` (28/11/2026), images de partage FR/EN générées, deux entrées ajoutées au sitemap. L'outil affiche maintenant le lien vers l'article (`RELATED_ARTICLE_SLUGS`).

Statut : fusionné (#17) et vérifié en production le 04/11 (page servie avec la nouvelle introduction). Reste : soumettre l'URL dans Search Console.

## Blog : graphiques, images de partage, article TJM — 3 novembre 2026 (branche `feature/blog-visuels`)

Demande de Sara : des articles ngDigest mieux mis en valeur (chiffres, graphiques, images), comme sur Mensualio et OrOGramme.
- **`:::chart`** (`scripts/lib/blog-figures.mjs`, 6 tests) : barres horizontales générées au build, libellés et valeurs en HTML, barre en petit SVG décoratif (géométrie par attributs, aucun style en ligne), échelle à 0, repère facultatif (moyenne/médiane), source sous le graphique ; une ligne illisible fait échouer le build. Styles dans `_blog.scss` (jetons de la charte), empilé sous 720 px.
- **Ancre explicite `## Titre {#ancre}`** : retirée du texte affiché. Corrige le titre de l'article TJM qui affichait `{#mise-a-jour-mai-2026-bareme-actualise}` en production (et le lien « Aller directement à la section actualisée »).
- **Images de partage** : `scripts/generate-og-images.mjs` (local, Playwright) produit un PNG 1200×630 par article publié (titre, `highlight`, couleurs lues dans `_colors.scss`, polices Space Grotesk / Inter embarquées sous licence OFL dans `scripts/og/fonts`). `generate-blog-index` renseigne `ogImage` si le fichier existe ; la page pose og:image / twitter:image et `image` dans le JSON-LD BlogPosting. `SeoService.updateMeta` repart de l'image par défaut à chaque page. 4 images générées (2 FR, 2 EN).
- **Article TJM (FR/EN)** : bloc trois chiffres (TJM moyens junior / confirmé / senior) et graphique des fourchettes par niveau à la place du tableau, mêmes chiffres et mêmes sources que le texte ; `highlight` 480 €/j pour l'image de partage ; lien mort vers un brouillon (`./draft-angular-21-zoneless-retour-experience.md`) retiré, mention « à paraître » conservée.
- README du blog : `:::chart`, ancre explicite, procédure d'image de partage.
Testé localement : lint, 13 fichiers de tests front, 79 tests de contenu, build avec prérendu (og:image d'article présent, logo par défaut ailleurs), captures 390 / 1 440 px du bloc et du graphique.
## Page « Outils » — 3 novembre 2026 (branche `feature/hub-outils`)

Demande de Sara : un seul endroit pour les outils. `/fr/outils` et `/en/tools` (prérendues, JSON-LD CollectionPage + ItemList + BreadcrumbList, sitemap, llms.txt) listent l'outil versions d'Angular (avec la prochaine fin de support calculée sur les données) et le Toolkit carrière, qui reste aussi à sa place dans le parcours carrière. Entrée « Outils » dans le menu (bureau et mobile) et le pied de page ; fil d'Ariane de l'outil versions : Accueil / Outils / Versions. Test du hub ajouté ; lint et tests de la fonctionnalité verts ; captures 390 et 1 440 px sans débordement.

## Outil « Ma version d'Angular est-elle encore supportée ? » — 3 novembre 2026 (branche `feature/outil-versions-angular`)

Plan SEO 1.6. Pages prérendues `/fr/outils/support-versions-angular` et `/en/tools/angular-version-support` (canonique, hreflang via `route-slugs.ts`, JSON-LD WebApplication + BreadcrumbList + FAQPage, sitemap, llms.txt, lien dans le pied de page).
- **Données** : `scripts/generate-angular-releases.mjs` (dans `prebuild`) lit `https://endoflife.date/api/angular.json`, qui reprend la table officielle d'angular.dev (dates v20 à v22 recoupées à la main le 03/11), et réécrit `angular-releases.generated.ts` (versionné, porte sa date de collecte). Source injoignable ou réponse invalide → fichier existant conservé, build non bloqué. Calendrier des prochaines sorties (22.3 → 23.0) : constante relue à la main (`RELEASE_SCHEDULE_CHECKED_ON`), une ligne passée disparaît d'elle-même.
- **Calcul** (domaine pur, 23 tests) : statut actif / LTS / fin de vie et jours restants recalculés à la date du jour (heure de Paris) après affichage ; fin de LTS à moins de 90 jours signalée ; chemin de migration sur les majeures réellement publiées, un lien `angular.dev/update-guide?v=X.0-Y.0` par saut (paramètre vérifié dans le navigateur) ; lecture d'une version collée (`19.2.14`, `^19.0.0`, ligne `@angular/core`) ; `?v=19` partageable.
- **Page** : verdict + conseil selon le statut, bouton « copier le résumé pour un client », calendrier de toutes les versions depuis v9, politique de support sourcée, prochaines versions, FAQ dont les réponses lisent les données. Article lié (`quelle-version-angular-utiliser-support-2026`) affiché automatiquement dès sa publication.
- **Mesure** : `AnalyticsService.trackEvent` (GA4, soumis au consentement) : `tool_angular_version_check`, `_copy`, `_guide`.
- **Fraîcheur** : `.github/workflows/weekly-rebuild.yml` (lundi 06:20 UTC) — inactif tant que le secret `VERCEL_DEPLOY_HOOK_URL` n'existe pas sur ce dépôt (à créer par Sara).
Testé localement : lint vert, 27 tests de la fonctionnalité, build de développement avec prérendu (le build de production échoue ici uniquement sur l'intégration des polices Google, réseau bloqué) ; HTML FR/EN vérifié (titre 59 car., description 148/151, ~950 mots, FAQ dans le JSON-LD) ; captures 390 et 1 440 px sans débordement.

## Visibilité dans les moteurs d'IA — 2 novembre 2026 (branche `feature/llms-txt`)

Plan SEO étape 0.7. `ngdigest-front/public/llms.txt` (format llmstxt.org) : résumé du site et liens vers le hub carrière et ses sous-pages, l'Observatoire, la veille, les créateurs, les sources, le blog et les offres, d'après les descriptions SEO déjà publiées. Aucun chiffre recopié (l'Observatoire est mis à jour chaque mois). `robots.txt` autorise déjà tous les robots, aucun pare-feu Vercel actif (vérifié le 02/11). Même branche : Quality Gate fixé sur Ubuntu 24.04 (`ubuntu-latest` = 26.04, refusé par Playwright) ; Dependency Audit rouge sur des alertes hautes apparues depuis (front : body-parser, undici ; back : body-parser, follow-redirects, multer via @nestjs/platform-express) → `npm audit fix --package-lock-only` avec npm 11.21.1 (version récente, comme le `npm ci` du runner : npm 11.6.2 retirait du lock les dépendances optionnelles `@emnapi/*` et faisait échouer `npm ci` en CI), override `multer ^2.5.0` et `@nestjs/platform-express` 11.2.8 côté back. Plus aucune alerte haute ou critique ; `security.py` et `npm ci --dry-run` passent en local. typescript-eslint 8.72 signale une assertion devenue inutile dans `resource.repository.ts` (`sortDirection as number`), retirée ; lint, tests (82) et build back passent.

## Audit des dépendances — 6 octobre 2026

« Dependency Audit » était rouge sur toute nouvelle PR : `proxy-addr` ≤ 2.0.7 (GHSA-jqcg-44mw-7w3h, front et back) et `source-map-js` < 1.2.2 (GHSA-68fv-2mgg-jv7q, front). Overrides npm `proxy-addr` ^2.0.8 (front et back) et `source-map-js` ^1.2.2 (front). Avec l'export du `security.py` commun (avis pnpm ignorés, décision de Sara du 06/10). Vérifié en local : `security.py` passed ; tests back 82/82 ; tests front laissés à la CI.

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

Publication du 23/10/2026 : [PR #12](https://github.com/SaraOunissi/ngdigest/pull/12).
Lot : Dougs Cross-functional ajoutée (45–55 k€, télétravail intégral), Compte Pro
archivée, URL Facturation actualisée, offres revérifiées au 23/10 ; 11 offres au
total, 6 actives et 5 archivées. Première CI : tests, lint, build et accessibilité
verts, mais garde PLAN et audit sécurité rouges (preuves : runs 40016095616 et
40016095830). Correction : référence de preuves dans ce PLAN, mises à jour
compatibles des dépendances verrouillées front/back et override Vite ^8.3.5
pour remplacer la version vulnérable imposée par Angular build. Nouvelle CI
requise avant fusion ; production non encore vérifiée.

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
- Vercel sert les fichiers prérendus et n'utilise pas `server.mjs`.

Corrections du 04/10, fusionnées et déployées par la
[PR #10](https://github.com/SaraOunissi/ngdigest/pull/10) (merge `8a75fbd` ; Quality Gate,
Dependency Audit et Vercel verts ; production revérifiée : pages clés en 200, 5 offres
actives et 4 archivées sur `/fr/jobs`) :

- `angular.json` : `security.allowedHosts` passe de `[]` à `ngdigest.co` et
  `www.ngdigest.co`. Testé localement sur `server.mjs` : ces deux hôtes en 200, un hôte
  inconnu en 400. Pour un test local : `NG_ALLOWED_HOSTS=localhost` ;
- back : `test:e2e` réparé. Le test généré par NestJS (`GET /` → « Hello World! », base
  MongoDB réelle) est remplacé par `test/resources.e2e-spec.ts` : vrai pipeline HTTP
  (préfixe `/api`, validation, enveloppe `{ data, meta }`, filtre d'erreurs, garde admin)
  avec cas d'usage simulés, sans base. Ce pipeline est factorisé dans `src/app.setup.ts`,
  utilisé par `main.ts`. 7/7 ; tests unitaires 82/82, lint et build verts. La CI ne lance
  toujours pas `test:e2e` (`.engineering/quality.json` non modifié).

## Observatoire — données couche sélective (29 septembre → 2 octobre 2026)

`observatoire/data/pepites-tagged.json` datait du 01/06 (2 offres) ; `npm run check:tag-jobs` sortait en échec. Régénéré le 02/10 par `npm run tag:jobs` après la veille du jour : 9 offres taguées (5 actives, 4 expirées), `generatedAt` 2026-10-02, vérification `--check` verte. Fusionné avec le lot /jobs ([PR #5](https://github.com/SaraOunissi/ngdigest/pull/5), 03/10). Les snapshots mensuels `_drafts/observatoire-snapshots/` (brouillons privés) sont une autre source : leurs chiffres Free-Work (parts, variations) ont été recalculés sans écart, mais les compteurs eux-mêmes ne sont pas revérifiés. <!-- by project-worker 2026-10-01 -->

## Observatoire — publication d’octobre 2026

Le lot préparé le 07/10 est repris le 23/10 sur la version publiée après la PR #12.
Il ajoute le relevé du 01/10 et sélectionne octobre dans `OBSERVATOIRE_LATEST` ;
juillet et septembre sont conservés, aucun point d’août n’est inventé.
Source : `_drafts/observatoire-snapshots/SNAPSHOT-2026-10.md`. Contrôles déclarés
par le producteur : 179 tests Angular, lint et build development verts.
La CI complète de cette branche doit encore valider le lot avant fusion ;
déploiement et vérification FR/EN en production restent à faire.

## Prochaines passes produit

### Mise à jour Malt et offres — demande Sara du 02/11/2026

Malt ouvert à la source le 02/11 : moyenne des profils expérimentés 536 €/j ;
tranches 299 / 407 / 536 / 580 € (15 ans et plus : 582 € en octobre), 18 193 profils.
Novembre porte désormais la date du 02/11 pour Malt ; octobre reste inchangé.
Source : https://www.malt.fr/t/barometre-tarifs/tech/developpeur-frontend.
Tests : 184 Angular, 73 scripts et lint front verts localement.

Board : ajout Recrulab (éditeur SaaS non nommé, front multi-framework dont Angular,
CDI 40–60 k€, full remote FR ; https://www.hellowork.com/fr-fr/emplois/84791957.html).
Dougs Facturation : URL republiée `8607485`, salaire 50–55 k€, rassemblement trimestriel
signalé. Cross-functional : 410 et absente de la liste carrière, archivée.
ViaBill, SerpApi ×2 et N2JSoft revérifiées vivantes, `scannedAt` au 02/11.
Total attendu : 12 offres, 6 actives, 6 archivées.
Recherche ouverte : Free-Work, WTTJ, employeurs/ATS (Dougs, Agicap, N2JSoft, SerpApi,
Lucca, Apify, Supabase), autres annonces Angular et DevRel. Rejets : Lucca 404,
Externatic indisponible, Data Recrutement pourvue, missions allemandes verrouillées
par nationalité/pays ; autres pistes sans salaire, contrat ou remote FR vérifiables.
Fusionné le 02/11 (PR #16) et vérifié en production (6 actives, 6 archivées).

Publication novembre demandée par Sara le 02/11/2026 : lot du 01/11 repris sur
`main` après la PR #14. Source privée : `_drafts/observatoire-snapshots/SNAPSHOT-2026-11.md`.
Le snapshot novembre devient celui affiché, avec le point Free-Work ajouté à la
série juillet/septembre/octobre ; aucun point août créé. Angular 22,8 %, React
16,8 %, Vue 12,4 %, Svelte 0,6 %. Malt inaccessible : valeurs conservées avec leur
date du 01/10. Paris exclu car périmètre non comparable. Contrôles déclarés dans
le bundle : 184 tests Angular et lint verts. CI complète, fusion et vérification
FR/EN en production restent à effectuer sur cette branche.

- Vérifier la publication du relevé Observatoire d’octobre (relevé daté du 01/10).
- Auditer la fraîcheur par source : un flux public accessible ne valide pas tous les collecteurs.
- Décider du devenir de l’Observatoire après avoir éprouvé un second consommateur du contrat de données.

## Vérification et livraison

Exécuter `python .engineering/quality.py --mode all` avec les dépendances déclarées
dans `.github/workflows/quality.yml`. Les preuves locales restent dans
`.engineering/artifacts/` et ne valident que le commit contrôlé.

Toujours distinguer local, testé, fusionné, déployé et vérifié en production. Les
hooks locaux protègent ce poste ; la protection GitHub doit être vérifiée séparément.

## Article « Quelle version Angular utiliser ? » — révision du 02/11/2026

Angle pragmatique et cinq sections françaises validés par Sara. Brouillons FR/EN existants révisés : choix par situation, support/LTS, dépendances, étapes de migration et contraintes de calendrier. Scènes commerciales fictives et raccourcis de migration retirés. Slugs et alternate conservés ; sources Angular officielles contrôlées le 02/11. La date de brouillon historique reste inchangée : date de publication à fixer lors de la décision de publication.

Statut : local et contrôlé, contenu toujours exclu de la publication par les noms draft-. Aucun retrait de ce garde-fou ni déploiement effectué. Vérifications : 24 tests draft-gate/parité passés ; frontmatter YAML lu, rendu Markdown réussi, 6 sections et 2 liens internes résolus dans chaque langue, alternate réciproques. Preuve locale ignorée par Git : .engineering/artifacts/angular-support/check.json. Build complet et contrôle navigateur de la page publiée non réalisés sur cette passe de brouillons.

Prochaine action : examiner la PR de révision, puis obtenir la décision de publication avant de retirer le statut brouillon et de fixer la date ; Quality Gate, audit et vérification du rendu restent nécessaires pour une livraison. Responsable : GPT. Chemin canonique : D:/dev/ngdigest/PLAN.md.
Complément du 02/11 : anecdote demandée directement par Sara, intégrée FR/EN dans la partie dépendances, sans client/équipe identifiable. Elle décrit la conservation de composants Material legacy puis le retrait manuel ultérieur ; les versions exactes sont omises car le souvenir est incertain. Contenu toujours brouillon ; aucun vécu supplémentaire inventé. Source personnelle conservée hors du dépôt public.
03/11 — précision de Sara intégrée FR/EN : Angular 14 → 15 avec imports Material legacy, puis retrait lors du passage 15 → 16 environ six mois après ; recette visuelle, modales peu visibles, navigateurs et corrections de régression. Durée de plusieurs semaines présentée avec la prise en main du projet, pas comme coût standard de migration. Annonce officielle Angular 15 vérifiée : refonte MDC stable, DOM/styles modifiés, imports legacy disponibles. La suppression du legacy en 16 est le calendrier du client, pas une obligation générale. Client toujours anonymisé ; fichiers toujours draft-.