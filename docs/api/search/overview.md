# APIs du système de recherche

Ce document décrit les APIs existantes liées au système de recherche, tant côté utilisateur que côté administrateur.

## APIs utilisateur

### Redirection de recherche

- **Endpoint**: `/search`
- **Méthode**: GET
- **Paramètres**:
  - `q`: Terme de recherche
- **Comportement**: Redirige vers `/tools?search={terme}` pour afficher les résultats
- **Implémentation**: `app/search/page.tsx`

### Recherche d'outils

- **Endpoint**: `/tools`
- **Méthode**: GET
- **Paramètres**:
  - `search`: Terme de recherche
  - `page`: Numéro de page (pagination)
  - `pricing`: Types de tarification (format: `free,paid,freemium`)
  - `categories`: IDs des catégories (format: `cat1,cat2`)
  - `tags`: IDs des tags (format: `tag1,tag2`)
  - `view`: Mode d'affichage (`grid` ou `list`)
  - `sort`: Ordre de tri (`rating`, `newest`, etc.)
- **Comportement**: Filtre et affiche les outils correspondants
- **Implémentation**: Fonction `getTools()` dans `app/tools/page.tsx`

## APIs administrateur

### Récupération des données de recherche

- **Endpoint**: `/api/admin/search/data`
- **Méthode**: GET
- **Paramètres**:
  - `timeRange`: Filtre temporel (`today`, `week`, `month`, `year`, `all`)
- **Réponse**: Liste des termes de recherche avec leurs statistiques
- **Sécurité**: Nécessite un cookie de session administrateur
- **Implémentation**: `app/api/admin/search/data/route.ts`

### Enregistrement d'un terme de recherche

- **Endpoint**: `/api/admin/search/data`
- **Méthode**: POST
- **Corps**:
  ```json
  {
    "term": "terme de recherche"
  }
  ```
- **Comportement**: Crée ou met à jour une entrée dans `SearchData`
- **Sécurité**: Nécessite un cookie de session administrateur
- **Implémentation**: `app/api/admin/search/data/route.ts`

### Exportation des données de recherche

- **Endpoint**: `/api/admin/search/data/export`
- **Méthode**: GET
- **Paramètres**:
  - `timeRange`: Filtre temporel
- **Réponse**: Fichier CSV contenant les données de recherche
- **Sécurité**: Nécessite un cookie de session administrateur
- **Implémentation**: Fonction `exportData()` dans `app/api/admin/search/data/route.ts`

### Récupération des pages de recherche

- **Endpoint**: `/api/admin/search/pages`
- **Méthode**: GET
- **Réponse**: Liste des pages de recherche personnalisées
- **Sécurité**: Nécessite un cookie de session administrateur
- **Implémentation**: `app/api/admin/search/pages/route.ts`

### Création d'une page de recherche

- **Endpoint**: `/api/admin/search/pages`
- **Méthode**: POST
- **Corps**:
  ```json
  {
    "keyword": "terme de recherche",
    "slug": "url-friendly-slug",
    "description": "Description optionnelle",
    "isActive": true
  }
  ```
- **Comportement**: Crée une nouvelle page de recherche personnalisée
- **Sécurité**: Nécessite un cookie de session administrateur
- **Implémentation**: `app/api/admin/search/pages/route.ts`

## Limitations actuelles et opportunités d'amélioration

1. **Absence d'API de tracking côté utilisateur** - Aucun endpoint dédié pour enregistrer les recherches utilisateur en temps réel.
2. **Pas d'API d'autocomplétion** - Aucun endpoint pour suggérer des termes pendant la frappe.
3. **Absence d'API de feedback** - Aucun moyen pour les utilisateurs de donner leur avis sur la pertinence des résultats.
4. **Relations manuelles uniquement** - Les associations entre termes et outils doivent être établies manuellement via l'interface d'administration.

## Améliorations planifiées

- API de tracking côté utilisateur
- API de suggestions/autocomplétion
- API de feedback sur la pertinence des résultats
- API d'associations automatiques entre termes et outils
- API de génération de métadonnées SEO 