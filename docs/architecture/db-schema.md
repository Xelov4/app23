# Schéma de base de données - Système de recherche

Ce document décrit les tables de la base de données SQLite relatives au système de recherche.

## Tables principales

### Search

Table centrale qui stocke les termes de recherche uniques avec leurs métadonnées.

| Colonne          | Type       | Description                                               |
|------------------|------------|-----------------------------------------------------------|
| id               | String     | Identifiant unique (cuid)                                 |
| keyword          | String     | Terme de recherche (unique)                               |
| slug             | String     | Version URL-friendly du terme (unique)                    |
| description      | String?    | Description optionnelle du terme de recherche             |
| seoTitle         | String?    | Titre SEO personnalisé pour les pages de recherche        |
| metaDescription  | String?    | Meta description pour SEO                                 |
| isActive         | Boolean    | Indique si la page de recherche est active                |
| searchCount      | Int        | Nombre total de recherches pour ce terme                  |
| lastSearchedAt   | DateTime?  | Dernière date de recherche du terme                       |
| createdAt        | DateTime   | Date de création de l'entrée                              |
| updatedAt        | DateTime   | Date de dernière mise à jour                              |

### SearchData

Enregistre chaque instance individuelle d'une recherche effectuée par un utilisateur.

| Colonne          | Type       | Description                                               |
|------------------|------------|-----------------------------------------------------------|
| id               | String     | Identifiant unique (cuid)                                 |
| searchId         | String     | Référence à l'entrée dans la table Search                 |
| searchTerm       | String     | Terme exact utilisé lors de la recherche                  |
| count            | Int        | Compteur (incrémenté à chaque recherche)                  |
| lastSearchedAt   | DateTime   | Date de la dernière recherche                             |
| createdAt        | DateTime   | Date de création de l'entrée                              |
| updatedAt        | DateTime   | Date de dernière mise à jour                              |

### ToolsOnSearches

Table de jonction qui établit des relations entre les outils et les termes de recherche, avec un score de pertinence.

| Colonne          | Type       | Description                                               |
|------------------|------------|-----------------------------------------------------------|
| toolId           | String     | Identifiant de l'outil (clé étrangère vers Tool)          |
| searchId         | String     | Identifiant du terme de recherche (clé étrangère vers Search) |
| relevance        | Float      | Score de pertinence (plus élevé = plus pertinent)         |
| createdAt        | DateTime   | Date de création de l'association                         |

## Relations

```
Search 1 --- * SearchData (Un terme peut avoir plusieurs entrées de données)
Search * --- * Tool (via ToolsOnSearches) (Relation many-to-many entre termes et outils)
```

## Indexation

Les colonnes suivantes sont indexées pour améliorer les performances des requêtes:

- `searchId` dans `SearchData`
- `toolId` et `searchId` dans `ToolsOnSearches`

## Cascades

- Suppression en cascade: La suppression d'une entrée dans `Search` entraînera la suppression des entrées associées dans `SearchData` et `ToolsOnSearches`.

## Notes d'implémentation

- Le schéma actuel utilise SQLite comme base de données.
- Le champ `relevance` dans `ToolsOnSearches` pourrait être utilisé pour améliorer le classement des résultats de recherche, mais il n'est pas pleinement exploité dans l'implémentation actuelle.
- La recherche plein texte avancée (FTS) n'est pas encore implémentée dans le schéma actuel. 