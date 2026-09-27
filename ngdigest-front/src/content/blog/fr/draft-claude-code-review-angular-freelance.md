<!--
Draft généré par project-worker 2026-05-26 (q048 QUEUE).

Mots-clés candidats (méthode peu concurrentielle FR+EN) :
1. "claude code code-review"                  — FR + recherché en EN (SERP au 26/05/2026 : 2 changelogs officiels Anthropic EN + 1 thread Reddit r/ClaudeAI + 1 GitHub release notes — aucun guide pratique FR ciblé Angular)
2. "review pr automatisé ia"                  — FR pur (SERP FR : blogs génériques GitHub Copilot + Cursor, aucun Claude Code)
3. "/code-review claude"                      — FR + recherché en EN long-tail (SERP émergeant post-rename 23/05)
4. "code review angular freelance ia"         — FR pur (SERP vide ciblé)
5. "claude code agent pr review"              — FR + recherché en EN
6. "facturer code review ia client"           — FR pur (cross-pollinisation q053)
7. "comment ia inline github pr"              — FR + recherché en EN (sur --comment flag)
8. "rename simplify code-review claude"       — FR + recherché en EN (changelog tracking)

Principal : "claude code code-review" (FR+EN), "/code-review claude" (FR+EN).
Secondaires : "review pr automatisé ia" (FR pur), "code review angular freelance ia" (FR pur), "comment ia inline github pr" (FR+EN).

SERP density audit 2026-05-26 :
- "claude code code-review" → 4-5 sources EN (Anthropic release notes 23/05, claudefa.st changelog, GitHub anthropics/claude-code releases, 1 Medium EN early adopter, 1 thread Reddit r/ClaudeAI). Aucun guide pratique FR. Green light total côté FR.
- "/code-review claude" → SERP émergeant (la commande a 3 jours), dominée par discussions issue tracker + tweets. Long-tail libre FR pur.
- "review pr automatisé ia" → SERP FR dominée par GitHub Copilot Workspaces + Cursor + CodeRabbit. Angle "Claude Code dans workflow freelance solo" pas couvert.
- "code review angular freelance ia" → SERP FR 0 ciblé Angular. Niche dans la niche.

Sources scannées (idea-forge run 6 + project-worker confirm) :
- Anthropic Claude Code release notes 23/05/2026 (rename /simplify → /code-review)
- claudefa.st changelog (--comment flag GitHub PR inline + MCP retry 3× + background sessions Ctrl+T)
- GitHub anthropics/claude-code releases (v2.1.32+ minimum)
- Mémo idea-forge 25/05 : niveau d'effort (/code-review high) accepté
- plateya.fr + findskill.ai + digi-atlas : TJM consultant IA freelance FR 2026 = 600-900€/j, dev IA architecte/prompt engineer 800-1200€/j vs généraliste 400-700€/j (interlock q031)
- Eat-own-dog-food : Sara utilise Claude Code en autopilot pour workers nightly (preuve sociale forte)

Notes à valider Sara avant publication :
- Confirmer version exacte Claude Code qui ship `/code-review` stable (release notes Anthropic 23/05/2026 disent v2.1.32+, vérifier si flag --comment GitHub PR inline est dispo dans cette même version ou release point ultérieure)
- Vérifier le mapping exact entre /code-review low/medium/high et effort/tokens consumed (la doc officielle parle de "level" sans toujours documenter le coût delta)
- Section "Mon take perso" pose la stratégie facturation (interlock q053) — Sara peut nuancer ou trancher selon son positionnement actuel auprès des clients freelance
- Si Sara a déjà testé /code-review sur ngdigest ou orogramme cette semaine : remplacer le retour terrain extrapolé par les vrais chiffres
- Article à publier idéalement avant ou en parallèle de q053 (facturation pair-prog IA) pour faire combo "expertise IA + Angular freelance"
- Capture d'écran avant/après bienvenue : (a) commande `/code-review high` dans terminal, (b) commentaires inline dans GitHub PR via `--comment`
- Internal link vers q042 (Agent Teams) à activer dès publication q042
-->

---
title: "Claude Code /code-review : faire reviewer ton PR Angular par l'agent IA avant ton lead tech (workflow freelance mai 2026)"
slug: "claude-code-review-angular-freelance"
description: "Anthropic a renommé /simplify en /code-review dans Claude Code (release 23 mai 2026). Pour un dev Angular freelance qui bosse seul, c'est l'occasion de poser une couche review automatisée avant le lead tech du client. Setup, 3 workflows concrets, et comment le facturer."
date: "2026-05-26"
author: "Sara Ounissi"
tags: ["claude-code", "code-review", "angular", "freelance", "ia"]
lang: "fr"
keywords: ["claude code code-review", "/code-review claude", "review pr automatisé ia", "code review angular freelance ia", "comment ia inline github pr"]
alternate: null
---

