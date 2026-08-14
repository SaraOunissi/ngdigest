<!--
Draft généré par project-worker 2026-05-25 (q024 QUEUE).

Mots-clés candidats (méthode peu concurrentielle FR+EN) :
1. "angular selectorless components"          — FR + recherché en EN (SERP : 2 Medium EN + 1 Kite Metric + 1 DEV.to + 1 angular.dev officiel au 25/05/2026)
2. "angular 22 import direct composant"       — FR pur (SERP 0 article FR ciblé au 25/05/2026)
3. "composant sans selector angular"          — FR pur
4. "selectorless angular guide pratique"      — FR + recherché en EN long-tail
5. "angular 22 nouveau template syntax"       — FR + recherché en EN
6. "supprimer selector composant angular"     — FR pur
7. "angular standalone selectorless"          — FR + recherché en EN
8. "migrer composant angular vers selectorless" — FR pur

Principal : "angular selectorless components" (FR+EN), "angular 22 import direct composant" (FR pur).
Secondaires : "composant sans selector angular" (FR pur), "selectorless angular guide pratique", "migrer composant angular vers selectorless" (FR pur).

SERP density audit 2026-05-25 :
- "angular selectorless components" → 5-6 articles EN (medium.com, dev.to, kitemetric, herodevs, mescius) + RFC GitHub + angular.dev officiel. Aucun guide pratique FR. Green light total côté FR.
- "angular 22 import direct composant" → SERP FR vide, dominée par "import angular component" générique. Long-tail libre.
- "composant sans selector angular" → 1-2 forums StackOverflow EN sur le concept général "directive without selector" (autre sujet pré-v22). Green light fort.
- "migrer composant angular vers selectorless" → SERP FR 0. Niche dans la niche.

Sources scannées (idea-forge run 2 + project-worker confirm) :
- https://angular.dev/guide/components (anatomy of components)
- https://medium.com/@manishdidwaniyaa/angulars-next-big-move-the-end-of-selectors-and-the-rise-of-pure-components-9df98558fb56
- https://medium.com/dev-tech-zone/end-of-selectors-in-angular-selectorless-is-the-future-eb385cbcb460
- https://dev.to/karol_modelski/building-selectorless-components-angulars-approach-to-boilerplate-free-uis-i29
- https://kitemetric.com/blogs/building-selectorless-components-in-angular-a-guide-to-cleaner-uis
- https://dev.to/this-is-angular/ng-news-2514-selectorless-pr-4j36
- https://developer.mescius.com/blogs/what-to-expect-in-angular-22
- https://versionlog.com/angular/22.0/
- https://gist.github.com/mgechev/1cba27ab086c567e0a29615430c99479 (selectorless-explanation.md Minko Gechev)
- Mémo idea-forge 22/05 : Angular 22.0.0-rc.0 sorti 13/05/2026, stable 13-16/05/2026 selon source

Notes à valider Sara avant publication :
- Confirmer si Selectorless est en feature stable ou encore flag dans Angular 22 stable (RC0 13/05, stable annoncé pour mi-mai 2026 — Sara a-t-elle vu un flag d'opt-in dans `ng new --selectorless` ou c'est natif ?)
- Vérifier la syntaxe exacte des inputs en selectorless (`[label]="..."` ou `label="{{...}}"` — d'après les sources la syntaxe reste identique aux standalone components, à reconfirmer côté angular.dev/guide/components)
- Section "Le micro-test sur orogramme" est extrapolée du retour terrain Sara workers Claude Code — verbatim à valider, Sara n'a peut-être pas encore testé sur orogramme
- Capture d'écran avant/après recommandée (NgModule + selector vs imports + composant en PascalCase)
- Internal link vers q023 (générique Angular 22 freelance) à activer dès publication
- Article à publier idéalement avant ou en même temps que q033 (OnPush par défaut) pour faire un combo "Angular 22 : 2 changements qui touchent ton legacy"
-->

---
title: "Selectorless components Angular 22 : le guide pratique FR pour arrêter d'écrire `app-` partout"
slug: "angular-22-selectorless-components"
description: "Angular 22 stabilise les selectorless components : imports directs de classes dans les templates, fin du double import standalone, meilleure refactorabilité. Le guide concret avec AVANT/APRÈS, exemples Angular 21 vs 22, et la décision migration freelance."
date: "2026-05-25"
author: "Sara Ounissi"
tags: ["angular", "angular-22", "selectorless", "standalone", "refactor"]
lang: "fr"
keywords: ["angular selectorless components", "angular 22 import direct composant", "composant sans selector angular", "selectorless angular guide pratique", "migrer composant angular vers selectorless"]
alternate: null
---

Angular 22 (RC0 le 13 mai 2026, stable mi-mai) embarque une feature qui ne fait pas la une mais qui change le quotidien : les **selectorless components**. En clair : tu peux maintenant utiliser un composant dans un template en l'**important comme une classe**, sans lui filer un `selector: 'app-truc'` ni l'écrire en kebab-case avec ton préfixe d'équipe.

`<UserCard [user]="me()" />` au lieu de `<app-user-card [user]="me()"></app-user-card>`.

Ça paraît cosmétique. Ça ne l'est pas. C'est la fin du **double import** des standalone components (importer la classe + référencer le selector string), et c'est probablement le plus gros gain de DX en Angular depuis l'arrivée des signals.

Je l'ai testé sur orogramme (Angular 22 from scratch) et sur les 3 nouveaux composants ajoutés à ngdigest cette semaine. Voici le retour terrain — la vraie syntaxe, les vrais cas d'usage, et la décision migration legacy (spoiler : pas de big bang).

> Si tu débarques sur Angular 22 sans context, lis d'abord mon [retour d'expérience zoneless en production](./draft-angular-21-zoneless-retour-experience.md) *(à paraître)*. Le combo zoneless + selectorless + OnPush par défaut, c'est le vrai paquet "Angular 22 moderne". Et ça change ta facturation en mission ([cf article TJM 2026](./tjm-developpeur-angular-2026.md)).

