<!--
Draft généré par project-worker 2026-06-04 (q097 QUEUE, ngdigest priorité 2).

Mots-clés candidats (méthode peu concurrentielle FR+EN) :
1. "angular 19 fin de vie"                  — FR pur (requête de version récurrente, SERP FR pauvre en guide pratique au 04/06/2026)
2. "migration angular 22"                   — FR pur (intent fort post-release, dominé EN herodevs/frontendminds)
3. "angular 22 nouveautés"                  — FR + recherché en EN (pic d'attention release semaine du 01/06/2026)
4. "mettre à jour angular version"          — FR pur (evergreen, faiblement ciblé freelance)
5. "angular 19 end of life"                 — EN (cherché par expats / équipes anglophones)
6. "angular 22 migration guide"             — EN (volume EN, on capte le résiduel FR)
7. "angular ng update version majeure"      — FR pur (long-tail outillage)
8. "quelle version angular choisir 2026"    — FR pur (angle décision, quasi vierge côté freelance)

Principal : "angular 19 fin de vie" (FR), "migration angular 22" (FR).
Secondaires : "angular 22 nouveautés" (FR+EN), "mettre à jour angular version" (FR), "quelle version angular choisir 2026" (FR pur).

SERP density audit 2026-06-04 :
- "angular 19 fin de vie" → SERP FR dominée par endoflife.date (EN) + frontendminds/herodevs (EN). Aucun guide FR orienté freelance/petite équipe. Green light total côté FR.
- "migration angular 22" → guides EN (herodevs, frontendminds) + angular.dev. FR quasi vide hors changelog brut. Green light fort.
- "angular 22 nouveautés" → frais (release semaine du 01/06/2026), encore peu d'articles FR de fond. Fenêtre d'attention à capter vite.
- "quelle version angular choisir 2026" → angle décision (LTS vs dernière) absent en FR ciblé freelance. Long-tail libre.

Faits vérifiés (web search 2026-06-04, à rafraîchir si la release v22 bouge) :
- Angular 19 : End of Life / fin de LTS le 19 mai 2026 → plus de patchs de sécurité ni correctifs (endoflife.date, frontendminds, herodevs).
- Angular 22 : planifié pour la semaine du 1er juin 2026 (était en RC.1) — "signal-first era" (versionlog, frontendminds, angular.dev).
- Cycle de support : 6 mois actif + 12 mois LTS = 18 mois par majeure (angular.dev/reference/releases).
- Angular 20 : LTS jusqu'à ~novembre 2026. Angular 21 : LTS jusqu'à ~mai 2027.
- Nouveautés v22 annoncées : Signal Forms passés stables (expérimentaux en v21), Vitest runner par défaut (support Jest/Web Test Runner expérimental retiré), zoneless + OnPush par défaut sur les nouveaux projets, selectorless components, MCP server stable.

Internal links :
- q016 "Angular 21 zoneless retour d'expérience" (slug: angular-21-zoneless-retour-experience)
- q024 "Angular 22 selectorless components" (slug: angular-22-selectorless-components)
- q092 "Signal Forms en production" (slug prévu: angular-signal-forms-production-2026) — NB : draft pas encore produit, lien à activer quand q092 publié.
- Article TJM 2026 (slug: tjm-developpeur-angular-2026)

À valider Sara avant publication :
- Date EXACTE de release stable d'Angular 22 au moment de publier (RC en cours au 04/06 → confirmer "sortie" vs "RC" dans l'intro).
- Statut exact de Signal Forms en v22 (stable vs encore flaggé) : les sources de mai/juin 2026 annoncent "stable", l'angular.dev officiel prime → vérifier avant d'affirmer.
- Ton retour terrain réel sur un `ng update` (ngdigest/orogramme) si tu veux ajouter un encadré dogfooding crédible.
-->

---
title: "Angular 19 en fin de vie (19 mai 2026) pile quand Angular 22 sort : le guide de migration pour freelances et petites équipes"
slug: "angular-19-eol-migration-angular-22-2026"
description: "Angular 19 a atteint sa fin de vie le 19 mai 2026 — plus aucun patch de sécurité — le mois même où Angular 22 sort. Le guide de migration réaliste pour freelances et petites équipes : chemin v19 → v22, budget temps, faut-il viser la LTS ou la dernière version, et pourquoi cette fenêtre est une vraie opportunité de mission facturable."
date: "2026-06-04"
author: "Sara Ounissi"
tags: ["angular", "angular 22", "migration", "freelance", "fin de vie", "ng update", "france"]
lang: "fr"
---

