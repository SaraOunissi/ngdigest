<!--
Draft généré par project-worker 2026-09-12 (q185 QUEUE). // by project-worker 2026-09-12

BARRE DE QUALITÉ ÉDITORIALE ngdigest (Sara, 21/08/2026) — état condition par condition :
(1) Demande SEO mesurée AVANT rédaction : keyword porteur `quelle version angular utiliser`,
    cluster `support angular jusqu'à quand` + `angular LTS` + `angular roadmap 2026`
    + `angular 23 date de sortie`. Volume FR estimé 100-500/mois sur le cluster décisionnel,
    intention info, difficulté 30-40. Le générique `angular version` (>2k) est
    navigationnel/doc → hors cible, volontairement. SERP FR = doc angular.dev (EN),
    endoflife.date, blogs EN (angular.love 05/08/2026) ; aucun contenu FR décisionnel
    orienté freelance/mission. ⚠️ Estimation qualitative, sans accès Ahrefs/Semrush —
    à re-serrer si Sara a un outil.
(2) Angle propriétaire : ce n'est PAS « Angular passe à une majeure par an ». L'angle est
    « ton client te demande jusqu'à quand sa version est couverte, et ta réponse vaut une
    ligne de facture » : les 3 fenêtres datées, la lecture SemVer qui désamorce la peur du
    numéro, et la planification d'UNE migration par an comme lot identifié.
    Aucune paraphrase de angular.dev — la doc donne les dates, pas la façon de les vendre.
(4) Faits vérifiés à la source primaire ET datés le 2026-09-12 :
    - angular.dev/reference/releases (build affiché **v22.1.6+sha-c4bd3e2**) : « A major
      release every 12 months », « 4-6 minor releases for each major release », note
      « Until Angular v22, Angular had a 6-month major release cycle, with 1-3 minor
      releases » ; « All major releases are typically supported for 24 months »
      (Active 12 mois + LTS 12 mois) ; calendrier v22.1 semaine du 2026-07-27 · v22.2
      ~09/2026 · v22.3 ~11/2026 · v22.4 ~01/2027 · v22.5 ~03/2027 · **v23.0 ~06/2027** ;
      table des versions supportées : ^22.0.0 Active (sortie 2026-06-03, active→2027-06,
      LTS→2028-06) · ^21.0.0 LTS (sortie 2025-11-19, active terminée 2026-06-03,
      LTS→2027-06) · ^20.0.0 LTS (sortie 2025-05-28, active terminée 2025-11-19,
      **LTS→2026-11-28**) ; v2→v19 plus supportées ; dépréciation « a minimum one major
      version (approximately one year) » / « period of at least 12 months ».
    - PR angular/angular **#69817** « docs: add v23 release and change to yearly release
      cycle » (auteur `thesmiler`) : son contenu est **en ligne dans la doc officielle** au
      2026-09-12 ⇒ le changement n'est plus une proposition. C'est ce que dit l'encart daté
      de l'article, et c'est la formulation à conserver.
    ⚠️ MISE À JOUR DE LA SPEC q185 : le Context QUEUE (écrit le 01/08) dit « pas encore
    mergée au 20/07 » et « angular.dev affiche toujours l'ancien calendrier ». Les DEUX
    points sont PÉRIMÉS au 2026-09-12 : la doc affiche le nouveau calendrier. Ne pas
    réintroduire la formulation « proposition en attente de merge ».
(5) Maillage : 3 liens sortants internes (/fr/blog/angular-front-fullstack-marche-2026,
    /fr/blog/tjm-developpeur-angular-2026, /fr/carriere/guide).
    Liens ENTRANTS à poser par Sara à la publication : depuis /fr/carriere/guide et depuis
    le futur article migration v22 (q183).
(6) Parité FR/EN : version EN livrée dans la même passe —
    `en/draft-which-angular-version-to-use-support-2026.md` (mêmes `##`, même pull-quote,
    mêmes :::keyfigures / :::warn / :::cta aux mêmes positions). `alternate` croisé.