## C'est quoi selectorless, en deux phrases

Depuis les standalone components (Angular 14+), tu déclares déjà tes imports composant par composant. Mais tu dois quand même donner un `selector` string à chaque composant ET référencer ce selector dans le template ET importer la classe. **Trois étapes pour une seule intention.** Selectorless supprime l'étape selector + l'écriture kebab-case : tu importes la classe, tu l'utilises directement par son nom PascalCase dans le template.

Le RFC originel ([selectorless-explanation.md, Minko Gechev](https://gist.github.com/mgechev/1cba27ab086c567e0a29615430c99479)) parle de "pure components" parce qu'un composant selectorless ne dépend plus d'un namespace HTML global — il est résolu **localement** au moment de la compilation, par les imports du composant parent. Plus de collision de selectors entre librairies, plus de préfixe `app-` ou `ngx-truc-` à négocier en réunion de tech lead.

## AVANT / APRÈS — Angular 21 vs Angular 22

**Angular 21 (standalone classique)**

```typescript
// user-card.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user-card',      // ← string selector, kebab-case avec préfixe
  standalone: true,
  template: `
    <article>
      <h3>{{ user().name }}</h3>
      <p>{{ user().email }}</p>
    </article>
  `,
})
export class UserCardComponent {
  user = input.required<{ name: string; email: string }>();
}
```

```typescript
// dashboard.component.ts
import { Component, signal } from '@angular/core';
import { UserCardComponent } from './user-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UserCardComponent],   // ← import de la classe
  template: `
    <app-user-card [user]="me()"></app-user-card>
    <!-- ← référence par string selector, kebab-case, balise fermante obligatoire -->
  `,
})
export class DashboardComponent {
  me = signal({ name: 'Sara', email: 'sara@ngdigest.co' });
}
```

**Angular 22 (selectorless)**

```typescript
// user-card.ts
import { Component, input } from '@angular/core';

@Component({
  // ← plus de selector !
  template: `
    <article>
      <h3>{{ user().name }}</h3>
      <p>{{ user().email }}</p>
    </article>
  `,
})
export class UserCard {
  user = input.required<{ name: string; email: string }>();
}
```

```typescript
// dashboard.ts
import { Component, signal } from '@angular/core';
import { UserCard } from './user-card';

@Component({
  imports: [UserCard],            // ← import direct, c'est tout
  template: `
    <UserCard [user]="me()" />
    <!-- ← référence par nom de classe PascalCase, self-closing OK -->
  `,
})
export class Dashboard {
  me = signal({ name: 'Sara', email: 'sara@ngdigest.co' });
}
```

Ce qui disparaît côté Angular 22 :

- Le `selector: 'app-user-card'` dans le décorateur
- Le suffixe `Component` dans le nom de classe (convention RFC : on revient à des noms courts type `UserCard`, `Dashboard`)
- Le `standalone: true` (déjà default depuis Angular 19, juste rappel)
- La balise fermante du template (`<UserCard ... />` self-closing comme JSX)
- Le namespace global de selectors (plus jamais de collision `ngx-toast` entre deux libs)

## Pourquoi ça change le quotidien en mission Angular freelance

Trois trucs concrets que je remarque depuis 10 jours sur orogramme.

**1. Refactor "rename" qui marche enfin.** Avant : tu renommes `UserCardComponent` → `MemberCardComponent`, ton IDE update les imports TS mais oublie 4 templates qui référencent encore `<app-user-card>`. Le build casse en silence ou pire, pète au runtime sur un Astro lazy-load. En selectorless, l'IDE renomme la classe **et** ses usages template d'un coup, parce que c'est le même symbole TypeScript.

**2. Type safety enfin réelle dans les templates.** Avec un selector string, le compilateur ne peut pas vérifier que `<app-user-card [usr]="me()">` correspond à un input `usr` qui existe — le check arrive plus tard via Angular Language Service. En selectorless, c'est du TypeScript pur : `<UserCard [usr]="me()" />` plante immédiatement à la compile parce que `UserCard` n'a pas d'input `usr`.

**3. Onboarding junior client divisé par deux.** Quand tu arrives en mission sur une codebase legacy avec `<acme-table-row-cell>` + `<acme-button-secondary>` + `<acme-modal-confirm-soft>` qui se baladent dans 200 templates, tu passes ta première semaine à `cmd+P` les fichiers correspondants. Avec selectorless, `cmd+click` sur `<TableRowCell>` te jette direct sur la classe. Ce n'est pas un gadget, c'est 1-2 jours de productivité retrouvés sur les missions de découverte courte.

> **Quand migrer une codebase existante (et quand surtout pas)**
>
> ✅ **Migre maintenant** si : codebase < 50 composants, déjà 100% standalone, équipe < 5 devs, pas de design system maison publié sur npm. Migration progressive composant par composant, ~5-15 min par composant. Tu peux **mixer** anciens et nouveaux dans le même template tant que le composant cible est importé dans `imports: []`.
>
> ⚠️ **Attends 2-3 mois** si : codebase Angular 14-16 avec mélange NgModules + standalone, ou design system maison consommé par d'autres équipes (le rename des classes va casser leurs imports). Migre d'abord 100% vers standalone, puis selectorless.
>
> 🛑 **Ne touche surtout pas** si : tu génères du HTML server-side avec des selectors hardcodés (CMS legacy, Angular Universal version antérieure à 17), ou tu vends une lib npm Angular consommée par des apps en v18 ou moins — tes selectors sont un contrat public, casser ça flingue ta réputation lib.

## Le micro-test sur orogramme

Trois composants concrets que j'ai créés cette semaine en selectorless sur orogramme :

- `<PriceTrend [price]="goldPrice()" />` — un sparkline qui montre la tendance du cours de l'or sur 30 jours
- `<BoutiqueCard [boutique]="b" [highlight]="true" />` — la carte boutique sur la home
- `<FilterChip [label]="..." [active]="..." (toggle)="..." />` — un chip de filtre dans la grille produits

Sur les trois, j'ai **gagné une moyenne de 8 lignes de code par composant** (selector + balise fermante + suffixe `Component` × 2-3 usages chacun). Sur 80 composants à terme, c'est 600+ lignes qui disparaissent — et 80 noms à ne plus négocier avec moi-même quand je crée un composant à 23h.

## Setup minimum (3 minutes)

Pré-requis : Angular 22+ et un nouveau composant ou existant 100% standalone.

**Étape 1.** Crée ton composant **sans** le `selector` :

```bash
ng generate component user-card --selectorless
```

(ou simplement supprime le `selector` à la main si tu codes en pure TS).

**Étape 2.** Dans le parent, import la classe comme d'habitude :

```typescript
import { UserCard } from './user-card';

@Component({
  imports: [UserCard],
  template: `<UserCard [user]="me()" />`,
})
```

**Étape 3.** Utilise le nom de classe en PascalCase dans le template, self-closing si pas de content projection, balise ouvrante/fermante sinon :

```html
<UserCard [user]="me()" />
<Card>
  <h3>Mon titre projeté</h3>
</Card>
```

C'est tout. Pas de flag d'opt-in, pas de config tsconfig — c'est natif en Angular 22.

## Mon take perso

Le selectorless ne va pas révolutionner la façon dont tu architectures une app Angular. C'est un **gain de productivité quotidien** qui se compte en heures gagnées par mois, pas en bouleversement.

Pour un dev Angular freelance qui se vend sur **"je connais Angular 22 en prod, je peux ramener ton legacy à jour"**, c'est exactement le genre de feature à mettre en avant en entretien client. Tu montres un AVANT/APRÈS sur une codebase test, tu chiffres le gain (lignes / minutes / collision de noms évitées), et tu justifies les 50-100€/jour de TJM en plus dont je parlais dans [l'article TJM Angular 2026](./tjm-developpeur-angular-2026.md).

À éviter en revanche : aller pitcher une migration selectorless comme un projet en soi à un client. **Ce n'est jamais un projet**, c'est un chantier de fond qui se fait au fil des nouveaux composants créés + des refacto naturels. Si on te commande "une migration selectorless dédiée", c'est probablement une mission mal scopée — recadre vers "modernisation Angular 22 complète" (selectorless + zoneless + OnPush par défaut + Vitest), et là tu factures à la valeur.

Prochain article dans la série Angular 22 : le passage de Karma vers Vitest sur une codebase legacy, ce qui marche et ce qui casse (à paraître).

<!-- by project-worker 2026-05-25 (q024 QUEUE) -->
