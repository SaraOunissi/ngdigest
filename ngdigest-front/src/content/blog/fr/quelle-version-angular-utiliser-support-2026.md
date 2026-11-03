---
title: "Quelle version d'Angular utiliser pour ton projet (et quand migrer) ?"
slug: "quelle-version-angular-utiliser-support-2026"
description: "Angular 20 perd tout support le 28 novembre 2026. Comment choisir ta version selon le support et tes dépendances, avec un retour de migration réel."
date: "2026-11-04"
author: "Sara Ounissi"
tags: ["angular", "migration", "veille"]
lang: "fr"
alternate: "which-angular-version-to-use-support-2026"
highlight: { value: "28/11/2026", label: "fin de tout support pour Angular 20" }
---

Je n'ai jamais été très bonne pour faire ma veille Angular. Les nouveautés me tombaient dessus au moment des migrations, jamais avant. Et « jusqu'à quand ma version est supportée ? », c'est typiquement le genre de question que je découvrais en même temps que le reste.

En 2026, ça vaut le coup de se la poser un peu en avance. Depuis Angular 22, il n'y a plus qu'une version majeure par an, chaque version est couverte 24 mois, et Angular 20 perd tout support le 28 novembre.

Dans cet article, je te donne ma réponse courte selon la version que tu as en prod, ce que veulent vraiment dire « support actif » et « LTS », ce qu'il faut vérifier avant de migrer, et ce que j'ai appris d'une migration où le design system ne suivait pas.

## La réponse courte

Ça dépend de ce que tu as déjà en prod. Voilà comment je vois les choses aujourd'hui :

- **Tu démarres un projet** → pars sur la dernière version stable, Angular 22. Vérifie juste avant que les librairies dont tu as besoin la supportent.
- **Tu es en Angular 21** → pas d'urgence. Ta version est couverte jusqu'en juin 2027, tu as le temps de préparer la suite tranquillement.
- **Tu es en Angular 20** → là, il faut bouger. Le support s'arrête le **28 novembre 2026**.
- **Tu es sur une version plus ancienne** → avant de chiffrer quoi que ce soit, commence par faire l'état des lieux : dépendances, étapes de migration, écrans à ne surtout pas casser.

:::keyfigures Les trois dates à retenir (vérifiées le 2 novembre 2026)
- bad | 28/11/2026 | fin de tout support pour **Angular 20**
- gold | juin 2027 | fin de la LTS d'**Angular 21**
- good | juin 2028 | fin de la LTS d'**Angular 22**, la version actuelle
:::

Pour savoir où en est ta propre version, j'ai fait un petit outil : [Ma version d'Angular est-elle encore supportée ?](/fr/outils/support-versions-angular). Tu choisis ta version, il te donne son statut, les jours restants et les étapes de migration jusqu'à la dernière.

## Support actif, LTS, fin de support : ce que ça veut dire concrètement

Une version peut être « supportée » sans recevoir de nouveautés. Il y a trois états :

- **Support actif** : la version reçoit les nouveautés et les correctifs réguliers.
- **LTS** : plus de nouveautés, seulement les correctifs critiques et de sécurité.
- **Fin de support** : plus rien du tout, même si une faille de sécurité est découverte.

:::note Fin de support ne veut pas dire que ton appli s'arrête
Le 29 novembre, ton application en Angular 20 tournera exactement comme la veille. Ce qui change, c'est que plus personne ne corrigera rien dessus. C'est un risque, pas une panne.
:::

Depuis Angular 22, l'équipe sort une version majeure par an, et chaque version est couverte 24 mois : 12 mois de support actif, puis 12 mois de LTS. Les dates peuvent bouger, donc je te conseille quand même de revérifier sur [angular.dev](https://angular.dev/reference/releases) au moment où tu planifies ta migration.

## Avant de choisir ta cible, regarde tes dépendances

Je vais être cash : la version d'Angular, c'est rarement elle qui bloque. Ce sont les librairies autour. Une librairie de composants, un éditeur de texte riche, un outil maison géré par une autre équipe… Il suffit d'une seule qui ne suit pas pour que toute ta migration prenne du retard.

Donc avant de fixer une date, je regarde :

