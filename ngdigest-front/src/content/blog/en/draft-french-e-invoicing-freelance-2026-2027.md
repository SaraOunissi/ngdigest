---
title: "French E-Invoicing 2026-2027: What a Freelance Developer Actually Has to Do by 1 September"
slug: "french-e-invoicing-freelance-2026-2027"
description: "On 1 September 2026 you must be able to receive. Issuing comes on 1 September 2027. Two verbs, two dates — and four traps the French tech press keeps getting wrong: the VAT exemption, the \"compatible solution\" that isn't approved, foreign clients, and the written right to make a mistake."
date: "2026-08-22"
author: "Sara Ounissi"
tags: ["freelance", "admin", "invoicing", "france"]
lang: "en"
alternate: "facture-electronique-freelance-2026-2027"
highlight: { value: "2026 / 2027", label: "receive first, issue later" }
---

<!-- by project-worker 2026-08-22 (q179) — corrected scope validated by Sara on 2026-08-21 (BLOCKERS B10) -->

A client wrote to me in late July: "I'm switching to electronic invoicing in September, are you ready?" I said yes before checking, then spent the evening reading articles that all got the same thing wrong. Half of them announced that freelancers would have to **issue** electronic invoices from 1 September 2026. That is false. And the mistake costs more than a misunderstanding: it pushes independent workers into panic-buying a subscription for an obligation that isn't theirs yet.

Here is what the rules actually say, what applies to you as an independent developer, and the four points where almost everyone gets it wrong.

## Two verbs, two dates: that's the whole reform

The reform is really two separate obligations, one year apart.

**From 1 September 2026**, every business established in France and subject to VAT must be able to **receive** an electronic invoice. That requires being connected to an **approved platform** (*plateforme agréée*): it receives your supplier's invoice and hands it to you. That is the only deadline that concerns you in ten days.

**From 1 September 2027**, the obligation to **issue** arrives for SMEs, very small businesses and micro-enterprises — which covers the overwhelming majority of freelance developers. Large companies and mid-caps start issuing in 2026, and that is precisely why you need to be able to receive a year before you need to issue. Your biggest clients switch first, and you sit at the end of the chain.

:::keyfigures The calendar, without the fog
- gold | 01/09/2026 | Receive — every business subject to French VAT
- neutral | 01/09/2026 | Issue — large companies and mid-caps only
- good | 01/09/2027 | Issue — SMEs, very small businesses, micro-enterprises
:::

Keep the phrasing: **receive in 2026, issue in 2027**. Any article claiming "freelancers must invoice electronically from September 2026" has merged two different rows of that table.

## "I'm VAT-exempt, so this doesn't apply to me" — it does

This is the mistake I hear most often, and it comes from a genuinely confusing piece of tax vocabulary: being **subject to** VAT and being **liable for** VAT are not the same thing.

A micro-entrepreneur under the French *franchise en base* regime is **subject to** VAT — they carry out an economic activity within the scope of the tax — but they are not **liable for** it: they neither charge it nor remit it. The line "TVA non applicable, art. 293 B du CGI" on your invoices says exactly that. You are inside the scope, with an exemption from collecting.

The reform targets businesses **subject to** VAT. Not those liable for it.

> If you invoice without VAT today under the 293 B exemption, you are inside the scope of the reform. The exemption doesn't remove you from the system — it only spares you from collecting the tax.

So the shortcut "no VAT on my invoices means it doesn't concern me" is the worst possible reflex: it makes you miss the receiving deadline while believing you have read it.

## An approved platform is not the same as a "compatible solution"

The second trap is the one that costs money. The market has filled up with tools displaying reassuring badges, and two very different statuses circulate under names that look alike.

An **approved platform** is an operator **registered by the French tax administration (DGFiP)**, through a dedicated registration service, for a renewable three-year term. Only an approved platform is authorised to transmit your invoices to your client's platform, to **receive invoices on your behalf**, and to pass the data on to the administration.

A **compatible solution** is an invoicing tool that can produce the right format and talk to an approved platform — but holds no registration. It therefore has **no right** to receive invoices for you. Your favourite quoting-and-invoicing tool may well be "compatible" and still leave you non-compliant on 1 September.

:::warn A two-minute test
Open the **official list of approved platforms published on impots.gouv.fr** and search for your provider's name. If it isn't there, it is not an approved platform, whatever its homepage says. A second free signal: a provider still saying "PDP" in August 2026 is running documentation a year out of date — the official term is now **plateforme agréée (PA)**.
:::

## Foreign clients fall outside e-invoicing — and inside e-reporting

This point is nearly absent from the general press, yet it goes straight to our line of work: for Angular developers, a client in London, Berlin or Montreal is not an exception, it is often the best contract of the year.

Mandatory electronic invoicing is a **domestic French** scheme: it applies to transactions between two businesses established in France. An invoice to a client established outside France — the European Union included — is **not** covered by e-invoicing. You keep issuing it the way you do today.