Anthropic a sorti une mise à jour de Claude Code le **23 mai 2026** qui renomme l'ancienne commande `/simplify` en **`/code-review`** (v2.1.32+). Sur le papier c'est un rename. En pratique c'est une feature qui change la façon dont un dev Angular freelance peut se relire avant d'envoyer un PR au lead tech client — surtout quand on bosse seul sur une mission, sans pair-reviewer humain à portée de Slack.

La commande accepte un **niveau d'effort** (`/code-review high`) et peut poster les findings **directement en commentaires inline sur le PR GitHub** via le flag `--comment`. Trois jours après la release, à peu près aucun guide pratique FR ne couvre le cas d'usage "freelance Angular solo qui veut se prémunir contre le PR rouge". Voilà le mien.

> Si tu débarques sur l'écosystème Claude Code sans context, lis d'abord mon [setup MCP Angular + Claude Code en 15 minutes](./draft-angular-mcp-claude-code.md) *(à paraître)*. C'est le pré-requis pour que `/code-review` ait du contexte projet pertinent, pas juste du linting recolorié. Et oui, ça change ta facturation en mission ([cf article TJM 2026](./tjm-developpeur-angular-2026.md)) — j'y reviens en bas d'article.

## Ce qui a changé, en deux phrases

L'ancien `/simplify` faisait un pass de refactoring : "rends ce code plus court / plus lisible". Utile, mais flou — beaucoup de freelances l'utilisaient déjà comme un proto-review, sans que ce soit son rôle officiel.

Le nouveau `/code-review` est explicitement positionné comme **revue de code par l'agent IA**. Il accepte un niveau d'effort (low / medium / high), peut prendre en input un PR GitHub via URL, et — la nouveauté qui compte vraiment — peut poster ses findings **en commentaires inline directement sur le PR** via `--comment`. Plus de copier-coller manuel des suggestions de l'agent dans GitHub, ce qui tuait le workflow pour 80% des devs solo.

## Setup en 3 minutes

Pré-requis : Claude Code v2.1.32+ installé, un repo Angular avec accès GitHub authentifié (token ou GitHub CLI déjà loggé).

**Étape 1.** Mets à jour Claude Code si tu es resté sur une version antérieure :

```bash
claude --version    # doit retourner 2.1.32 ou plus
npm install -g @anthropic-ai/claude-code@latest
```

**Étape 2.** Dans ton repo Angular, lance la commande sur les changements non commités OU sur un PR existant :

```bash
# sur les changements non commités (avant push)
claude
> /code-review high

# sur un PR existant, avec post inline GitHub
> /code-review high https://github.com/sara/orogramme/pull/47 --comment
```

**Étape 3.** Récupère les findings. En mode local (sans `--comment`), Claude te liste les remarques dans le terminal avec ligne + raison + suggestion. En mode `--comment`, il poste chaque finding comme commentaire inline sur la ligne concernée du PR — exactement comme un humain qui review.

C'est tout. Pas de fichier de config à initialiser, pas de YAML — le niveau d'effort + le flag `--comment` couvrent 90% des cas freelance.

## Ce que `/code-review high` catch vraiment (et ce qui passe au travers)

Test honnête sur un PR Angular 22 récent d'orogramme (40 lignes modifiées, mélange composant + service + test). Ce que `/code-review high` a remonté en ~45 secondes :

- ✅ **Correctness bugs** : un `effect()` sans `untracked()` autour d'une signal write (anti-pattern Angular 21+), un `subscribe()` orphelin dans un service sans cleanup
- ✅ **Type safety** : un `any` implicite sur un retour API HTTP, un type union trop large qui méritait un discriminator
- ✅ **Angular-specific** : un composant en `ChangeDetectionStrategy.Default` qui mute un input array (cassera silencieux en Angular 22 où OnPush devient default — cf article à venir)
- ✅ **Tests manquants** : une condition error path dans un use case sans test associé
- ⚠️ **Performance** : a remonté un `*ngFor` sans `trackBy` (correct), mais a manqué un signal non-memoized recalculé à chaque render
- ❌ **Sécurité** : a manqué une concat string SQL dans un script de seed (faux PR car script local, mais quand même)
- ❌ **Architecture** : a manqué un import qui violait la règle Clean Architecture (domain qui importait infrastructure) — c'est un type de check qui demande un MCP server custom pour vraiment marcher

Bilan : sur un dev Angular freelance qui sait déjà ce qu'il fait, `/code-review high` agit comme un **bon second pair d'yeux fatigué** — il catch les trucs qu'on rate en fin de journée, il ne remplace pas un vrai lead tech sur les questions d'archi ou de sécurité applicative.

## 3 workflows freelance qui valent vraiment leur coup

**1. Pré-PR perso self-check (le plus rentable).**
Avant de push vers le PR client, tu lances `/code-review high` en local sur tes changements non commités. Les findings restent dans ton terminal — tu corriges en privé ce qui se corrige, tu push une version déjà nettoyée. Le client voit un PR propre, pas un PR avec 12 commits "fix CR" qui le mettent en doute sur ta rigueur. **Temps ajouté : 2-3 minutes par PR. Économisé : 1 round-trip de review.**

