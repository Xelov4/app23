# Guide des tests pour le système de recherche

Ce document décrit les tests mis en place pour le système de recherche et comment les exécuter.

## Structure des tests

Les tests sont organisés selon la structure suivante :

```
__tests__/
  ├── unit/                    # Tests unitaires
  │   ├── lib/                 # Tests des fonctions utilitaires
  │   │   └── search/          # Tests spécifiques aux fonctions de recherche
  │   └── components/          # Tests des composants React
  │       └── search/          # Tests spécifiques aux composants de recherche
  ├── integration/             # Tests d'intégration
  │   └── api/                 # Tests d'intégration pour les APIs
  │       └── search/          # Tests d'intégration spécifiques à la recherche
  ├── e2e/                     # Tests end-to-end (Playwright)
  │   └── search.spec.ts       # Tests E2E du système de recherche
  ├── mocks/                   # Données de mock pour les tests
  └── helpers/                 # Utilitaires pour les tests
```

## Tests unitaires

Les tests unitaires vérifient le comportement isolé des fonctions et composants.

### Fonctions utilitaires testées

- `formatPricingType` : Formatage des types de tarification
- `generatePaginationItems` : Génération des éléments de pagination
- `createPageUrl` : Création d'URLs pour la pagination avec paramètres
- `slugify` : Conversion de texte en slug pour URLs
- `safeJsonParse` : Parsing sécurisé de JSON

### Composants testés

- `SearchForm` : Formulaire de recherche
- `SearchFilters` : Filtres de recherche avancés

## Tests d'intégration

Les tests d'intégration vérifient la collaboration entre plusieurs composants ou avec les APIs.

- `search-form-integration.test.tsx` : Interaction entre le formulaire et l'URL
- `search-filters-integration.test.tsx` : Interaction entre les filtres et l'URL

## Tests End-to-End (E2E)

Les tests E2E vérifient le fonctionnement complet du système de recherche dans un environnement réel.

- **Fonctionnalité de recherche utilisateur** : Recherche, filtrage, pagination
- **Interface d'administration** : Gestion des termes de recherche, pages personnalisées, export de données

Ces tests utilisent Playwright pour simuler les interactions utilisateur dans un navigateur réel.

## Comment exécuter les tests

### Exécuter tous les tests Jest

```bash
npm test
```

### Exécuter les tests unitaires seulement

```bash
npm run test:unit
```

### Exécuter les tests d'intégration seulement

```bash
npm run test:integration
```

### Exécuter les tests en mode watch

```bash
npm run test:watch
```

### Générer un rapport de couverture

```bash
npm run test:coverage
```

### Exécuter les tests E2E

```bash
# Installation des navigateurs pour Playwright
npx playwright install

# Exécution des tests E2E
npm run test:e2e

# Exécution avec interface visuelle
npm run test:e2e:ui

# Exécution en mode débogage
npm run test:e2e:debug
```

## Configuration des tests

### Jest

La configuration des tests Jest est définie dans `jest.config.js`. Elle inclut :

- Les chemins de modules pour les imports
- Les seuils de couverture de test
- La configuration de l'environnement de test

### Playwright

La configuration des tests E2E est définie dans `playwright.config.ts`. Elle inclut :

- Les navigateurs à tester (Chrome, Firefox, Safari, Mobile)
- Les paramètres de capture d'écran et de traces
- La configuration du serveur de développement pour les tests

## Bonnes pratiques

1. **Tests isolés** : Chaque test doit être indépendant des autres.
2. **Mocks** : Utiliser les mocks pour simuler les dépendances externes.
3. **Assertions** : Faire des assertions spécifiques sur le comportement attendu.
4. **Tester le comportement, pas l'implémentation** : Se concentrer sur ce que le code fait, pas comment il le fait.
5. **Éviter les tests fragiles** : Ne pas tester les détails d'implémentation qui peuvent changer.

## Mocks

Des mocks sont fournis pour faciliter les tests :

- `__tests__/mocks/filterOptions.ts` : Options de filtres pour les tests
- `__tests__/helpers/test-utils.tsx` : Utilitaires pour les tests avec Next.js

## Problèmes connus

- Les tests des composants Next.js nécessitent un mock complet du routeur, ce qui peut rendre certains tests plus complexes.
- Les tests d'intégration avec les APIs peuvent être affectés par les limites de taux ou l'indisponibilité des services externes.
- Les tests E2E peuvent être fragiles face aux changements d'interface ou de structure HTML.

## Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Next.js Applications](https://nextjs.org/docs/testing)
- [Playwright Documentation](https://playwright.dev/docs/intro) 