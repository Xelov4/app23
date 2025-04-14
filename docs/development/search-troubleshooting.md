# Guide de débogage du système de recherche

Ce document fournit des conseils pour identifier et résoudre les problèmes courants liés au système de recherche.

## Table des matières
1. [Problèmes de tests](#problèmes-de-tests)
2. [Problèmes d'interface utilisateur](#problèmes-dinterface-utilisateur)
3. [Problèmes d'API](#problèmes-dapi)
4. [Problèmes de base de données](#problèmes-de-base-de-données)
5. [Problèmes de performance](#problèmes-de-performance)

## Problèmes de tests

### Tests échouant avec `getByRole('form')`

**Symptôme**: Les tests qui tentent d'accéder à un formulaire avec `getByRole('form')` échouent.

**Cause**: Le formulaire n'a pas d'attribut `role="form"` explicite, et certains environnements de test ne l'ajoutent pas automatiquement.

**Solution**:
```typescript
// Utiliser querySelector au lieu de getByRole
const form = container.querySelector('form');
fireEvent.submit(form);
```

### Problèmes de duplication de texte avec `getByText()`

**Symptôme**: Erreur indiquant que plusieurs éléments correspondent au texte recherché.

**Cause**: Plusieurs éléments dans le DOM contiennent le même texte (par exemple, des labels et des badges).

**Solution**:
```typescript
// Utiliser getAllByText et sélectionner le premier élément
const element = screen.getAllByText('Texte')[0];
```

### Échec des tests d'intégration au niveau de l'API

**Symptôme**: Les tests d'intégration API échouent avec des erreurs d'authentification ou des réponses 401.

**Cause**: Les requêtes de test ne fournissent pas les cookies d'authentification requis.

**Solution**:
```typescript
// Mocker la fonction cookies() pour simuler un cookie d'authentification
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'valid-session-token' }),
  }),
}));
```

## Problèmes d'interface utilisateur

### Les filtres ne sont pas appliqués correctement

**Symptôme**: Après avoir sélectionné des filtres et cliqué sur "Appliquer", les résultats ne reflètent pas les choix.

**Causes possibles**:
1. Problème de formatage des paramètres d'URL
2. Problème de gestion d'état dans les composants

**Débogage**:
1. Vérifier les paramètres d'URL générés (`console.log` dans la fonction de soumission)
2. Vérifier que les valeurs des filtres sont correctement transmises au handler d'URL
3. Examiner les requêtes réseau dans DevTools

**Solution courante**:
```typescript
// Assurer l'encodage correct des paramètres multiples
// Utiliser .join() pour les tableaux
if (selectedCategories.length > 0) {
  params.set('categories', selectedCategories.join(','));
}
```

### Problèmes d'affichage sur mobile

**Symptôme**: Les filtres ou résultats de recherche s'affichent incorrectement sur les appareils mobiles.

**Solution**:
- Vérifier les media queries dans les composants
- Tester avec plusieurs tailles d'écran dans DevTools
- Ajouter des classes spécifiques pour les écrans de petite taille

## Problèmes d'API

### Réponse 401 (Non autorisé)

**Symptôme**: L'API renvoie une erreur 401 lors de l'accès aux routes d'administration.

**Causes possibles**:
1. Cookie de session manquant ou invalide
2. Session expirée
3. Problème de CORS

**Vérification**:
1. Examiner la présence du cookie `admin_session` dans DevTools
2. Vérifier le code d'authentification dans l'API route
3. Vérifier les en-têtes CORS si l'accès se fait depuis un domaine différent

### Réponse 500 (Erreur serveur)

**Symptôme**: L'API renvoie une erreur 500 lors de l'accès aux données de recherche.

**Débogage**:
1. Vérifier les logs serveur
2. Examiner le bloc try/catch dans la route API
3. Vérifier la connexion à la base de données

```typescript
// Ajouter des logs détaillés pour faciliter le débogage
try {
  // code...
} catch (error) {
  console.error('Détail de l\'erreur:', error);
  return NextResponse.json(
    { message: 'Erreur serveur', error: error.message },
    { status: 500 }
  );
}
```

## Problèmes de base de données

### Erreurs de requête Prisma

**Symptôme**: Erreurs liées aux requêtes Prisma dans les logs.

**Causes courantes**:
1. Schéma de base de données non synchronisé
2. Clés étrangères invalides
3. Types de données incompatibles

**Solutions**:
1. Exécuter `npx prisma migrate dev` pour synchroniser le schéma
2. Vérifier les relations dans le schéma Prisma
3. Valider les données avant insertion

### Performances lentes sur les requêtes de recherche

**Symptôme**: Temps de réponse longs pour les requêtes de recherche.

**Solutions**:
1. Ajouter des index sur les colonnes fréquemment recherchées
   ```sql
   CREATE INDEX idx_search_term ON "SearchData"(term);
   ```
2. Optimiser les requêtes Prisma en limitant les champs retournés
   ```typescript
   const results = await prisma.searchData.findMany({
     select: {
       id: true,
       term: true,
       count: true,
       // Limiter les champs retournés
     },
     where: {
       // ...
     }
   });
   ```

## Problèmes de performance

### Chargement lent des résultats de recherche

**Symptôme**: La page des résultats de recherche met longtemps à s'afficher.

**Solutions**:
1. Implémenter le lazy loading des résultats
2. Réduire le nombre de résultats par page
3. Optimiser les requêtes de base de données
4. Mettre en cache les résultats fréquents

### Filtres peu réactifs

**Symptôme**: L'interface des filtres est lente à réagir aux interactions utilisateur.

**Solutions**:
1. Débouncer les entrées utilisateur
   ```typescript
   import { debounce } from 'lodash';
   
   const debouncedHandleChange = debounce((value) => {
     setSearchTerm(value);
   }, 300);
   ```
2. Optimiser le rendu des composants avec `React.memo`
3. Utiliser des techniques de virtualisation pour les longues listes

## Checklist de vérification rapide

Utilisez cette checklist pour diagnostiquer rapidement les problèmes :

- [ ] Tous les tests unitaires passent
- [ ] Les formulaires se soumettent correctement
- [ ] Les paramètres d'URL sont correctement formatés
- [ ] L'authentification admin fonctionne
- [ ] Les requêtes API renvoient les bonnes données
- [ ] L'interface est responsive sur tous les appareils
- [ ] Les performances sont acceptables même avec beaucoup de données

## Outils de diagnostic

1. **React DevTools** : Inspecter l'état des composants et les props
2. **Network Tab** : Examiner les requêtes réseau et les réponses API
3. **Console** : Vérifier les erreurs JavaScript
4. **Lighthouse** : Analyser les performances globales
5. **Jest Debug** : Déboguer les tests qui échouent
6. **Prisma Studio** : Examiner directement les données dans la base 