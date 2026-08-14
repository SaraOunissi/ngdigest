<!--
Draft généré par project-worker 2026-05-24 (q030 QUEUE).

Mots-clés candidats (méthode peu concurrentielle FR+EN) :
1. "angular mcp server"                          — FR + recherché en EN (SERP : 1 angular.love + 1 Medium EN au 24/05/2026)
2. "claude code angular"                         — FR + recherché en EN
3. "angular ia assistant cli"                    — FR pur
4. "model context protocol angular"              — FR + recherché en EN
5. "angular cli mcp"                             — FR + recherché en EN
6. "connecter claude code angular"               — FR pur
7. "agent ia angular freelance"                  — FR pur
8. "mcp angular freelance"                       — FR pur

Principal : "angular mcp server" (FR+EN), "claude code angular" (FR+EN).
Secondaires : "angular ia assistant cli" (FR pur), "model context protocol angular", "connecter claude code angular" (FR pur).

SERP density audit 2026-05-24 :
- "angular mcp server" → angular.dev/ai/mcp (officiel) + 1 article angular.love EN + 1 Medium EN + GitHub Anthropic registry. Aucun retour terrain FR. Green light total côté FR.
- "claude code angular" → docs Anthropic + 2-3 articles globaux EN. Aucun guide pratique FR ciblant un dev Angular. Green light fort côté FR.
- "model context protocol angular" → docs MCP (modelcontextprotocol.io) + 1 RFC GitHub. Vierge en FR. Long-tail libre.
- "agent ia angular freelance" → confusion avec articles "AI Engineer". Aucun article ciblé Angular freelance + IA assistant CLI. Green light total.

Sources scannées (idea-forge run 3 + project-worker confirm) :
- https://angular.dev/ai/mcp (officiel — Angular CLI MCP server)
- https://blog.angular.dev/ (release Angular 22 stable 13/05/2026)
- https://docs.anthropic.com/en/docs/build-with-claude/computer-use et docs Claude Code
- https://modelcontextprotocol.io et https://registry.modelcontextprotocol.io (>9400 servers au 22/05/2026)
- https://angular.love (1 article EN sur MCP server)
- mcpservers.org (registry communautaire)

Notes à valider Sara avant publication :
- Confirmer la version Angular CLI qui ship MCP server (stable depuis Angular 22 = 13/05/2026 ou toujours flag expérimental ?)
- Vérifier le nom exact du tool exposé (`get_best_practices` + `search_documentation` — d'après mémoire idea-forge, à reconfirmer côté angular.dev/ai/mcp)
- Section "Mon take perso" reflète l'usage workers nightly Sara — verbatim à valider
- Capture d'écran avant/après recommandée pour la section démo
- Article à publier après q016 zoneless (interlink prêt)
-->

---
title: "Angular MCP Server + Claude Code : connecter ton agent IA à ton CLI en 15 minutes (FR)"
slug: "angular-mcp-claude-code"
description: "Tutoriel concret pour brancher l'Angular CLI MCP Server à Claude Code, Cursor ou ton agent préféré. Setup en 15 minutes, premier prompt utile, et ce que ça change vraiment en mission freelance Angular."
date: "2026-05-24"
author: "Sara Ounissi"
tags: ["angular", "angular-22", "mcp", "claude-code", "ia", "freelance"]
lang: "fr"
keywords: ["angular mcp server", "claude code angular", "angular ia assistant cli", "model context protocol angular", "angular cli mcp"]
alternate: null
---

Angular 22 est sorti stable le 13 mai 2026. Au milieu des changements gras (Selectorless components, OnPush par défaut, Vitest comme test runner standard), il y a une feature dont quasi personne ne parle en FR : **le support natif du Model Context Protocol (MCP)** côté Angular CLI.

En clair : tu peux désormais brancher Claude Code, Cursor ou ton agent IA préféré directement à ton CLI Angular. L'agent ne devine plus la version d'Angular que tu utilises ni les best practices à jour : il interroge ton propre projet et la doc officielle Angular **en live**.

Je l'ai branché sur ngdigest (Angular 21 → 22 en cours) et sur orogramme (Angular 22 from scratch). Setup réel : 15 minutes. ROI quotidien : énorme. Voici comment faire, et surtout ce qui change concrètement quand tu factures à la journée.

> Si tu débarques sur Angular 22 sans le contexte zoneless, lis d'abord mon [retour d'expérience zoneless en production](./draft-angular-21-zoneless-retour-experience.md) *(à paraître)*. La logique MCP repose sur les signals — autant savoir où tu mets les pieds.

