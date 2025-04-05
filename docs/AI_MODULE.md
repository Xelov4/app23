# Module IA pour Video-IA.net

Ce module utilise l'API Google Gemini pour générer automatiquement des descriptions, titres SEO et méta-descriptions pour les fonctionnalités, tags et types d'utilisateurs de la plateforme.

## Configuration

Pour utiliser le module IA, vous devez obtenir une clé API pour Google Gemini :

1. Rendez-vous sur [Google AI Studio](https://makersuite.google.com/)
2. Créez un compte si nécessaire
3. Dans la section API Keys, créez une nouvelle clé API
4. Copiez cette clé et ajoutez-la dans le fichier `.env.local` :

```
GOOGLE_GEMINI_API_KEY="votre_clé_api_ici"
```

## Fonctionnalités

Le module IA permet de générer automatiquement :

- Des descriptions détaillées pour les fonctionnalités, tags et types d'utilisateurs
- Des titres SEO optimisés pour le référencement
- Des méta-descriptions concises (max 150 caractères)

## Utilisation dans l'interface d'administration

Sur les formulaires de création et d'édition, vous trouverez un bouton "Générer avec IA" qui permet de générer automatiquement du contenu basé sur le nom de l'élément.

### Génération pour les fonctionnalités

Le module génère une description expliquant comment cette fonctionnalité est utile pour la création vidéo, ainsi qu'un titre SEO et une méta-description optimisés.

### Génération pour les tags

Le module génère une description expliquant ce que ce tag représente dans le contexte des outils d'IA pour la vidéo, ainsi qu'un titre SEO et une méta-description optimisés.

### Génération pour les types d'utilisateurs

Le module génère une description expliquant les besoins et cas d'usage de ce type d'utilisateur dans le contexte des outils d'IA pour la vidéo, ainsi qu'un titre SEO et une méta-description optimisés.

## Structure technique

Le module IA est composé de :

- Une API à `/api/admin/gemini-ia` qui communique avec l'API Gemini de Google
- Des hooks d'intégration dans les formulaires de création et d'édition
- Une logique de parsing pour extraire les données structurées des réponses

## Personnalisation des prompts

Les prompts utilisés pour générer le contenu peuvent être personnalisés dans les fichiers de page respectifs :

- `app/admin/features/new/page.tsx` et `app/admin/features/edit/[slug]/page.tsx` pour les fonctionnalités
- `app/admin/tags/new/page.tsx` et `app/admin/tags/edit/[slug]/page.tsx` pour les tags
- `app/admin/users/new/page.tsx` et `app/admin/users/edit/[slug]/page.tsx` pour les types d'utilisateurs 