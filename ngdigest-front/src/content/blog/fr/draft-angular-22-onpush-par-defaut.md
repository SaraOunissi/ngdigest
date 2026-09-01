<!--
Draft généré par project-worker 2026-09-02 (q187 QUEUE).

BARRE DE QUALITÉ ÉDITORIALE ngdigest (Sara, 21/08/2026) — état condition par condition :
(1) Demande SEO mesurée AVANT rédaction : keyword porteur `angular onpush`, cluster
    `changedetectionstrategy onpush` + `détection de changement angular` + `angular onpush
    par défaut` + `angular eager`. Volume FR estimé 100-500/mois sur le cluster, intention
    info + préparation d'entretien, difficulté 40-50. Sujet EVERGREEN (pas un pic d'actu).
    SERP FR = trou net : les 2 seuls résultats FR identifiés (Medium G. David, cedric-locchi.fr)
    décrivent l'ancien modèle et ne mentionnent pas v22. Un seul article EN frontal
    (codewithrajat, Substack) + lacolaco (EN/JP). ⚠️ Estimation qualitative, sans accès
    Ahrefs/Semrush — à re-serrer si Sara a un outil.
(2) Angle propriétaire : ce n'est PAS « les nouveautés de la v22 ». L'angle est
    « la question d'entretien Angular la plus posée vient de changer de réponse » +
    « ton codebase sort de `ng update` 100 % Eager, donc le défaut n'a changé que pour
    les composants neufs ». Aucune paraphrase de angular.dev.
(4) Faits vérifiés à la source primaire ET datés le 2026-09-02 :
    - angular.dev/api/core/ChangeDetectionStrategy (build affiché v22.1.4+sha-b2903de) :
      l'enum expose `OnPush`, `Eager`, et `Default` marqué @deprecated « Use Eager instead ».
      Mention explicite « NOTE: OnPush is enabled by default. »
    - RFC angular/angular Discussion #66779, statut [Complete].
    - v22.0 sortie le 03/06/2026 (blog Ninja Squad du 03/06/2026, InfoQ 08/2026).
    - `Default` déprécié dès la 21.2, remplacé par `Eager` en v22.
    ⚠️ CORRECTION DE LA SPEC q187 (point 3 du Context QUEUE) : `ChangeDetectionStrategy`
    n'est PAS passé « d'enum à union de chaînes ». La doc API v22 le documente toujours
    comme `enum`. Le changement est le renommage `Default` → `Eager` + le basculement du
    défaut. Ce point est traité dans l'article comme une erreur répandue à corriger —
    c'est un des différenciateurs. NE PAS réintroduire la version « union de chaînes ».
(5) Maillage : 2 liens sortants internes (/fr/carriere/entretien, /fr/blog/angular-front-fullstack-marche-2026).
    Liens ENTRANTS à poser par Sara à la publication : depuis /fr/carriere/entretien (Q 12.1)
    et depuis le futur article migration v22 (q183).
(6) Parité FR/EN : version EN livrée dans la même passe —
    `en/draft-angular-22-onpush-by-default.md` (mêmes `##`, même pull-quote, mêmes
    :::keyfigures / :::warn / :::cta aux mêmes positions). `alternate` croisé.
(7) NON PUBLIÉ : préfixe `draft-` = exclu du build (blog-draft-gate). Relecture Sara requise.

À faire par Sara avant publication :
- Re-vérifier l'encart daté (§ « Statut au 2 septembre 2026 ») le jour de la publi.
- Retirer le préfixe `draft-` des DEUX fichiers (FR + EN) en même temps.
- Poser les liens entrants (/carriere/entretien + q183).
- Le passage « en mission » reflète l'expérience RTE/ESN de Sara — verbatim à valider.

Interlock : q183 (checklist breaking changes v22) et q162 (nouveautés v22 en mission)
ne sont pas encore rédigés — les backlinks demandés par l'acceptance seront à ajouter
quand ces deux articles existeront.
-->