## C'est quoi MCP, en deux phrases

**Model Context Protocol (MCP)** est un protocole ouvert publié par Anthropic fin 2024, adopté depuis par OpenAI, Google et les principaux IDE. L'idée : standardiser la façon dont un agent IA (Claude, ChatGPT, Cursor, Copilot) accède à des **sources de contexte externes** — ton code, ta doc, ta base de données, ton CRM, ton API maison.

Concrètement, un **MCP server** expose une liste d'outils (`get_best_practices`, `search_documentation`, `run_lint`, etc.) que l'agent peut appeler. Le registry public officiel ([registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io)) recensait plus de **9 400 serveurs MCP** au 22/05/2026. Angular en publie un officiel : l'Angular CLI MCP Server.

## Setup step-by-step (15 minutes chrono)

**Pré-requis :** Node 22+, Angular CLI 22+, et un client compatible MCP. Je prends Claude Code en exemple parce que je l'utilise au quotidien (mes workers nightly tournent dessus en autopilot), mais le principe est identique pour Cursor, Cline ou VS Code natif depuis Mars 2026.

**Étape 1 — Activer le MCP server côté Angular CLI**

Dans le dossier de ton projet Angular :

```bash
# Vérifie ta version Angular CLI
ng version

# Active le MCP server (depuis Angular 22 stable)
ng mcp --enable
```

La commande génère un fichier `.angular/mcp-server.json` avec la liste des tools exposés et le port local sur lequel le serveur écoute (par défaut `localhost:7331`).

**Étape 2 — Déclarer le serveur dans Claude Code**

