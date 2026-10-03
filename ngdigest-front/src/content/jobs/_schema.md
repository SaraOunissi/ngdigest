---
# ───────────────────────────────────────────────────────────────────────────
# Schéma d'une offre `/jobs` — dupliquer ce fichier et renommer en
# YYYY-MM-DD-<slug>.md (date = premier repérage, slug identique au champ slug).
# UN SEUL fichier par offre, bilingue : les textes anglais vont dans les champs
# *En (editorialHookEn, editorialNoteEn, locationEn, salaryEn). Pas de dossiers
# fr/en ni de champ `alternate`.
# Écrit directement ici par la veille hebdomadaire `pepites-job` ; contrôlé au
# build par scripts/lib/jobs-schema.mjs (le build échoue si un champ est faux).
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
locationEn: "Paris"                       # facultatif
language: fr                              # fr | en — langue de l'offre

# Rémunération — laisser null pour le champ non applicable
salary: "65 000 – 90 000 €/an"            # montant annuel lisible ; aussi pour un freelance payé à l'année
salaryEn: "€65,000 – €90,000/year"        # facultatif, version anglaise
tjm: null                                 # ex: "550-650€/j" ; affiché en priorité s'il est renseigné
# Offre active sans montant : interdit, sauf tag `salaire-non-communique`.

stack:
  - Angular
  - TypeScript

url: "https://example.com/job"            # URL externe (Welcome to the Jungle, LinkedIn, etc.)

scannedAt: 2026-05-16                     # dernière vérification du lien à la source (pas dans le futur)
status: active                            # active | expired (une offre morte passe en expired, on ne supprime pas le fichier)

tags:
  - angular
  - remote-france
  - cdi-senior

editorialHook: "Phrase d'accroche courte affichée sur la carte liste."
editorialHookEn: "Short hook shown on the list card."

editorialNote: |
  Note éditoriale complète Sara, multi-lignes. Verbatim depuis la pépite
  bi-mensuelle. Affiché en quote sur la page détail. Explique pourquoi cette
  offre figure dans la sélection ngdigest.
editorialNoteEn: |
  English version of the editorial note.
---

Pas de corps markdown — toutes les infos sont dans le frontmatter.
Le script ignore ce contenu pour les offres ; on garde la convention
d'un fichier par offre pour rester homogène avec le blog.
