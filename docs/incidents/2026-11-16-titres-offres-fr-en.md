# Titres identiques entre les fiches offre FR et EN — 16/11/2026

## Constat (gardien de prod, contrôle des sitemaps du lundi)

`https://ngdigest.co/fr/jobs/aircall-frontend-remote-france` et
`https://ngdigest.co/en/jobs/aircall-frontend-remote-france`, toutes deux au sitemap,
servaient le même `<title>` : « Frontend Engineer (Remote France) · Aircall · NgDigest ».
Les 44 autres URL du sitemap avaient un titre unique ; pas d'erreur, pas de `noindex`,
canoniques correctes.

## Cause

`JobDetailComponent` construisait le titre sans tenir compte de la langue
(`${job.title} · ${job.company} · NgDigest`). La description de repli était en français
sur les deux langues, et la page EN ignorait `editorialHookEn`.

## Correctif (branche `fix/titres-offres-fr-en`)

- `job-detail-seo.ts` : titre et description par langue, sur le modèle `SEO_TITLES`
  (« · Offre Angular chez … » / « · Angular job at … »), accroche EN si elle existe.
- `job-detail-seo.spec.ts` : titres FR ≠ EN, aucun titre répété sur l'ensemble des fiches
  publiées (FR + EN), choix de l'accroche selon la langue.

## Vérification

- Local : `ng test` 233/233, `ng lint` sans erreur, `ng build --configuration development`
  (le build de prod échoue hors réseau sur l'intégration des polices Google, 403 du proxy).
  HTML prérendu : titres FR et EN distincts pour la fiche Aircall.
- Non vérifié en production (pas encore fusionné ni déployé).

## Reste

La fiche Aircall n'a pas d'`editorialHookEn` : sa description EN reste en français
(repli sur l'accroche FR). Contenu à traduire dans `src/content/jobs/`, hors de ce correctif.
