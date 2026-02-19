# Architecture DDD / Clean Architecture

NgDigest suit une architecture **Domain-Driven Design (DDD)** combinée aux principes de **Clean Architecture**. Cette approche sépare clairement les responsabilités et facilite la maintenabilité, la testabilité et l'évolution du code.

## Principes fondamentaux

1. **Séparation des préoccupations** : chaque couche a un rôle unique et bien défini
2. **Dépendances orientées vers le domaine** : les couches externes dépendent des couches internes, jamais l'inverse
3. **Indépendance du framework** : le domaine métier ne dépend ni d'Angular, ni de NestJS, ni de Mongoose

## Organisation par feature (Bounded Context)

Chaque fonctionnalité métier est isolée dans son propre dossier sous `features/` (frontend) ou `modules/` (backend), avec quatre couches :

```
features/<context>/
├── domain/            # Coeur métier
├── application/       # Orchestration
├── infrastructure/    # Détails techniques
└── presentation/      # Interface utilisateur / API
```

## Les quatre couches

### 1. Domain (Domaine)

Le coeur métier de l'application. Ne dépend d'aucune librairie externe.

| Élément            | Description                                   |
| ------------------ | --------------------------------------------- |
| **Entities**       | Objets métier avec identité (ex : `Resource`) |
| **Value Objects**  | Objets immuables sans identité (ex : `Url`)   |
| **Interfaces**     | Contrats des repositories et services          |

```
domain/
├── entities/         # Classes métier
└── interfaces/       # Interfaces (repository, services)
```

### 2. Application

Orchestre les cas d'utilisation. Contient la logique applicative sans détails techniques.

| Élément          | Description                                        |
| ---------------- | -------------------------------------------------- |
| **Use Cases**    | Actions métier (ex : `CreateResource`, `FetchFeed`) |
| **State**        | Gestion d'état côté frontend (stores, signals)      |
| **Guards**       | Logique d'autorisation                              |
| **Strategies**   | Stratégies d'authentification (Passport)            |

```
application/
├── use-cases/        # Cas d'utilisation / services applicatifs
├── guards/           # Guards d'autorisation (backend)
└── strategies/       # Stratégies Passport (backend)
```

### 3. Infrastructure

Implémente les détails techniques : accès aux données, APIs, mappeurs.

| Élément            | Description                                       |
| ------------------ | ------------------------------------------------- |
| **Repositories**   | Implémentation des interfaces du domaine           |
| **Schemas**        | Schémas Mongoose (backend)                         |
| **API Services**   | Appels HTTP vers le backend (frontend)             |
| **Mappers**        | Conversion entre DTOs, schémas et entités          |

```
infrastructure/
├── repositories/     # Implémentation des repositories
├── schemas/          # Schémas Mongoose
└── mappers/          # Transformation de données
```

### 4. Presentation

Interface utilisateur (frontend) ou points d'entrée API (backend).

| Élément          | Description                                |
| ---------------- | ------------------------------------------ |
| **Components**   | Composants Angular (frontend)              |
| **Controllers**  | Endpoints REST (backend)                   |
| **DTOs**         | Objets de transfert pour validation (backend) |
| **Pages**        | Composants de page / smart components       |

```
presentation/
├── components/       # Composants UI (frontend)
├── controllers/      # Contrôleurs REST (backend)
└── dto/              # Data Transfer Objects (backend)
```

## Flux de données

### Backend (requête HTTP entrante)

```
Controller (Presentation)
  → Use Case (Application)
    → Repository Interface (Domain)
      → Repository Implementation (Infrastructure)
        → Mongoose Schema → MongoDB
```

### Frontend (action utilisateur)

```
Component (Presentation)
  → State / Use Case (Application)
    → API Service (Infrastructure)
      → HTTP → Backend API
```

## Dossiers transversaux

### Frontend

| Dossier     | Rôle                                                  |
| ----------- | ----------------------------------------------------- |
| `core/`     | Services singleton, guards, interceptors HTTP          |
| `shared/`   | Composants, pipes et directives réutilisables          |

### Backend

| Dossier     | Rôle                                                  |
| ----------- | ----------------------------------------------------- |
| `config/`   | Configuration (database, auth)                         |
| `common/`   | Decorators, filters, interceptors, pipes globaux       |

## Règles à respecter

1. **Le domaine ne doit jamais importer** depuis `infrastructure/` ou `presentation/`
2. **Les use cases** consomment uniquement les interfaces définies dans `domain/`
3. **Les composants réutilisables** vont dans `shared/`, pas dans un feature
4. **Un feature ne doit pas importer directement** depuis un autre feature : passer par `shared/` ou `core/`