---
title: "Angular 22 : OnPush est devenu le défaut (et `Default` s'appelle maintenant `Eager`)"
slug: "angular-22-onpush-par-defaut"
description: "Depuis le 3 juin 2026, un composant Angular qui ne dit rien est en OnPush. L'ancien `Default` a été renommé `Eager`. Sauf que `ng update` tague tout ton code hérité en `Eager` — donc le défaut n'a changé que pour les composants neufs. Ce que ça casse en mission, et pourquoi ta réponse d'entretien est périmée."
date: "2026-09-02"
author: "Sara Ounissi"
tags: ["angular", "performance", "entretien", "migration"]
lang: "fr"
alternate: "angular-22-onpush-by-default"
highlight: { value: "3 juin 2026", label: "Angular 22.0 : OnPush devient le défaut" }
---

En entretien, on m'a posé la question de la détection de changement à peu près à chaque fois. La formulation ne varie pas beaucoup : « parle-moi de la change detection, et de `OnPush` ». Et pendant des années, il y avait une bonne réponse, celle que tout le monde récitait : « par défaut Angular vérifie tout l'arbre à chaque événement, et `OnPush` est une optimisation qu'on active sur les composants critiques ». Depuis le **3 juin 2026**, cette réponse est fausse. Pas imprécise : fausse. Le défaut a changé de camp.

## Ce qui a changé exactement

Angular **22.0** est sorti le **3 juin 2026**. Avec elle, trois choses bougent en même temps sur la détection de changement.

1. **`OnPush` devient la stratégie par défaut.** Un composant qui ne déclare pas de `changeDetection` est désormais en `OnPush`. La doc API le dit noir sur blanc : *OnPush is enabled by default*.
2. **L'ancien `Default` est renommé `Eager`.** Le comportement n'a pas bougé d'un iota — on vérifie tout le sous-arbre à chaque passe — mais le nom décrit enfin ce que la stratégie fait, au lieu de décrire sa place dans une liste. `Default` avait déjà été déprécié en **21.2**.
3. **`Default` survit, mais en sursis.** Il existe toujours dans l'enum, marqué `@deprecated`, strictement équivalent à `Eager`, et annoncé comme voué à disparaître.

> Le mot « Default » ne veut plus rien dire : il désigne désormais la stratégie qui n'est justement plus le défaut.

:::warn Une erreur qui circule déjà
Non, `ChangeDetectionStrategy` n'est **pas** devenu une union de chaînes de caractères. Au 2 septembre 2026, la doc API officielle le documente toujours comme un **`enum`**, exposant `OnPush`, `Eager` et `Default` (déprécié). Si tu lis quelque part que le type a changé de nature, la source n'a pas ouvert la page.
:::

Le modèle mental utile tient en deux lignes. **`Eager`** : le composant est vérifié dès que la passe de détection l'atteint, point. **`OnPush`** : il n'est vérifié que si l'une de ces quatre choses arrive — une `input()` reçoit une **nouvelle référence**, un événement part du composant lui-même, un **signal lu dans le template** change, ou quelqu'un appelle explicitement `markForCheck()`.

## Ce que fait vraiment `ng update` — et le piège qui en découle

C'est le point que 90 % des articles sur la v22 traitent en une puce, et c'est pourtant le seul qui compte quand tu arrives sur une base de code existante.

La migration `ng update` **écrit** `changeDetection: ChangeDetectionStrategy.Eager` sur tous les composants qui ne déclaraient rien. Elle remplace aussi `Default` par `Eager` dans les décorateurs qui le mentionnaient, et elle conserve `OnPush` là où il était déjà posé (devenu redondant, mais inoffensif).

La conséquence est mécanique : **ta migration ne casse rien, et c'est exactement le problème.**

:::keyfigures Ce que ta base de code devient après `ng update`
- bad | 100 % | des composants existants taggés `Eager` explicitement
- good | 0 | régression au moment de l'upgrade
- neutral | 1 | endroit où le nouveau défaut s'applique : les composants que tu crées après
:::