- les versions d'Angular supportées par chaque dépendance importante ;
- la [compatibilité Node.js, TypeScript et RxJS](https://angular.dev/reference/versions) de la version cible.

Si une dépendance indispensable ne suit pas encore, tu as en gros trois options : rester un peu sur une version encore supportée, mettre à jour ou remplacer la librairie, ou isoler le travail qui débloque la migration. Ça dépend de la place qu'elle prend dans ton appli et du temps que tu as.

Et surtout, ne choisis pas une version juste parce que le numéro est plus grand. Le but, c'est une appli maintenable qui marche toujours.

## Ce qui m'est arrivé en mission : Angular 14 vers 15, puis 16

Chez un client, je me suis occupée de la montée de version d'Angular 14 à 15. Le design system qu'on utilisait était géré par une autre équipe, qui devait suivre les montées de version d'Angular de son côté.

Sauf qu'eux n'avaient pas assez de temps ni de ressources pour faire cette migration correctement. Ils sont bien passés en 15, mais toute la partie Material est restée en legacy. C'était justement là qu'il y avait le plus de changements : avec Angular Material 15, les composants passent sur MDC, avec une structure HTML et des styles différents, et les anciennes versions restent disponibles via des imports legacy ([annonce officielle d'Angular 15](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8)).

Résultat : pour m'adapter à leur projet, j'ai dû passer tous les imports Material de notre appli en legacy. Et on a traîné ça pendant plusieurs mois.

Environ six mois plus tard, on est passés de la 15 à la 16. Cette fois, le design system avait fait sa migration comme il faut. Donc j'ai dû tout enlever à la main, dans l'autre sens. C'était pas la fin du monde, mais c'était super pénible : une partie du travail a été faite deux fois, et il fallait faire attention à ce que ce soit propre partout.

:::warn Un build vert ne veut pas dire que ton appli marche
Techniquement, une montée de version n'est des fois pas si compliquée. Mais côté front, il faut quand même repasser sur tous les écrans, aller chercher les petites modales cachées qu'on n'ouvre jamais, vérifier qu'elles s'affichent bien, et tester sur les différents navigateurs. Surtout quand la migration touche toute la partie graphique, comme Material ici.
:::

Au total, cette montée de version m'a pris plusieurs semaines. Pour être honnête, je découvrais aussi le projet en même temps : il y avait la migration, mais aussi toute ma prise en main de l'appli. Donc ce n'est pas un délai à appliquer à toutes les migrations.

Ce que j'en retiens pour le chiffrage : on chiffre souvent la montée de version technique, mais pas toujours les tests, la recette visuelle et les corrections de régression. Et c'est souvent là que part le temps.

## Comment je découpe une migration

Pour estimer le travail, je pars d'une liste courte :

1. La version actuelle et la version cible.
2. Les dépendances qui doivent évoluer.
3. Les écrans et les parcours à ne surtout pas casser : connexion, recherche, formulaires, paiement s'il y en a un.
4. Les tests qui existent, et les vérifications à faire à la main.

Ensuite, j'utilise le [guide de mise à jour officiel](https://angular.dev/update-guide) pour chaque saut de version, et j'avance une majeure à la fois. Après chaque étape, je vérifie le build et les parcours concernés avant de passer à la suivante.

Si on te demande une migration « en une journée », commence plutôt par un petit diagnostic. Il sert à faire sortir les inconnues avant de promettre une date.

## Et si tu ne peux pas migrer tout de suite ?

Ça arrive, et ce n'est pas grave en soi. L'important, c'est de savoir pourquoi : pas le temps, une dépendance qui bloque, pas de tests ? Ensuite, choisis une seule prochaine action qui réduit vraiment le risque : vérifier une librairie, préparer un environnement de test, ou couvrir le parcours le plus important.

Si ta version est encore supportée, bloque un créneau avant la date de fin. Si elle ne l'est plus, dis-le clairement à ton équipe ou à ton client. Le site qui tourne, ça ne fait pas disparaître le risque.

Moi, je résume tout ça sur une page : version actuelle, cible, date limite, ce qui bloque, et ce qu'il faut vérifier. C'est simple, mais ça suffit pour que tout le monde prenne la même décision.

:::cta Ta version est-elle encore supportée ? | Le statut, les jours restants et ton chemin de migration en 10 secondes. | Vérifier ma version | /fr/outils/support-versions-angular
:::

Pour replacer tout ça dans ton parcours, tu peux aussi lire le [guide carrière Angular](/fr/carriere/guide) et mon analyse du [marché Angular front et fullstack](/fr/blog/angular-front-fullstack-marche-2026).

---

**Sources** (vérifiées le 2 novembre 2026 ; les dates annoncées par Angular peuvent évoluer) :

- [Versions et politique de support Angular](https://angular.dev/reference/releases)
- [Compatibilité Node.js, TypeScript et RxJS](https://angular.dev/reference/versions)
- [Guide de mise à jour Angular](https://angular.dev/update-guide)
- [Annonce officielle d'Angular 15](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8)
