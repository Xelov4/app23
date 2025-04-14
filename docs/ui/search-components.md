# Composants d'interface utilisateur pour la recherche

Ce document décrit les composants d'interface utilisateur utilisés pour la fonctionnalité de recherche dans l'application.

## Composants principaux

### 1. SearchForm

**Fichier** : `components/ui/search-form.tsx`

**Description** : Composant de formulaire de recherche réutilisable qui soumet les requêtes et redirige vers la page des résultats.

**Props** :
- `defaultValue` : Valeur initiale du champ de recherche (facultatif)
- `className` : Classes CSS personnalisées (facultatif)

**Fonctionnalités** :
- Champ de saisie avec bouton de recherche
- Redirection vers `/tools` avec le paramètre de recherche
- Style personnalisable via les classes CSS

**Exemple d'utilisation** :
```jsx
<SearchForm defaultValue="intelligence artificielle" className="my-custom-class" />
```

### 2. SearchFilters

**Fichier** : `components/ui/search-filters.tsx`

**Description** : Composant de filtres pour la recherche qui permet aux utilisateurs d'affiner leurs résultats de recherche.

**Props** :
- `filterOptions` : Options de filtrage disponibles (obligatoire)
- `className` : Classes CSS personnalisées (facultatif)

**Structure de `filterOptions`** :
```typescript
interface FilterOptions {
  pricingTypes: string[];
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    _count: {
      CategoriesOnTools: number;
    }
  }[];
  tags: {
    id: string;
    name: string;
    slug: string;
    _count: {
      TagsOnTools: number;
    }
  }[];
}
```

**Fonctionnalités** :
- Filtrage par type de tarification (Gratuit, Freemium, Payant, Sur devis)
- Filtrage par catégorie
- Filtrage par tag
- Badges pour les filtres actifs
- Boutons pour appliquer les filtres ou les réinitialiser

**Exemple d'utilisation** :
```jsx
<SearchFilters filterOptions={filterOptions} className="my-filters-class" />
```

### 3. Pagination

**Fichier** : `components/ui/pagination.tsx`

**Description** : Composant de pagination pour naviguer entre les différentes pages de résultats.

**Props** :
- `currentPage` : Numéro de la page actuelle (obligatoire)
- `totalPages` : Nombre total de pages (obligatoire)
- `onPageChange` : Fonction de rappel appelée lorsque la page change (obligatoire)
- `className` : Classes CSS personnalisées (facultatif)

**Fonctionnalités** :
- Affichage des numéros de page avec ellipses pour les grandes quantités
- Boutons Précédent/Suivant
- Style personnalisable
- Accessibilité avec ARIA labels

**Exemple d'utilisation** :
```jsx
<Pagination 
  currentPage={currentPage} 
  totalPages={totalPages} 
  onPageChange={setCurrentPage} 
/>
```

## Composants d'administration

### 1. SearchDataTable

**Fichier** : `app/admin/search/data/page.tsx` (intégré dans la page)

**Description** : Tableau d'administration affichant les données de recherche des utilisateurs.

**Fonctionnalités** :
- Affichage paginé des termes de recherche
- Filtrage par période (aujourd'hui, semaine, mois, année)
- Recherche dans les termes
- Tri par différentes colonnes
- Exportation des données au format CSV

### 2. SearchPagesTable

**Fichier** : `app/admin/search/pages/page.tsx` (intégré dans la page)

**Description** : Tableau d'administration pour gérer les pages de recherche personnalisées.

**Fonctionnalités** :
- Liste des pages de recherche avec détails
- Activation/désactivation des pages
- Édition et suppression des pages
- Création de nouvelles pages
- Recherche de pages existantes

## Flux d'interaction

### Recherche utilisateur

1. L'utilisateur entre un terme dans `SearchForm` et soumet le formulaire
2. L'URL est mise à jour avec le paramètre de recherche (`/tools?search=term`)
3. La page des résultats charge et affiche les résultats filtrés
4. L'utilisateur peut affiner les résultats avec `SearchFilters`
5. L'utilisateur peut naviguer entre les pages de résultats avec `Pagination`

### Administration des recherches

1. L'administrateur accède au tableau de bord (`/admin/search/data`)
2. Il peut filtrer les données par période ou terme spécifique
3. Il peut trier les résultats par différents critères
4. Il peut exporter les données au format CSV pour analyse externe

## Styles et thèmes

Tous les composants de recherche utilisent le système de design de l'application, avec :

- Support des thèmes clair/sombre
- Responsive design pour adaptation aux différentes tailles d'écran
- Accessibilité intégrée (contraste, focus, ARIA)

## Tests

Les composants de recherche sont testés via :

- Tests unitaires (`__tests__/unit/components/search/`)
- Tests d'intégration (`__tests__/integration/api/search/`)
- Helpers de test communs (`__tests__/helpers/search-form-test-helper.tsx`)

## Optimisations possibles

1. **Lazy loading** : Charger les résultats par lots pour améliorer la performance
2. **Autocomplétion** : Ajouter des suggestions pendant la saisie
3. **Persistance des filtres** : Sauvegarder les filtres dans le stockage local ou les cookies
4. **Animation** : Améliorer les transitions entre les états
5. **Recherche vocale** : Ajouter la possibilité de rechercher par commande vocale
6. **Prévisualisation des résultats** : Afficher une prévisualisation rapide des résultats sans changer de page 