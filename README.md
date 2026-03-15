# NgDigest

Plateforme d'agrégation et de veille technologique pour la communauté Angular. NgDigest collecte automatiquement des ressources (articles, vidéos, tutoriels) depuis diverses sources et les présente dans une interface moderne.

## Stack technique

| Couche     | Technologie                              |
| ---------- | ---------------------------------------- |
| Frontend   | Angular 21, SCSS (BEM), Angular Material |
| Backend    | NestJS 11, Mongoose, Passport JWT        |
| Base de données | MongoDB Atlas                       |
| Agrégation | NestJS Schedule (cron), Dev.to API, SerpAPI (Google Search), RSS Parser |

## Structure du monorepo

```
ngdigest/
├── ngdigest-front/          # Application Angular (frontend)
│   └── src/app/
│       ├── core/            # Services singleton, guards, interceptors
│       ├── shared/          # Composants, pipes et directives réutilisables
│       └── features/        # Modules métier (DDD)
│           └── resources/
│               ├── domain/
│               ├── application/
│               ├── infrastructure/
│               └── presentation/
├── ngdigest-back/           # API NestJS (backend)
│   └── src/
│       ├── config/          # Configuration (auth, database)
│       ├── common/          # Decorators, filters, interceptors, pipes
│       └── modules/
│           ├── resources/   # Gestion des ressources
│           ├── auth/        # Authentification JWT
│           └── aggregator/  # Collecte automatique de contenu
└── docs/                    # Documentation du projet
```

## Installation

### Prérequis

- Node.js >= 18
- npm
- Un cluster MongoDB Atlas (voir [docs/MONGODB_SETUP.md](docs/MONGODB_SETUP.md))

### Backend

```bash
cd ngdigest-back
npm install
cp .env.example .env
# Configurer les variables dans .env (MONGODB_URI, JWT_SECRET)
npm run start:dev
```

Le serveur API démarre sur `http://localhost:3000` avec le préfixe `/api`.

### Frontend

```bash
cd ngdigest-front
npm install
ng serve
```

L'application démarre sur `http://localhost:4200`.

## Documentation

- [Configuration MongoDB Atlas](docs/MONGODB_SETUP.md)
- [Architecture DDD/Clean](docs/ARCHITECTURE.md)