Tu sors de la migration avec un codebase intégralement figé dans l'ancien mode, une annotation de plus par fichier, et zéro gain de perf. Le nouveau défaut ne s'applique qu'aux composants nés après la migration. Et comme rien ne casse, **personne ne repasse jamais dessus**. C'est la définition d'une dette silencieuse : elle est écrite, elle est visible dans le diff, et elle ne fera jamais mal assez pour être priorisée.

Le vrai sujet de la v22 n'est donc pas la migration. C'est l'après.

## La checklist de dé-`Eager`-isation

Un big bang « on retire tous les `Eager` d'un coup » est le meilleur moyen de passer une semaine à chasser des composants qui ne se rafraîchissent plus. La bonne granularité, c'est le module fonctionnel, pas le repo.

1. **Compte ta dette.** Un `grep -rc "ChangeDetectionStrategy.Eager" src/` te donne le chiffre exact à afficher en réunion. C'est une métrique qui décroît, donc une métrique qui se pilote.
2. **Commence par les feuilles.** Les composants de présentation qui ne reçoivent que des `input()` et n'ont pas d'état interne passent en `OnPush` sans discussion. C'est 60 à 70 % du volume dans une app bien découpée, et le risque est proche de zéro.
3. **Traite les conteneurs ensuite, un par un.** Ce sont eux qui portent les abonnements, les mutations et les callbacks tiers — c'est là que les trois pièges de la section suivante se cachent.
4. **Garde une liste explicite des `Eager` assumés.** Un composant qui reste `Eager` avec un commentaire d'une ligne expliquant pourquoi est un choix d'architecture. Le même composant sans commentaire est un oubli. À douze mois d'écart, personne ne fait la différence.

## Les 3 pièges du composant OnPush qui « ne s'affiche pas »

Ce sont toujours les mêmes, et ils vont réapparaître en masse maintenant que le défaut a basculé.

1. **La mutation d'objet au lieu d'une nouvelle référence.** `this.user.name = 'X'` ne déclenche rien : la référence de l'`input()` n'a pas changé. Il faut `this.user = { ...this.user, name: 'X' }` — ou mieux, arrêter de passer des objets mutables et passer des signaux.
2. **L'abonnement RxJS posé à la main.** Un `subscribe()` qui écrit dans une propriété de classe ne notifie personne. Soit tu passes par le pipe `async` dans le template, soit tu appelles `markForCheck()` dans le `subscribe`, soit — le remède signal-first — tu convertis le flux avec `toSignal()` et tu le lis dans le template.
3. **Le callback qui vit hors du cycle Angular.** `setTimeout`, un listener d'une lib tierce, un SDK de carte ou de graphe qui te rappelle depuis son propre monde. Le state change, Angular n'en sait rien. Là encore : écris dans un **signal** plutôt que dans une propriété, et le problème disparaît de lui-même.

Le fil rouge des trois : **`OnPush` ne punit pas la performance, il punit l'état implicite.** Chaque piège est un endroit où le code modifiait des données sans le dire à personne. La bascule signal-first et la bascule `OnPush` sont la même bascule vue de deux côtés.

## Ta réponse d'entretien est périmée — voilà la nouvelle

Si tu passes des entretiens Angular cet automne, c'est la mise à jour la plus rentable que tu puisses faire, parce que la question tombe presque à tous les coups et que la quasi-totalité des candidats va réciter la version d'avant.

**Ce qu'il ne faut plus dire** : « par défaut Angular vérifie tout, et `OnPush` est une optimisation qu'on active ».

**Ce qu'il faut dire** : depuis Angular 22, `OnPush` **est** le défaut ; l'ancien `Default` s'appelle `Eager` ; et sur une base de code migrée, tout l'existant a été explicitement tagué `Eager` par `ng update`, donc le nouveau défaut ne concerne en pratique que le code neuf.

Et la question intéressante s'inverse. Ce n'est plus « pourquoi passer à `OnPush` ? » — la réponse est devenue « je n'ai rien à faire, c'est le défaut ». C'est : **« où as-tu dû garder `Eager`, et pourquoi ? »** Répondre à celle-là demande d'avoir vraiment touché à une migration, et ça s'entend en trente secondes.

