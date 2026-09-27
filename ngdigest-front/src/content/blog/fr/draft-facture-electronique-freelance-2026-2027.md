---
title: "Facture électronique 2026-2027 : ce qu'un dev freelance doit VRAIMENT faire au 1er septembre"
slug: "facture-electronique-freelance-2026-2027"
description: "Le 1er septembre 2026, tu dois savoir recevoir. Émettre, c'est le 1er septembre 2027. Deux verbes, deux dates — et quatre pièges que la presse tech française ne traite pas : la franchise de TVA, la « solution compatible » qui n'est pas agréée, les clients étrangers, et le droit à l'erreur."
date: "2026-08-22"
author: "Sara Ounissi"
tags: ["freelance", "administratif", "facturation", "france"]
lang: "fr"
alternate: "french-e-invoicing-freelance-2026-2027"
highlight: { value: "2026 / 2027", label: "recevoir, puis émettre" }
---

<!-- by project-worker 2026-08-22 (q179) — périmètre corrigé validé par Sara le 21/08 (BLOCKERS B10) -->

Un client m'a écrit fin juillet : « à partir de septembre je passe en facturation électronique, tu es prête ? » J'ai répondu oui avant de vérifier, et j'ai passé la soirée à lire des articles qui disaient tous la même chose de travers. La moitié annonçait que les freelances devraient **émettre** leurs factures en électronique au 1er septembre 2026. C'est faux. Et cette erreur-là ne coûte pas qu'une incompréhension : elle pousse des indépendants à souscrire dans l'urgence un abonnement pour une obligation qui n'est pas encore la leur.

Voilà ce que dit réellement le texte, ce qui te concerne toi, développeur ou développeuse indépendante, et les quatre points où presque tout le monde se trompe.

## Deux verbes, deux dates : c'est toute la réforme

La réforme tient en deux obligations distinctes, séparées d'un an.

**Au 1er septembre 2026**, toutes les entreprises établies en France et assujetties à la TVA doivent être **capables de recevoir** une facture électronique. Pour ça, il faut être raccordé à une **plateforme agréée** : c'est elle qui reçoit la facture de ton fournisseur et te la présente. C'est la seule échéance qui te concerne dans dix jours.

**Au 1er septembre 2027**, l'obligation d'**émettre** arrive pour les PME, les TPE et les micro-entreprises — c'est-à-dire pour l'écrasante majorité des devs freelances. Les grandes entreprises et les ETI, elles, émettent dès 2026 : c'est précisément pour ça que tu dois savoir recevoir un an avant de savoir émettre. Tes gros clients basculent les premiers, et tu es en bout de chaîne.

:::keyfigures Le calendrier, sans le brouillard
- gold | 01/09/2026 | Recevoir — toutes les entreprises assujetties à la TVA
- neutral | 01/09/2026 | Émettre — grandes entreprises et ETI seulement
- good | 01/09/2027 | Émettre — PME, TPE et micro-entreprises
:::

Retiens la formulation : **recevoir en 2026, émettre en 2027**. Tout article qui écrit « les freelances devront facturer en électronique dès septembre 2026 » mélange les deux lignes de ce tableau.

## « Je suis en franchise de TVA, donc je ne suis pas concernée » — non

C'est l'erreur que j'entends le plus, et elle vient d'une confusion de vocabulaire fiscal parfaitement compréhensible : **assujetti** et **redevable** ne veulent pas dire la même chose.

Un micro-entrepreneur en franchise en base est **assujetti** à la TVA — il exerce une activité économique dans le champ de la taxe — mais il n'en est pas **redevable** : il ne la facture pas et ne la reverse pas. La mention « TVA non applicable, art. 293 B du CGI » sur tes factures, c'est exactement ça. Elle dit que tu es dans le champ, avec une dispense.

Or la réforme vise les **assujettis**. Pas les redevables.

> Si tu factures aujourd'hui sans TVA avec la mention 293 B, tu es dans le périmètre de la réforme. La franchise ne te sort pas du dispositif — elle ne te dispense que de collecter la taxe.