(7) NON PUBLIÉ : préfixe `draft-` = exclu du build (gate `draft-`). Relecture Sara requise.

À faire par Sara avant publication :
- Re-vérifier l'encart daté (§ « Statut au 12 septembre 2026 ») le jour de la publi :
  la table « Actively supported versions » de angular.dev/reference/releases bougera au
  passage de la v22.2, et la v20 tombe le **28/11/2026** (si la publi est postérieure,
  l'article doit le dire au passé).
- Retirer le préfixe `draft-` des DEUX fichiers (FR + EN) en même temps.
- Poser les liens entrants (/carriere/guide + q183).
- Valider le passage « comment le facturer » : il reflète l'expérience ESN/mission de Sara,
  verbatim à relire.

Interlock : q162 (nouveautés v22 en mission) et q183 (checklist breaking changes v22) ne
sont pas encore rédigés — les backlinks croisés demandés par l'acceptance seront à ajouter
quand ces deux articles existeront. Le 3ᵉ lien interne (/fr/carriere/guide) est posé à la
place pour tenir la condition (5) dès maintenant.
-->

---
title: "Quelle version d'Angular utiliser en 2026 : une majeure par an, 24 mois de support, et ce que ça change à ta facture"
slug: "quelle-version-angular-utiliser-support-2026"
description: "Angular ne sort plus une majeure tous les six mois mais tous les douze, et chaque version est couverte 24 mois au lieu de 18. Les trois dates qui comptent, la lecture SemVer qui désamorce la peur du numéro, et comment transformer « votre v20 meurt le 28 novembre » en un lot de mission."
date: "2026-09-12"
author: "Sara Ounissi"
tags: ["angular", "freelance", "migration", "veille"]
lang: "fr"
alternate: "which-angular-version-to-use-support-2026"
highlight: { value: "28/11/2026", label: "fin du support de la v20 — la seule date vraiment urgente" }
---

La question ne vient jamais d'un développeur. Elle vient d'un responsable applicatif, en fin de réunion, sur un ton qui n'annonce rien de bon : « on est en Angular 20, on est encore supportés ou pas ? ». Et la réponse honnête — « jusqu'au 28 novembre 2026 » — a ceci de précieux qu'elle est vérifiable, datée, et qu'elle ouvre directement sur un devis. Depuis l'été 2026, le calendrier sur lequel s'appuie cette réponse a changé de rythme : Angular est passé à **une majeure tous les douze mois**, avec **24 mois de support** par version au lieu de 18.

## Ce qui a changé, et ce qui n'a pas changé

Trois lignes de la doc officielle ont bougé, et une seule est vraiment structurante.

1. **Le rythme des majeures passe de 6 à 12 mois.** La doc annonce désormais « une majeure tous les 12 mois », avec une note explicite : *jusqu'à la v22, Angular avait un cycle de 6 mois*. La v22 est la charnière, et **la v23 est visée pour juin 2027** — il n'y aura donc **pas** de majeure à l'automne 2026, contrairement à ce que dix ans d'habitude laissent supposer.
2. **Le nombre de mineures passe de 1-3 à 4-6 par majeure.** C'est le contrepoids : la cadence de livraison des fonctionnalités ne ralentit pas, elle se déplace vers les mineures, à raison d'une toutes les huit semaines environ.
3. **Le support total passe de 18 à 24 mois** : **12 mois actifs** (correctifs et mises à jour régulières) puis **12 mois de LTS** (uniquement correctifs critiques et sécurité). L'ancien découpage était 6 + 12.

> Ce qui ralentit, ce n'est pas Angular. Ce sont les fenêtres pendant lesquelles on a le droit de casser ton code.

Le reste du contrat est intact : les *breaking changes* restent réservés aux majeures, les mineures restent rétrocompatibles, les correctifs continuent de sortir chaque semaine. Autrement dit, ce changement ne retire rien à personne — il rallonge la durée pendant laquelle une base de code peut rester tranquille.

## Les trois fenêtres de support, datées

Au 12 septembre 2026, trois versions seulement sont couvertes. Ces dates sont celles de la table officielle des versions supportées.

| Version | Statut | Support actif jusqu'à | LTS jusqu'à |
|---|---|---|---|
| **22** (sortie 03/06/2026) | Active | juin 2027 | juin 2028 |
| **21** (sortie 19/11/2025) | LTS | terminé le 03/06/2026 | juin 2027 |
| **20** (sortie 28/05/2025) | LTS | terminé le 19/11/2025 | **28/11/2026** |

Tout ce qui est antérieur — **v2 à v19** — n'est plus supporté du tout. Si le client est sur une v19 ou en dessous, la conversation n'est plus « quand migrer » mais « depuis combien de temps on est exposés ».

:::keyfigures Le nouveau contrat, en trois nombres
- neutral | 12 mois | entre deux majeures (au lieu de 6)
- good | 24 mois | de support par version (12 actifs + 12 LTS, au lieu de 18)
- bad | 28/11/2026 | fin de la LTS de la v20 — la seule échéance courte du tableau
:::

:::warn « Supporté » ne veut pas dire « maintenu »
Une version en LTS ne reçoit **que** les correctifs critiques et les patches de sécurité. Une v21 aujourd'hui, une v20 depuis novembre 2025 : elles sont couvertes, mais plus améliorées. C'est exactement la nuance qu'un responsable applicatif n'entend pas quand on lui dit « c'est encore supporté », et c'est celle qui justifie de planifier au lieu d'attendre l'échéance.
:::

## « Majeure » ne veut pas dire « grosse fonctionnalité »

C'est la confusion qui coûte le plus cher en réunion, et elle est antérieure à ce changement de cadence. SemVer ne décrit pas l'importance d'une version, il décrit **le risque de rupture**. Un numéro majeur qui s'incrémente signifie « quelque chose a pu casser », pas « il y a des nouveautés ». Symétriquement, une mineure peut embarquer une fonctionnalité considérable du moment qu'elle ne casse rien.

Concrètement, sur le cycle actuel : les fonctionnalités arriveront en **22.1, 22.2, 22.3, 22.4, 22.5**, et il n'y aura rien d'autre à faire que `npm update`. La prochaine fois qu'on devra prévoir du temps, du test et de la relecture, c'est **juin 2027**.

C'est aussi ce qui rend le nouveau rythme lisible pour une DSI : un rendez-vous annuel, connu d'avance, au lieu de deux fenêtres semestrielles qu'on repousse jusqu'à en rater une.

## La dépréciation passe à « une majeure » — et ne raccourcit rien

Une ligne du changement va être mal lue, et il vaut mieux la désamorcer tout de suite. La politique de dépréciation est passée de « au moins **deux** majeures » à « au moins **une** majeure ». Lu vite, ça ressemble à une division par deux du délai de grâce.

Ce n'est pas le cas. Deux majeures à 6 mois valaient environ **12 mois**. Une majeure à 12 mois vaut… environ **12 mois** — et la doc le pose noir sur blanc : la période de dépréciation dure *au minimum 12 mois*. Le nombre a changé parce que l'unité a changé. Le temps réel dont on dispose pour retirer une API dépréciée est identique.

Ce genre de détail n'a l'air de rien, jusqu'au jour où quelqu'un s'en sert comme argument pour refuser une montée de version.

## Statut au 12 septembre 2026

Encadré daté, à re-vérifier avant de s'en servir comme argument : le changement est passé par la pull request **`angular/angular#69817`**, « docs: add v23 release and change to yearly release cycle ». Au **12 septembre 2026**, son contenu est **en ligne dans la documentation officielle** — la page « Versioning and releases » affiche le cycle de 12 mois, les 24 mois de support et la cible v23 de juin 2027 (build de doc servi : **v22.1.6**). Ce n'est donc plus une proposition en discussion, c'est le calendrier de référence.

La prudence utile porte ailleurs : la doc rappelle que **les dates sont indicatives et peuvent bouger**. Les seules à traiter comme fermes sont les fins de support déjà affichées, à commencer par le **28 novembre 2026** pour la v20.

## Ce que ça change pour ta veille et tes missions

Pour une freelance, ce calendrier n'est pas une information technique, c'est un outil de planification. Trois conséquences pratiques.

1. **Une migration par an, planifiée, pas subie.** La fenêtre naturelle est le trimestre qui suit une majeure : les bugs de jeunesse sont sortis, les schematics `ng update` sont stabilisés, et les librairies tierces ont rattrapé. Pour la v23, ça situe la bonne fenêtre à l'**automne 2027**.
2. **Ne jamais sauter de majeure.** La règle `ng update` n'a pas changé : on met à jour **d'une majeure à la fois**, et la version de départ doit être encore supportée. Une v19 abandonnée se paie en migrations en chaîne, chacune avec ses propres ruptures.
3. **La veille se fait sur les mineures, pas sur les majeures.** C'est là que sortiront les nouveautés des douze prochains mois. Un article « les nouveautés d'Angular 23 » en juin 2027 arrivera après la bataille ; l'intérêt est dans les 22.x.

Cette lecture par fenêtres est la même que celle qui sert à lire le marché : voir [l'état du marché Angular front et fullstack en 2026](/fr/blog/angular-front-fullstack-marche-2026) et, pour la partie tarifaire, [le TJM d'un développeur Angular en 2026](/fr/blog/tjm-developpeur-angular-2026).

## Comment le vendre à un client

La phrase qui marche n'est pas « il faut migrer ». C'est **« voilà votre date, voilà ce qu'il se passe après, voilà le lot »**. Trois éléments, dans cet ordre.

D'abord la date, sourcée : *« votre v20 n'est plus corrigée que pour la sécurité depuis novembre 2025, et cette couverture s'arrête le 28 novembre 2026 — c'est la table officielle des versions supportées qui le dit »*. Ensuite le risque, sans dramatiser : passé cette date, plus aucun correctif, y compris de sécurité, et une dépendance qui casse devient un problème interne. Enfin le lot : une montée de version **chiffrée séparément** du reste, avec un périmètre écrit — inventaire des dépendances, `ng update` majeure par majeure, passe de tests, note de migration.

Le nouveau rythme est un argument commercial en soi : **un rendez-vous annuel prévisible** vaut mieux, pour un budget, que deux fenêtres semestrielles qu'on arbitre dans l'urgence. Et si le sujet plus large de la posture freelance t'intéresse, le [guide carrière Angular](/fr/carriere/guide) couvre la partie positionnement.

:::cta La *veille Angular* sans le bruit. | Les mineures qui comptent, les échéances de support, les migrations à prévoir — trié pour les devs qui facturent. | Recevoir NgDigest | https://ngdigest.co
:::

## À retenir

Une majeure par an, 24 mois de support, la v23 en juin 2027, et une seule échéance courte au tableau : le **28 novembre 2026**, fin de la v20. Le reste du travail n'est pas technique — c'est de transformer une date publique en une ligne de devis avant que ce soit le client qui découvre la date tout seul.

---

**Sources** :

- Versioning and releases — Angular, page officielle, consultée le 12/09/2026 (build de doc v22.1.6) : cycle de 12 mois, 4-6 mineures, support 24 mois, table des versions supportées, politique de dépréciation. [angular.dev](https://angular.dev/reference/releases)
- Pull request `angular/angular#69817` — « docs: add v23 release and change to yearly release cycle ». [github.com](https://github.com/angular/angular/pull/69817)
- Angular New Release Cycle: Release Schedule Change Explained, 05/08/2026 — reprise détaillée du changement de cadence. [angular.love](https://www.angular.love/angular-new-release-cycle-release-schedule-change-explained)
