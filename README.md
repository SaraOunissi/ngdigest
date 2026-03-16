# NgDigest

**Angular tech-watch aggregator** — automatically collects, scores, and surfaces the best Angular resources from across the web.

🌐 **Live at [ngdigest.co](https://ngdigest.co)**

---

## What it does

NgDigest runs a content pipeline every 12 hours, pulling articles, tutorials, and announcements from multiple sources, scoring each result for relevance, and presenting them in a clean bilingual (FR/EN) interface.

**Relevance scoring system (0–6 pts)**
- `+3` — domain is in the curated whitelist (48 trusted sources)
- `+2` — title contains Angular-related keywords (20 signal words)
- `+1` — published within the last 7 days

Only resources scoring ≥ 3 are stored and surfaced.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, Signals, @ngx-translate, SCSS (BEM) |
| Backend | NestJS 11, Mongoose, Clean Architecture (DDD) |
| Database | MongoDB Atlas |
| Aggregation | **SerpApi** (Google Search + News), Dev.to API, RSS Parser |
| Deployment | Railway (API) · Vercel (Frontend) |
| Domain | Namecheap → ngdigest.co |

---

## Monorepo structure

```
ngdigest/
├── ngdigest-front/          # Angular 21 application
│   └── src/app/
│       ├── core/            # Singleton services, guards, interceptors
│       ├── shared/          # Reusable components, pipes, directives
│       └── features/        # Domain-driven feature modules
│           └── resources/
│               ├── domain/
│               ├── application/
│               ├── infrastructure/
│               └── presentation/
├── ngdigest-back/           # NestJS 11 REST API
│   └── src/
│       ├── config/          # App configuration (database, env)
│       ├── common/          # Decorators, filters, interceptors, pipes
│       └── modules/
│           ├── resources/   # Resource management
│           ├── aggregator/  # Content collection pipeline
│           └── sources/     # Source whitelist & suggestions
└── docs/                    # Architecture documentation
```

---

## SerpApi integration

NgDigest uses [SerpApi](https://serpapi.com) to run 3 parallel Google Search queries per aggregation cycle:

```
"Angular expert blogs"        → expert community content
"Angular community news"      → ecosystem announcements
"Angular tutorials fr"        → French-language resources
```

Each query uses `tbs=qdr:w` (past week) with dynamic year injection to maximize signal-to-noise ratio. Results are deduplicated by URL and run through the relevance scoring pipeline before storage.

→ See [`ngdigest-back/README.md`](./ngdigest-back/README.md) for implementation details.

---

## Getting started

See individual READMEs:
- [`ngdigest-front/README.md`](./ngdigest-front/README.md) — Angular frontend setup
- [`ngdigest-back/README.md`](./ngdigest-back/README.md) — NestJS backend setup

---

## Features

- ✅ Real-time search with debounce (300ms)
- ✅ Infinite scroll with pagination
- ✅ Relevance score badge + tooltip on each card
- ✅ Full FR/EN i18n (74 translation keys)
- ✅ SEO — dynamic meta, og:tags, hreflang, sitemap.xml
- ✅ Angular version banner (live from GitHub API)
- ✅ Source suggestion form
- ✅ Automatic aggregation cron (every 12h)
- ✅ Weekly retention cleanup (soft-delete by score/age)

---

## Development

Built with [Claude Code](https://claude.ai/code) as AI-assisted development tooling — used for scaffolding and code review, with full architecture ownership.