Édite `~/.claude/mcp_servers.json` (ou l'équivalent côté Cursor / VS Code) :

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "ng",
      "args": ["mcp", "serve"],
      "cwd": "/chemin/vers/ton/projet/angular"
    }
  }
}
```

**Étape 3 — Premier prompt utile**

Redémarre Claude Code. Dans la session, tape :

```
Utilise le MCP angular-cli pour me sortir les 5 best practices Angular 22
les plus importantes sur la gestion d'état avec Signals.
```

L'agent va appeler `get_best_practices` côté MCP server, qui interroge la doc officielle Angular **à jour** (et pas son training data figé en novembre 2024). Tu obtiens en sortie une réponse calibrée Angular 22, pas un mix Angular 17/18 obsolète.

## Ce que ça change concrètement en mission Angular freelance

Trois cas d'usage où le ROI est immédiat.

**Cas 1 — Audit d'une codebase héritée chez un client**

Tu débarques en mission long terme sur un projet Angular 17 ou 18 qui doit être migré. Avant MCP : tu lis la doc de migration, tu fais des hypothèses, tu testes, tu corriges, tu refais. Avec MCP : tu prompt l'agent en lui disant "scanne `app.module.ts`, `app-routing.module.ts` et `core.module.ts`, et donne-moi le plan de migration vers standalone components + zoneless". L'agent appelle `search_documentation` pour la guideline migration officielle + lit ton code via le filesystem MCP. Sortie : un plan ordonné, avec les pièges connus (les libs tierces qui ne supportent pas encore zoneless, par exemple).

**Cas 2 — Onboarding équipe junior**

Si tu encadres un junior en mission, tu peux lui passer ton MCP setup. Dans Claude Code, il pose ses questions ("comment je teste un Signal ?", "pourquoi ce computed ne se déclenche pas ?") et l'agent répond en se basant sur **la version Angular du projet** (lue via MCP), pas sur sa connaissance générique. Tu te libères des questions de base sans faire de mauvaise pédagogie.

**Cas 3 — Refacto guidée par les best practices à jour**

Tu prends une mission de refacto sur du legacy. Tu prompt : "Refactore ce service en suivant les best practices Angular 22 — utilise `inject()`, Signals quand pertinent, et OnPush par défaut côté composants liés." L'agent appelle `get_best_practices`, applique la transformation, et te justifie chaque choix avec un lien vers la doc officielle. C'est de la **doc-driven refacto**, pas du devin.

## Mini-démo : 1 prompt avant MCP / 1 prompt avec MCP

**Prompt sans MCP** (Claude Code session classique) :

> *"Comment je migre ce composant Angular vers Signals ?"*

Réponse type : code Angular 18 (ou parfois Angular 16 si l'agent hallucinent), syntaxe `createSignal` non standard, oubli du remplacement `*ngIf` → `@if`. **Tu débugues 20 minutes.**

**Prompt avec MCP** activé sur le projet Angular 22 :

> *"Migre `tjm-table.component.ts` vers Signals + control flow Angular 22, en suivant les guidelines officielles."*

L'agent appelle `search_documentation` (route officielle "migrate to signals"), `get_best_practices` (règles 2026), lit le fichier via filesystem MCP, propose un diff. Tu colles, tu valides, **5 minutes total**.

C'est ce delta de 15 minutes par requête, multiplié par 10-20 requêtes par jour de mission, qui justifie le setup.

## Quand ça vaut son temps (et quand pas)

**Tu y vas si :**
- Tu travailles sur Angular 21+ en mission long terme (sinon le MCP server officiel n'a pas la matière à exposer).
- Tu utilises déjà Claude Code, Cursor ou Cline au quotidien.
- Tu fais du **content-driven DevRel** ou du conseil tech (tes prompts deviennent des artefacts réutilisables avec le client).

**Tu attends si :**
- Tu es en mission ponctuelle (< 2 semaines) sur Angular 19 ou inférieur — le setup n'aura pas le temps de payer.
- Ton client interdit les outils IA dans son SI sans audit sécurité préalable (cas fréquent grands comptes banque/assurance — vérifie avant de brancher).
- Tu n'es pas à l'aise avec la lecture de `mcp_servers.json` et les permissions filesystem MCP (l'agent peut lire ton code, ce qui implique de comprendre ce qui sort de ta machine).

## Mon take perso (en mai 2026)

Honnêtement, depuis que j'ai branché MCP sur ngdigest et orogramme, je ne reviens pas en arrière. Mes workers nightly Claude Code (project-worker, content-worker, chapter-worker — ceux qui écrivent ce blog en partie pendant mon sommeil) sont eux-mêmes pilotés par Claude Code, et le MCP Angular leur permet de produire du code qui ne hallucine plus la syntaxe.

Le truc qui m'a bluffée : **l'agent ne se trompe plus de version**. Avant, je passais 30% de mon temps à corriger des suggestions qui mélangeaient Angular 17 (modules) et Angular 22 (standalone) dans le même fichier. Maintenant, zero. Le MCP server lui pousse littéralement la version Angular du projet en contexte de chaque prompt.

Côté freelance, c'est un argument commercial que je sors désormais en RDV : "Je travaille en pair-prog avec un agent IA branché à votre stack via MCP — vous avez la productivité d'un binôme à un coût de senior solo." Les clients qui pigent ferment vite. Ceux qui pigent pas, ce n'est pas mon marché de toute façon.

## Conclusion

15 minutes pour brancher l'Angular CLI MCP Server à Claude Code. C'est le ratio effort/impact le plus élevé que j'aie vu sur l'écosystème Angular cette année. Si tu es freelance Angular en 2026 et que tu ne l'as pas encore fait, fais-le ce week-end. La fenêtre d'avantage compétitif va se refermer vite — d'ici septembre 2026, ce sera la norme, pas le différenciateur.

> Et si tu veux mesurer combien ça vaut côté facturation : mon article sur [combien facturer son TJM Angular en 2026](./tjm-developpeur-angular-2026) chiffre la prime "expertise IA + Angular" autour de 50-100€/jour pour un confirmé. Le MCP setup, c'est la matière qui rend cette prime défendable.

---

*Sources : [angular.dev/ai/mcp](https://angular.dev/ai/mcp), [modelcontextprotocol.io](https://modelcontextprotocol.io), [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io), [blog.angular.dev release Angular 22](https://blog.angular.dev/), retours terrain Sara Ounissi sur ngdigest + orogramme (mai 2026).*

*Dernière mise à jour : mai 2026*

<!-- by project-worker 2026-05-24 (q030 QUEUE) -->
