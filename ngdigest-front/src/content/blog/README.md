# Charte d'écriture — Blog NgDigest

Tout article se rédige en **Markdown**. Le rendu éditorial (Space Grotesk, lettrine,
filets dégradé, tableaux, pull-quotes, encadrés) est **automatique** — tu n'écris
**jamais** de HTML ni de CSS. Le pipeline `scripts/generate-blog-index.mjs` transforme
chaque `.md` en `blog-data.generated.ts` en appliquant la charte ci-dessous.

Un `.md` est **publié** dès qu'il a tout le frontmatter requis ; sinon il reste un
brouillon ignoré (préfixe `draft-` conseillé pour les WIP).

---

## 1. Frontmatter

```yaml
---
title: "Titre : la promesse en une phrase"
slug: "mon-article"                # identifiant d'URL, unique par langue
description: "Le chapô : 1–2 phrases d'angle. S'affiche en gros italique sous le titre ET en liste."
date: "2026-05-20"                 # ISO ; une date future = publication différée (drip)
author: "Sara Ounissi"
tags: ["angular", "freelance", "fullstack"]
lang: "fr"                         # "fr" | "en"
alternate: "my-article"            # slug de l'autre langue ('' si pas de traduction)
# ── Optionnels (carte « à la une ») ──
featured: false                    # true = épingle l'article en tête de liste
highlight: { value: "≈ 1 000", label: "légende courte du grand chiffre" }
cover: ""                          # /assets/blog/<slug>/cover.webp, sinon placeholder rayé
---
```

**Requis** (sinon l'article est ignoré) : `title`, `slug`, `description`, `date`,
`author`, `lang`, `alternate`. À la une = article le plus récent, sauf `featured: true`.

---

## 2. Les sections (rendu automatique)

| Markdown écrit | Rendu NgDigest |
|---|---|
| `## Titre` | Titre de section + **filet dégradé** + entrée de sommaire + ancre |
| `### Titre` | Sous-titre display, sans filet |
| 1er paragraphe du corps | **Lettrine** dégradé automatique |
| `> Une phrase forte.` | **Pull-quote** display italique, bordure gauche dégradé |
| `- item` | Puce ronde dégradé |
| `1. **Titre.** texte` | **Pastille ronde** numérotée (vraie syntaxe `1.`) |
| tableau GFM `\| … \|` | Tableau scrollable-x, en-tête mono magenta |
| `` `code` `` / ```` ``` ```` | Code mono, fond surface |
| `[texte](url)` | Lien magenta souligné |
| `---` puis `**Sources** :` | Tout ce qui suit le `---` est **dé-emphasé** (bloc sources) |

---

## 3. Les 3 directives spéciales

### `:::keyfigures` — trois grands chiffres
```markdown
:::keyfigures Titre optionnel de l'encadré
- bad | −18 % | Recrutement informatique 2024 (APEC)
- bad | −19 % | Profils juniors (APEC)
- good | +4,3 % | Croissance 2026 ciblée cyber/cloud/data (Numeum)
:::
```
Chaque ligne : `variante | valeur | légende`. Variantes : `gold`, `bad` (rouge),
`good` (vert), `neutral`. Vise **3 colonnes**.

### `:::note` / `:::warn` / `:::tip` — callout
```markdown
:::warn Signal à surveiller
La demande Node **baisse** en ce moment. À suivre sur 12 mois avant de miser dessus.
:::
```
`note` = bleu, `warn` = or, `tip` = vert. Le texte après la directive = titre. **1–2 max.**

### `:::cta` — bandeau de fin (produit NgDigest)
```markdown
:::cta Titre *accentué.* | Sous-titre. | Libellé bouton | https://ngdigest.co
:::
```
`Titre | Sous-titre | Bouton | URL`. Le `*texte*` du titre passe en dégradé.
**Un seul CTA par article**, juste **avant** la conclusion.

---

## 4. Règles strictes

1. **Sections en `##`** uniquement (le `#` est réservé au titre) — ce sont elles qui
   génèrent le sommaire et les ancres.
2. **1er paragraphe** = lettrine automatique — attaque par une scène concrète.
3. **Pull-quote** = un simple `> …` isolé par des lignes vides. 1–2 max.
4. **Chiffres en `**gras**`** systématiquement (`**~1 000 offres**`, `**+4,3 %**`).
5. **Liste numérotée** = vraie syntaxe `1. **Titre.**` (jamais `**1. Titre.**`).
6. **Un seul `:::cta`**, avant la conclusion.
7. **Callouts** : 1–2 max par article.
8. **Sources** = `**Sources** :` en **paragraphe gras** après un `---`. Tout ce qui
   suit le `---` rend dé-emphasé. Dans chaque puce, seul `[domaine.com]` est le lien.
9. **Conclusion** dans un `## visible` ; le `---` ne sépare **que** les sources.
10. **Tableaux** : ≤ 3 colonnes de préférence. Au-delà de 4 colonnes de chiffres,
    préférer une `:::keyfigures`.
11. **Parité FR/EN** : même nombre et mêmes positions de `:::keyfigures`, `>`, `:::cta`,
    mêmes `##`. Appliquer tout delta FR côté EN dans la foulée.
12. **Images** : facultatives (le placeholder + `highlight` rend déjà bien). Si image :
    WebP ≤ 1600px / < 150 Ko, alt descriptif, dans `public/assets/blog/<slug>/`.

---

## 5. Régénérer & vérifier

```bash
npm run generate:blog        # régénère blog-data.generated.ts (lancé aussi au build)
```

Puis relire `/{fr,en}/blog` et `/{fr,en}/blog/<slug>`. Checklist : sommaire cliquable +
scrollspy · barre de progression · lettrine · filets de titre · pull-quote · table
scrollable mobile · keyfigures 3 colonnes · callout · CTA · sources dé-emphasées · bloc
auteur · articles liés · toggle FR/EN qui bascule le slug via `alternate`.