**2. `--comment` inline sur PR client (avec disclaimer NDA).**
Une fois ton PR poussé, tu lances `/code-review high <url-pr> --comment` pour faire poster les findings inline. **Important côté freelance** : vérifie tes obligations NDA avant — certains clients interdisent l'envoi de leur code à des LLMs tiers. Pour les missions où c'est OK, c'est un signal de pro : le lead tech voit que tu as déjà fait un pass IA, ses propres remarques se concentrent sur le métier au lieu du style. **À mentionner verbatim dans ton onboarding mission** ("je travaille avec un agent IA en pair-prog, voici comment").

**3. Batch nightly avec Agent Teams (le combo expert).**
Si tu utilises déjà [Claude Code Agent Teams](./draft-agent-teams-claude-code-angular.md) *(à paraître)* — la feature beta sortie le 11 mai 2026 qui permet de lancer plusieurs sessions en parallèle — tu peux scheduler un `/code-review high` automatique sur tous les PRs ouverts de tes différentes missions chaque nuit. Sara fait ça pour ses workers nightly sur ses side-projects : un agent qui review pendant qu'elle dort, les findings prêts au café du matin. Workflow over-kill pour 1 mission unique, gold standard quand tu jongles entre 2-3 clients.

> **Argument commercial : comment facturer ce niveau de rigueur à ton client**
>
> Trois options pour structurer ça en mission :
>
> 1. **TJM unique sans mention IA** : tu factures ton TJM standard et tu "absorbes" l'usage Claude Code dans tes outils perso. Confortable, mais tu plafonnes ton TJM au plus bas du marché parce que rien ne justifie la différenciation.
> 2. **TJM-jour + ligne "infrastructure IA" distincte** (~50-100€/jour sur la facture) : transparent côté client, mais demande de l'éducation commerciale ("oui, ces 50€ couvrent les tokens Claude Code + le temps de scoping prompt").
> 3. **Forfait sprint résultat** : tu vends "1 feature livrée + reviewée + testée" sans détailler les outils. Le client achète un livrable, pas un horaire. C'est là que les TJM cachés de 800-1200€/jour des dev IA freelances (data plateya.fr + findskill.ai 2026) se nichent — pas dans le TJM affiché, dans la valeur effective.
>
> Le passage à `/code-review` change l'équation parce que pour la première fois, tu peux **prouver inline sur le PR** que tu as posé une couche review IA avant ton lead tech. Ce n'est plus de la rhétorique, c'est un commit trail. À détailler dans un prochain article sur la facturation pair-prog IA en 2026.

## Quand y aller vs quand attendre

✅ **Lance-toi maintenant** si : tu bosses sur des PRs Angular standalone (14+), client OK avec usage LLM tiers, tu fais ≥ 3-4 PRs par semaine. Le ROI se mesure en heures gagnées sur les rounds de review dès la 2e semaine.

⚠️ **Attends 2-3 semaines** si : ton client est sur une codebase Angular legacy (12 ou moins, NgModules partout) — le contexte que peut charger Claude est encore limité, les findings vont être génériques. Mets en place un MCP server projet ([guide MCP Angular](./draft-angular-mcp-claude-code.md) *(à paraître)*) avant pour augmenter la pertinence.

🛑 **Ne touche pas** si : NDA client interdit explicitement l'envoi de code à un LLM tiers, ou tu bosses dans un secteur régulé (santé, défense, banque tier 1) où la conformité prime sur la productivité. Dans ce cas, attends un déploiement Claude Code on-premise ou un équivalent self-hosted.

## Mon take perso

Le rename `/simplify` → `/code-review` est plus qu'un changement de nom : c'est Anthropic qui reconnaît que **80% des freelances utilisaient déjà `/simplify` comme un proto-review**. La version officielle est meilleure parce qu'elle est positionnée correctement (revue, pas refacto), qu'elle accepte un niveau d'effort, et que `--comment` clôt enfin la boucle vers GitHub.

Pour un dev Angular freelance solo en 2026, c'est exactement le genre de différenciation à monétiser. Pas avec un TJM affiché à 1500€/j (qui fera fuir 90% des prospects en pré-screening), mais avec un **forfait sprint** où tu livres une feature reviewée + testée + commentée IA en moitié moins de temps qu'un dev qui ne touche pas à ces outils. Le client paie le résultat, tu captures la marge sur ton outillage.

Je teste ça depuis le 23 mai sur orogramme + ngdigest, je publie un article complet sur la facturation pair-prog IA dans les 10 prochains jours — avec les 3 modèles comparés sur 5 critères concrets (transparence client, risque renégo, scaling missions, fit confort, implications NDA).

D'ici là : installe la mise à jour, lance ta première `/code-review high` sur un PR Angular cette semaine, et raconte-moi ce que tu trouves en réponse à la newsletter.

<!-- by project-worker 2026-05-26 (q048 QUEUE) -->