Le raccourci « pas de TVA sur mes factures = pas concerné » est donc le plus mauvais réflexe possible : il te fait rater l'échéance de réception en croyant l'avoir lue.

## Plateforme agréée n'est pas la même chose que « solution compatible »

Deuxième piège, celui qui coûte de l'argent. Le marché s'est rempli d'outils qui affichent des logos rassurants, et deux statuts très différents circulent sous des noms qui se ressemblent.

Une **plateforme agréée** est un opérateur **immatriculé par la DGFiP**, via un service d'immatriculation dédié, pour une durée de trois ans renouvelable. Seule une plateforme agréée est habilitée à transmettre tes factures vers la plateforme de ton client, à **recevoir des factures pour ton compte**, et à transmettre les données à l'administration.

Une **solution compatible** est un outil de facturation qui sait produire le bon format et dialoguer avec une plateforme agréée — mais qui n'a pas l'immatriculation. Elle n'a donc **pas le droit** de recevoir des factures pour toi. Ton super outil de devis et factures peut très bien être « compatible » et ne pas te mettre en conformité au 1er septembre.

:::warn Le test à faire en deux minutes
Va sur la **liste officielle des plateformes agréées publiée par impots.gouv.fr** et cherche le nom de ton prestataire. S'il n'y est pas, ce n'est pas une plateforme agréée — quoi qu'en dise sa page d'accueil. Deuxième signal, gratuit : un prestataire qui parle encore de « PDP » en août 2026 traîne une doc qui a un an de retard, l'appellation officielle est **plateforme agréée (PA)**.
:::

## Tes clients étrangers ne passent pas par l'e-invoicing — mais par l'e-reporting

Ce point-là est presque absent de la presse généraliste, alors qu'il concerne directement notre métier : chez les devs Angular, le client à Londres, à Berlin ou à Montréal n'est pas une exception, c'est souvent la meilleure mission de l'année.

La facturation électronique obligatoire est un dispositif **franco-français** : elle s'applique aux opérations entre deux entreprises établies en France. Une facture à un client établi hors de France — Union européenne comprise — **n'entre pas** dans l'e-invoicing. Tu continues à l'émettre comme aujourd'hui.

Mais tu ne sors pas du dispositif pour autant : ces opérations relèvent de l'**e-reporting**, la transmission à l'administration des données de transaction qui ne passent pas par une facture électronique. Même chose pour tes ventes à des particuliers, si tu vends une formation ou un template.

> Un freelance qui travaille exclusivement pour des clients étrangers n'a aucune facture électronique à émettre — et reste malgré tout dans le champ de l'e-reporting.

Le calendrier de l'e-reporting suit celui de l'émission : 2026 pour les grandes entreprises et les ETI, **2027 pour les PME, TPE et micro-entreprises**. Concrètement, si tu es 100 % remote pour des boîtes étrangères, ton chantier de 2027 ne sera pas « émettre des factures électroniques », ce sera « déclarer mes transactions ». Ce n'est pas le même outil ni la même conversation avec ton comptable.

## Choisir sa plateforme agréée quand on est dev freelance

Maintenant, la partie utile. Voilà comment je l'aborde, dans cet ordre.

1. **Sépare la décision de réception de celle d'émission.** L'obligation de 2026 est de recevoir. Si tu choisis aujourd'hui l'outil qui portera ton émission de 2027, tu le choisis sous la pression d'une échéance qui n'est pas la bonne, sur un marché qui n'aura pas la même tête dans un an. Prends le minimum viable maintenant, rouvre le sujet à froid.

2. **Vérifie l'immatriculation, pas le marketing.** Le seul critère non négociable : le prestataire figure sur la liste publiée par l'administration. Tout le reste est une préférence.

3. **Regarde si ton outil actuel a une offre agréée.** Beaucoup d'outils de facturation pour indépendants se sont fait immatriculer ou se sont adossés à une plateforme agréée. Si c'est le cas du tien, la migration se réduit souvent à un raccordement — inutile de tout changer.

4. **Refuse l'engagement long.** Une échéance réglementaire est un aimant à offres pressantes et à abonnements de trois ans. Sur une obligation de réception, le besoin réel est modeste ; garde-toi la possibilité de changer en 2027.