That does not put you outside the system, though. Those transactions fall under **e-reporting**: transmitting transaction data to the administration when it doesn't travel through an electronic invoice. The same applies to sales to individuals, if you sell a course or a template.

> A freelancer working exclusively for foreign clients has no electronic invoice to issue at all — and still sits within the scope of e-reporting.

The e-reporting calendar follows the issuing one: 2026 for large companies and mid-caps, **2027 for SMEs, very small businesses and micro-enterprises**. In practice, if you are fully remote for foreign companies, your 2027 project is not "issue electronic invoices", it is "report my transactions". Different tool, different conversation with your accountant.

## Choosing an approved platform as a freelance developer

Now the useful part. Here is how I approach it, in this order.

1. **Separate the receiving decision from the issuing one.** The 2026 obligation is to receive. If you pick today the tool that will carry your 2027 invoicing, you are choosing it under the pressure of the wrong deadline, on a market that will look different in a year. Take the minimum viable option now, reopen the question calmly later.

2. **Check the registration, not the marketing.** The one non-negotiable criterion: the provider appears on the list published by the administration. Everything else is a preference.

3. **See whether your current tool has an approved offering.** Many invoicing tools for independents have either registered themselves or partnered with an approved platform. If yours has, migration often comes down to a connection — no need to change everything.

4. **Refuse long commitments.** A regulatory deadline is a magnet for urgent offers and three-year subscriptions. For a receiving obligation, the real need is modest; keep the option to switch in 2027.

5. **Warn your French clients.** The ones switching on 1 September will ask how you receive invoices. Answering before they ask costs five minutes now instead of three rounds of email in two weeks.

:::tip The right to make a mistake exists, in writing
Article 1737 of the French tax code, in the version applicable from 1 September 2026, sets the fine at **€15 per invoice** not issued electronically, capped at **€15,000 per calendar year**. But it also states that the penalty does **not** apply to a first offence during the current calendar year and the three preceding ones, provided the error is corrected spontaneously or within **thirty days** of a first request from the administration. That is not a reason to improvise — it is a reason not to sign anything in a panic.
:::

## The thirty minutes that matter before 1 September

If you do only one thing this weekend: check that you can **receive**. Concretely, that means knowing which approved platform you are connected to, which identifier your clients will use to find you, and where your incoming invoices will land. That's it. The rest — the Factur-X format, archiving, invoice lifecycle statuses — you will learn by doing, and you will learn it a full year ahead of your own obligation to issue.

If you are building your freelance setup in parallel, two pieces that overlap with this one: my guide to the [Angular developer daily rate in 2026](/en/blog/angular-developer-daily-rate-2026), to know what you charge, and the [comparison of contracting platforms](/en/career/platforms), to know who you charge. Email templates and the interview prep sheet live in the [career toolkit](/en/career/toolkit).

:::cta The NgDigest *career guide.* | Legal status, rates, platforms, interviews: the full path for an independent front-end developer in France. | Open the guide | https://ngdigest.co/en/career/guide
:::

## What I take away from it

This file is less complicated than it looks — it is just badly told. Two verbs, two dates: **receive in 2026, issue in 2027**. Three traps that never make the headlines: the VAT exemption does not remove you from the scope, "compatible" is not "approved", and foreign clients fall under e-reporting rather than e-invoicing.

For a freelancer in 2026, the real risk isn't the regulation. It's paying for three years of a subscription to cover an obligation that isn't yours yet.

---

**Sources** :

- Approved platforms, role and registration, page updated 20 January 2026 — [impots.gouv.fr](https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees)
- Official list of registered approved platforms — [impots.gouv.fr](https://www.impots.gouv.fr/liste-des-plateformes-de-dematerialisation-partenaires-pdp-immatriculees-sous-reserve)
- Practical getting-started guide for 1 September 2026 (PDF) — [impots.gouv.fr](https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/guide_pratique_facturation_electronique.pdf)
- Moving to electronic invoicing (e-invoicing and e-reporting) — [impots.gouv.fr](https://www.impots.gouv.fr/professionnel/je-passe-la-facturation-electronique)
- Article 1737 of the French tax code, version applicable from 1 September 2026 (€15 fine, €15,000 cap, no penalty for a corrected first offence) — [legifrance.gouv.fr](https://www.legifrance.gouv.fr/codes/id/LEGIARTI000053188971/2026-09-01)
- Everything about electronic invoicing for businesses — [economie.gouv.fr](https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises)
- Mandatory electronic invoicing from 1 September 2026 — [urssaf.fr](https://www.urssaf.fr/accueil/actualites/facturation-electronique.html)

*Written on 22 August 2026. The rules and the list of approved platforms keep evolving: check both dates on impots.gouv.fr before making any purchase decision.*