Si tu prépares ce type d'entretien, le reste des questions Angular que je collectionne est sur [la page entretien du hub carrière](/fr/carriere/entretien) — la question détection de changement y a été mise à jour.

## L'angle mission : un lot facturable, pas une ligne de refacto

En clientèle, « on va passer les composants en OnPush » ne se vend pas : ça sonne comme du confort de dev. Voilà comment je le formule autrement.

Un client sur v20 ou v21 va rencontrer cette bascule à sa prochaine montée de version, que ça lui plaise ou non. Tu peux donc arriver avec un périmètre chiffrable : l'audit du nombre de composants concernés, la migration technique, puis **la passe de dé-`Eager`-isation module par module** avec un critère de sortie mesurable (le compteur de `Eager` restants, et la liste des exceptions documentées). C'est un lot identifié, avec un début, une fin et un chiffre — pas une demande de temps libre pour « améliorer le code ».

Le bénéfice se pitche sans jargon : moins de travail inutile à chaque interaction utilisateur, un rendu plus prévisible, et un code qui se rapproche du modèle vers lequel Angular pousse de toute façon. Pour le reste du contexte marché — ce que les clients demandent réellement en ce moment côté front — j'ai détaillé les chiffres dans [mon article sur le marché front / fullstack 2026](/fr/blog/angular-front-fullstack-marche-2026).

## Statut au 2 septembre 2026

Encart daté, à re-vérifier avant toute décision de migration :

- **Version concernée** : Angular **22.0**, sortie le **3 juin 2026**. La doc API consultée était servie par un build **v22.1.4**.
- **Nom exact** : `ChangeDetectionStrategy` reste un **`enum`**, avec `OnPush`, `Eager`, et `Default` marqué `@deprecated` (« Use `Eager` instead », voué à être retiré).
- **Migration automatique** : oui, incluse dans `ng update` — elle ajoute `ChangeDetectionStrategy.Eager` aux composants sans stratégie déclarée.
- **`Default`** : déprécié depuis la **21.2**, encore présent en v22 comme alias d'`Eager`.

:::cta Le hub carrière *Angular.* | Questions d'entretien, TJM, plateformes et toolkit — tenus à jour. | Voir le hub carrière | /fr/carriere
:::

## Ce qu'il faut retenir

La v22 n'a pas ajouté une option de performance : elle a déplacé le défaut, et renommé l'ancien défaut pour qu'il arrête de mentir sur ce qu'il fait. Sur une base de code existante, le vrai travail commence **après** `ng update`, parce que la migration a tout figé dans l'ancien mode sans rien casser — donc sans rien signaler. Et si tu passes des entretiens, il y a une phrase à désapprendre avant de repartir en process.

---

**Sources** :

- `ChangeDetectionStrategy` — `OnPush`, `Eager`, `Default` déprécié, mention « OnPush is enabled by default » (page consultée le 02/09/2026, build v22.1.4) — [angular.dev](https://angular.dev/api/core/ChangeDetectionStrategy)
- RFC officielle « Setting OnPush as the default Change Detection Strategy », Discussion #66779, statut [Complete] — [github.com](https://github.com/angular/angular/discussions/66779)
- « What's new in Angular 22.0? », publié le 03/06/2026 — [blog.ninja-squad.com](https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0)
- « Google Releases Angular v22 with Stable Signal Forms, OnPush by Default and Experimental WebMCP », août 2026 — [infoq.com](https://www.infoq.com/news/2026/08/angular-v22-released/)
- « Angular v22: Introducing ChangeDetectionStrategy.Eager and OnPush By Default » — [blog.lacolaco.net](https://blog.lacolaco.net/posts/angular-v22-onpush-by-default.en)
- « Skipping component subtrees » (guide officiel des bonnes pratiques `OnPush`) — [angular.dev](https://angular.dev/best-practices/skipping-subtrees)