<!-- Draft q097 — by project-worker 2026-06-04. À relire + confirmer la date de release v22 (RC au 04/06) et le statut Signal Forms avant publication. Retirer le préfixe `draft-` pour publier. -->

Il y a des fenêtres dans le calendrier Angular où, si tu es freelance, tu as tout intérêt à regarder. Mai-juin 2026 en est une, et elle est même un peu cruelle : **Angular 19 a atteint sa fin de vie le 19 mai 2026** — plus aucun correctif de sécurité — **le mois même où Angular 22 sort**. Les deux événements se télescopent. Pour les boîtes encore en v19 (et il y en a beaucoup plus que tu ne crois), ça veut dire une pression de migration soudaine. Pour toi qui factures à la journée, ça veut dire des missions.

Je vais te donner le calendrier factuel, le chemin de migration réaliste, et la décision que tout le monde évite de trancher clairement : faut-il viser la dernière version ou la LTS ?

## Ce qui se passe en mai-juin 2026 (factuel, sourcé)

Pas d'approximation, parce que c'est exactement le genre d'info qu'un client te demandera de confirmer :

- **Angular 19 : fin de vie le 19 mai 2026.** La période LTS est terminée. Concrètement : plus de patchs de sécurité, plus de correctifs de bugs. Une CVE découverte après cette date sur la v19 ne sera pas corrigée par l'équipe Angular.
- **Angular 22 : sortie prévue la semaine du 1er juin 2026** (la version était en Release Candidate juste avant). C'est la majeure qui marque vraiment le passage en mode "signal-first".
- **Angular 20 est en LTS** jusqu'à ~novembre 2026.
- **Angular 21 est la version stable la plus récente avant la 22**, en support jusqu'à ~mai 2027.

Le rythme est régulier depuis des années : **une majeure tous les 6 mois, supportée 18 mois** (6 mois de support actif + 12 mois de LTS). Tu peux donc anticiper : la v20 sortira de LTS fin 2026, la v21 mi-2027. Ce n'est pas une menace, c'est un calendrier — et un calendrier, ça se vend en prestation.

## Pourquoi c'est urgent (et pour qui)

"Fin de vie" sonne abstrait jusqu'au jour où le RSSI du client tique sur un audit. Une application qui tourne sur une version Angular sans support, c'est :

- **un risque de sécurité non couvert** : la moindre faille du framework ou d'une dépendance liée reste ouverte ;
- **un risque de conformité** : beaucoup de clients (banque, santé, secteur public, ou simplement boîtes avec un client grand compte derrière) ont des clauses qui interdisent de tourner sur du logiciel non maintenu ;
- **une dette qui grossit** : plus tu attends, plus les sauts de version s'accumulent et plus la migration coûte cher.

La cible la plus exposée n'est pas le grand groupe avec une équipe plateforme dédiée — eux ont un plan de montée de version. **C'est la petite équipe et le client de freelance** : l'app a été livrée il y a deux ans, elle marche, personne ne l'a touchée, elle est en v19 (voire v18), et tout le monde a oublié que le compteur tournait. C'est exactement là que tu interviens.

## Le chemin de migration réaliste

Angular ne te laisse pas sauter les majeures n'importe comment : **on monte version par version**. Depuis la v19, le chemin propre est :

> **v19 → v20 → v21** (deux `ng update` séquentiels), puis **→ v22** si tu veux la toute dernière (une étape de plus).

La bonne nouvelle, c'est que l'outillage fait le gros du travail :

```bash
# on monte une majeure à la fois, jamais en sautant
ng update @angular/core@20 @angular/cli@20
# on teste, on commit, puis seulement après :
ng update @angular/core@21 @angular/cli@21
```

Les schematics appliquent automatiquement la majorité des migrations de code (API dépréciées, nouvelles syntaxes). Ton vrai temps part ailleurs : **les dépendances tierces** qui ne suivent pas le rythme, les tests qui cassent, et les patterns maison qui s'appuyaient sur un comportement déprécié.

