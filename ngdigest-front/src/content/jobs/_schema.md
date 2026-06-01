---
# ───────────────────────────────────────────────────────────────────────────
# Schéma d'une offre `/jobs` — dupliquer ce fichier et renommer en
# YYYY-MM-DD-<slug>.md à chaque nouvelle offre curated par Sara.
# Le script scripts/generate-jobs-data.mjs ignore tout fichier dont le nom
# commence par "_" (donc ce fichier ne sera jamais publié).
# ───────────────────────────────────────────────────────────────────────────

slug: company-titre-poste-zone           # unique, kebab-case, sert d'URL /jobs/<slug>

title: "Titre exact du poste"             # ex: "Frontend Engineer (Remote France)"
company: "Nom Entreprise"
companyLogo: ""                           # facultatif : /assets/jobs/companies/xxx.png

type: CDI                                 # CDI | Freelance
remote: 100                               # 100 | hybride | onsite
zone: FR                                  # FR | EU | Worldwide
location: "Paris"                         # libre, lisible humain ex "Paris / Berlin" ; null si non pertinent
language: fr                              # fr | en — langue de l'offre

# Rémunération — laisser null pour le champ non applicable
salary: "65k-90k€"                        # libre, lisible humain ; null si freelance
tjm: null                                 # ex: "550-650€/j" ; null si CDI

stack:
  - Angular
  - TypeScript

url: "https://example.com/job"            # URL externe (Welcome to the Jungle, LinkedIn, etc.)

scannedAt: 2026-05-16                     # date à laquelle Sara a scanné l'offre
status: active                            # active | expired

tags:
  - angular
  - remote-france
  - cdi-senior

editorialHook: "Phrase d'accroche courte affichée sur la carte liste."

editorialNote: |
  Note éditoriale complète Sara, multi-lignes. Verbatim depuis la pépite
  bi-mensuelle. Affiché en quote sur la page détail. Explique pourquoi cette
  offre figure dans la sélection ngdigest.
---

Pas de corps markdown — toutes les infos sont dans le frontmatter.
Le script ignore ce contenu pour les offres ; on garde la convention
d'un fichier par offre pour rester homogène avec le blog.
