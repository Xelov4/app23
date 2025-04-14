# Architecture du système de recherche

## Vue d'ensemble

Le système de recherche actuel est construit autour de plusieurs composants interconnectés qui permettent aux utilisateurs de rechercher des outils d'IA pour la vidéo et aux administrateurs de gérer les données de recherche.

## Composants principaux

### 1. Interface utilisateur de recherche

- **Composants de recherche frontend**: Formulaires de recherche implémentés dans `components/ui/search-form.tsx` et `components/homepage/HeroSection.tsx`
- **Page de résultats**: Implémentée dans `app/tools/page.tsx`, affiche les résultats filtrés
- **Redirection de recherche**: Le composant `app/search/page.tsx` redirige vers la page d'outils avec les paramètres appropriés

### 2. Système d'administration

- **Dashboard des données de recherche**: Interface dans `app/admin/search/data/page.tsx` pour visualiser et analyser les termes de recherche
- **Gestion des pages de recherche**: Interface dans `app/admin/search/pages/page.tsx` pour créer et gérer des pages de recherche personnalisées

### 3. API et backend

- **API de tracking**: Endpoints pour enregistrer les recherches des utilisateurs
- **API admin**: Routes dans `app/api/admin/search/*` pour gérer les données de recherche et les pages

### 4. Modèles de données

Le système s'appuie sur plusieurs tables dans la base de données SQLite:

- **Search**: Stocke les termes de recherche avec métadonnées
- **SearchData**: Enregistre les instances individuelles de recherche
- **ToolsOnSearches**: Établit des relations entre les outils et les termes de recherche

## Flux de données

1. L'utilisateur entre un terme de recherche dans le formulaire
2. La requête est envoyée à `app/search/page.tsx` qui redirige vers `app/tools/page.tsx` avec les paramètres
3. `getTools()` dans `app/tools/page.tsx` interroge la base de données
4. Les résultats sont filtrés et affichés à l'utilisateur

## Limitations actuelles

- Recherche basique par correspondance partielle (`contains`) sans ranking sophistiqué
- Absence d'autocomplétion pour guider les utilisateurs
- Pas de mécanisme automatique pour établir les relations entre termes et outils
- Données de recherche collectées mais sous-exploitées pour l'amélioration de l'expérience

## Schéma du système

```
[Utilisateur] → [Formulaire de recherche] → [Redirection] → [Page de résultats] → [Affichage des outils]
                        ↓
                [API de tracking] → [Base de données] ← [Interface admin]
```

Ce document servira de référence pour comprendre le système actuel avant de procéder aux améliorations planifiées. 