Budget réaliste pour une app de taille moyenne en bon état : **compte 3 à 4 semaines** pour remonter de v19 à la LTS courante, tests inclus. Une app négligée avec des dépendances mortes, c'est plus. Une app petite et propre, c'est moins. Ce qui compte côté devis : ne jamais vendre une migration "à l'heure floue" — vends des paliers (`v19→v20` livré et testé, puis `v20→v21`), chacun mergeable et déployable seul.

## Faut-il sauter directement en v22 ?

C'est LA question qu'on te posera, et la réponse honnête est : **ça dépend de si c'est un projet existant ou un nouveau.**

- **App de production existante → vise la v21 (LTS stable) d'abord.** Tu sécurises l'app sur une version supportée longtemps (jusqu'à ~mai 2027), tu sors du rouge "fin de vie", et tu laisses la v22 se stabiliser quelques semaines après sa sortie. Monter en v22 le jour J d'une release, sur du code client, c'est prendre un risque de régression que personne ne te paiera pour assumer.
- **Nouveau projet → démarre directement en v22.** Tu profites du "signal-first" dès le départ : Signal Forms, zoneless et OnPush par défaut, Vitest comme runner de tests, selectorless. Pas de dette à reprendre, autant partir sur la base la plus moderne.

Autrement dit : **la v22 est un choix de fondation, pas une urgence de mise à jour.** L'urgence, c'est de sortir tes clients de la v19. La modernité, c'est de bien démarrer les nouveaux.

Côté v22, ce qui change vraiment (et que tu peux mentionner en RDV pour montrer que tu suis) : **Signal Forms passent stables** (ils étaient expérimentaux en v21), **Vitest devient le runner par défaut** (le support Jest/Web Test Runner expérimental est retiré), le **zoneless** et le **OnPush** sont par défaut sur les nouveaux projets, et le **MCP server** du CLI passe stable pour le tooling assisté par IA. Pour creuser : j'ai détaillé le zoneless dans [mon retour d'expérience Angular 21](/blog/angular-21-zoneless-retour-experience) et les [selectorless components ici](/blog/angular-22-selectorless-components).

## L'opportunité freelance (la partie qu'on oublie de te dire)

Une migration de version, ce n'est pas une corvée gratuite que tu rends à un client par gentillesse. **C'est une mission facturable récurrente** — et l'une des plus saines à vendre, parce que la valeur est évidente côté client (sécurité + conformité + dette qui ne grossit plus).

Comment te positionner concrètement :

- **Audit flash payant** (0,5 à 1 jour) : tu listes la version actuelle, les dépendances mortes, l'écart jusqu'à la LTS, et tu chiffres les paliers. Ça désamorce le "c'est combien ?" et ça ancre la suite.
- **Forfait par palier** plutôt qu'au temps passé flou : le client achète un résultat ("app sécurisée sur v21 LTS, tests verts"), pas des heures.
- **Récurrence** : tous les 6 mois une nouvelle majeure sort, tous les 18 mois une version meurt. Une fois que tu es "la personne qui a fait monter leur Angular", tu reviens. C'est un revenu prévisible greffé sur le calendrier d'Angular lui-même.

Et c'est un argument de TJM : la migration touche à la sécurité et au cœur de l'app, ce n'est pas du dev de feature jetable. À cadrer dans ta grille (j'en parle dans [mon article sur le TJM Angular 2026](/blog/tjm-developpeur-angular-2026)).

## En résumé

Angular 19 est mort le 19 mai 2026, Angular 22 sort dans la foulée début juin. Pour tes clients en v19, ce n'est pas négociable : il faut sortir de la zone non supportée. Le chemin propre est v19 → v20 → v21 par `ng update` successifs, en visant la **LTS v21 pour les apps de prod** et la **v22 pour les nouveaux projets**. Et pour toi, derrière le mot un peu sec de "fin de vie", il y a une fenêtre de missions concrètes qui se rouvre tous les six mois. Autant être celle qu'on appelle quand le compteur arrive à zéro.

---

**Sources** (vérifiées le 04/06/2026, à rafraîchir si la release v22 évolue) :
- endoflife.date/angular — dates EOL et fenêtres de support par version
- HeroDevs — "Angular v19 EOL May 19, Angular 22 coming same month" + historique de versions
- FrontendMinds — Angular 19 End of Life 2026 + Angular latest version (mai 2026)
- angular.dev/reference/releases — politique de versioning (6 mois actif + 12 mois LTS)
- VersionLog — Angular 22.0 (what's new, support lifecycle) + "What to expect in Angular 22"
