# Collecte et utilisation des données de recherche

Ce document décrit comment les données de recherche sont collectées, stockées et utilisées dans l'application.

## Cycle de vie des données de recherche

1. **Collecte** : Lorsqu'un utilisateur effectue une recherche sur le site
2. **Stockage** : Les données sont enregistrées dans la base de données
3. **Traitement** : Les données peuvent être agrégées et analysées
4. **Utilisation** : Les données sont utilisées pour améliorer l'expérience utilisateur et générer des rapports
5. **Exportation** : Les administrateurs peuvent exporter les données pour une analyse externe

## Schéma de données

Les recherches sont stockées dans deux tables principales :

### Table `Search`

Stocke les pages de recherche personnalisées (termes de recherche pour lesquels nous avons créé une page spécifique).

```sql
CREATE TABLE "Search" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "keyword" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "seoTitle" TEXT,
  "metaDescription" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "searchCount" INTEGER NOT NULL DEFAULT 0,
  "lastSearchedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
```

### Table `SearchData`

Enregistre chaque terme de recherche saisi par les utilisateurs.

```sql
CREATE TABLE "SearchData" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "searchId" TEXT,
  "term" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "lastSearchedAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SearchData_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "Search" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
```

## Points d'API

### Récupération des données de recherche

- **Endpoint**: `/api/admin/search/data`
- **Méthode**: `GET`
- **Authentification**: Requise (cookie `admin_session`)
- **Paramètres de requête**:
  - `timeRange`: Filtrer par période (`today`, `week`, `month`, `year`, ou `all` par défaut)
- **Réponse**: Liste des termes de recherche avec statistiques

### Enregistrement d'un terme de recherche

- **Endpoint**: `/api/admin/search/data`
- **Méthode**: `POST`
- **Authentification**: Requise (cookie `admin_session`)
- **Corps de la requête**:
  ```json
  {
    "term": "terme de recherche"
  }
  ```
- **Comportement**:
  - Si le terme existe déjà, incrémente le compteur
  - Sinon, crée une nouvelle entrée
- **Réponse**: Données du terme de recherche mis à jour ou créé

### Exportation des données de recherche

- **Endpoint**: `/api/admin/search/data/export`
- **Méthode**: `GET`
- **Authentification**: Requise (cookie `admin_session`)
- **Paramètres de requête**:
  - `timeRange`: Filtrer par période (`today`, `week`, `month`, `year`, ou `all` par défaut)
- **Réponse**: Fichier CSV contenant les données de recherche

## Gestion des pages de recherche personnalisées

### Récupération des pages de recherche

- **Endpoint**: `/api/admin/search/pages`
- **Méthode**: `GET`
- **Authentification**: Requise (cookie `admin_session`)
- **Réponse**: Liste des pages de recherche personnalisées

### Création d'une page de recherche

- **Endpoint**: `/api/admin/search/pages`
- **Méthode**: `POST`
- **Authentification**: Requise (cookie `admin_session`)
- **Corps de la requête**:
  ```json
  {
    "keyword": "terme clé",
    "slug": "terme-cle",
    "description": "Description de la page",
    "isActive": true
  }
  ```
- **Réponse**: Données de la page de recherche créée

## Flux de données

1. L'utilisateur saisit un terme dans le champ de recherche (`components/ui/search-form.tsx`)
2. La recherche est soumise, redirigeant vers la page des résultats avec le terme en paramètre
3. Les résultats sont filtrés en fonction du terme via `SearchFilters` (`components/ui/search-filters.tsx`)
4. En parallèle, le terme est enregistré dans la base de données via l'API
5. Les administrateurs peuvent accéder aux statistiques de recherche via le tableau de bord

## Optimisations potentielles

1. **Indexation**: Ajouter des index sur les colonnes fréquemment utilisées pour les requêtes:
   ```sql
   CREATE INDEX "SearchData_term_idx" ON "SearchData"("term");
   CREATE INDEX "SearchData_lastSearchedAt_idx" ON "SearchData"("lastSearchedAt");
   ```

2. **Mise en cache**: Mettre en cache les résultats des termes de recherche populaires

3. **Agrégation périodique**: Agréger les données historiques pour réduire la taille de la base de données

4. **Nettoyage automatique**: Supprimer les termes de recherche peu fréquents et anciens

5. **Traitement asynchrone**: Enregistrer les recherches de manière asynchrone pour ne pas impacter l'expérience utilisateur

## Considérations relatives à la vie privée

1. Aucune donnée personnelle n'est collectée avec les termes de recherche
2. Les données sont agrégées et anonymes
3. Seuls les administrateurs ont accès aux données brutes
4. Les exportations de données sont protégées par authentification 