5. **Préviens tes clients français.** Ceux qui basculent au 1er septembre vont te demander comment tu réceptionnes. Répondre avant qu'ils posent la question, c'est cinq minutes maintenant contre trois allers-retours dans deux semaines.

:::tip Le droit à l'erreur existe, et il est écrit
L'article 1737 du CGI, dans sa version applicable au 1er septembre 2026, fixe l'amende à **15 € par facture** non émise sous forme électronique, plafonnée à **15 000 € par année civile**. Mais il prévoit aussi que la sanction ne s'applique **pas** en cas de première infraction sur l'année civile en cours et les trois précédentes, dès lors que l'erreur est régularisée spontanément ou dans les **trente jours** d'une première demande de l'administration. Ce n'est pas une raison pour improviser — c'est une raison pour ne pas signer en panique.
:::

## Les trente minutes qui comptent avant le 1er septembre

Si tu ne fais qu'une chose ce week-end : vérifie que tu peux **recevoir**. Concrètement, ça veut dire savoir sur quelle plateforme agréée tu es raccordé, avec quel identifiant tes clients te trouveront, et où tes factures entrantes vont atterrir. C'est tout. Le reste — le format Factur-X, l'archivage, le cycle de vie des statuts — tu l'apprendras en le pratiquant, et surtout tu l'apprendras avec un an d'avance sur ta propre obligation d'émettre.

Si tu prépares en parallèle ton cadre freelance, deux lectures qui se recoupent avec celle-ci : mon guide du [TJM développeur Angular en 2026](/fr/blog/tjm-developpeur-angular-2026), pour savoir ce que tu factures, et le [comparatif des plateformes de mission](/fr/carriere/plateformes), pour savoir à qui. Les trames de mails et la fiche de prépa d'entretien sont dans le [toolkit carrière](/fr/carriere/toolkit).

:::cta Le *guide carrière* NgDigest. | Statuts, TJM, plateformes, entretiens : le parcours complet pour un dev front indépendant en France. | Ouvrir le guide | https://ngdigest.co/fr/carriere/guide
:::

## Ce que je retiens

Ce dossier est moins compliqué qu'il n'en a l'air — il est mal raconté. Deux verbes, deux dates : **recevoir en 2026, émettre en 2027**. Trois pièges qui ne sont pas dans les titres de presse : la franchise de TVA ne te sort pas du périmètre, « compatible » n'est pas « agréée », et tes clients étrangers relèvent de l'e-reporting et non de l'e-invoicing.

Le vrai risque, pour un freelance en 2026, ce n'est pas la réglementation. C'est de payer trois ans d'abonnement pour une obligation qui n'est pas encore la sienne.

---

**Sources** :

- Plateformes agréées, rôle et immatriculation, page mise à jour le 20 janvier 2026 — [impots.gouv.fr](https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees)
- Liste officielle des plateformes agréées immatriculées — [impots.gouv.fr](https://www.impots.gouv.fr/liste-des-plateformes-de-dematerialisation-partenaires-pdp-immatriculees-sous-reserve)
- Guide pratique de démarrage au 1er septembre 2026 (PDF) — [impots.gouv.fr](https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/guide_pratique_facturation_electronique.pdf)
- Je passe à la facturation électronique (e-invoicing et e-reporting) — [impots.gouv.fr](https://www.impots.gouv.fr/professionnel/je-passe-la-facturation-electronique)
- Article 1737 du CGI, version applicable au 1er septembre 2026 (amende de 15 €, plafond 15 000 €, non-application en cas de première infraction régularisée) — [legifrance.gouv.fr](https://www.legifrance.gouv.fr/codes/id/LEGIARTI000053188971/2026-09-01)
- Tout savoir sur la facturation électronique pour les entreprises — [economie.gouv.fr](https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises)
- La facturation électronique obligatoire au 1er septembre 2026 — [urssaf.fr](https://www.urssaf.fr/accueil/actualites/facturation-electronique.html)

*Article rédigé le 22 août 2026. La réglementation et la liste des plateformes agréées évoluent : vérifie les deux dates sur impots.gouv.fr avant toute décision d'achat.*
