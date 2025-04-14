# Plan de tests des APIs de recherche

Ce document décrit le plan de tests pour les différentes APIs du système de recherche.

## APIs utilisateurs

### GET /search

**Objectif**: Vérifier la redirection depuis la page de recherche vers la page des outils.

**Tests**:
1. ✅ Redirection de base: Vérifier que `/search?q=terme` redirige vers `/tools?search=terme`
2. ✅ Encodage correct: Vérifier que les caractères spéciaux sont correctement encodés
3. ✅ Paramètres vides: Vérifier que `/search` sans paramètre redirige vers `/tools`

### GET /tools

**Objectif**: Vérifier que la page des outils filtre correctement les résultats selon les paramètres.

**Tests**:
1. ✅ Recherche simple: `/tools?search=video` doit afficher les outils correspondants
2. ✅ Filtrage par tarification: `/tools?pricing=FREE` doit n'afficher que les outils gratuits
3. ✅ Filtrage par catégorie: `/tools?categories=video-generation` doit filtrer par catégorie
4. ✅ Filtrage par tag: `/tools?tags=ai` doit filtrer par tag
5. ✅ Filtres multiples: Combinaison de plusieurs paramètres de filtrage
6. ✅ Pagination: `/tools?page=2` doit afficher la deuxième page de résultats
7. ✅ Absence de résultats: Message approprié quand aucun résultat ne correspond

## APIs administrateur

### GET /api/admin/search/data

**Objectif**: Vérifier la récupération des données de recherche pour le tableau de bord admin.

**Tests**:
1. ✅ Données complètes: Vérifier que toutes les statistiques sont présentes
2. ✅ Filtrage temporel: Vérifier que le paramètre `timeRange` fonctionne
3. ✅ Accès non authentifié: Doit retourner une erreur 401
4. ✅ Accès non autorisé: Utilisateur connecté mais sans droits admin → erreur 403

### POST /api/admin/search/data

**Objectif**: Vérifier l'enregistrement manuel d'un terme de recherche.

**Tests**:
1. ✅ Création réussie: Terme valide créé avec succès
2. ❌ Validation: Erreur appropriée si le terme est vide
3. ❌ Validation: Erreur si le terme existe déjà mais mise à jour du compteur
4. ✅ Accès non authentifié: Doit retourner une erreur 401

### GET /api/admin/search/data/export

**Objectif**: Vérifier l'exportation des données de recherche.

**Tests**:
1. ✅ Format CSV: Vérifier que le fichier exporté a le bon format
2. ✅ Contenu: Vérifier que toutes les données nécessaires sont incluses
3. ✅ Filtrage temporel: Vérifier que le paramètre `timeRange` fonctionne
4. ✅ Accès non authentifié: Doit retourner une erreur 401

### GET /api/admin/search/pages

**Objectif**: Vérifier la récupération des pages de recherche personnalisées.

**Tests**:
1. ✅ Liste complète: Vérifier que toutes les pages sont récupérées
2. ✅ Format des données: Vérifier que chaque page contient tous les champs requis
3. ✅ Accès non authentifié: Doit retourner une erreur 401

### POST /api/admin/search/pages

**Objectif**: Vérifier la création de pages de recherche personnalisées.

**Tests**:
1. ✅ Création réussie: Page valide créée avec succès
2. ❌ Validation: Erreur appropriée si les champs requis sont manquants
3. ❌ Validation: Erreur si un slug identique existe déjà
4. ✅ Génération de slug: Vérifier que le slug est correctement généré
5. ✅ Accès non authentifié: Doit retourner une erreur 401

## Tests d'intégration

### Flux complet utilisateur

**Objectif**: Vérifier l'intégration complète du parcours utilisateur.

**Tests**:
1. ✅ Recherche → Résultats: Vérifier le flux complet de recherche
2. ✅ Recherche → Pas de résultat → Suggestions: Vérifier les suggestions
3. ✅ Filtrage progressif: Application de filtres successifs et résultats correspondants

### Flux complet administrateur

**Objectif**: Vérifier l'intégration complète du parcours administrateur.

**Tests**:
1. ✅ Consultation statistiques → Export: Vérifier le flux d'analyse
2. ✅ Création page → Consultation publique: Vérifier que la page créée est accessible
3. ✅ Mise à jour page → Mise à jour publique: Vérifier que les modifications sont reflétées

## Tests de performance

**Objectif**: Vérifier que les APIs répondent dans des délais acceptables.

**Tests**:
1. ⚠️ Temps de réponse: Chaque API doit répondre en moins de 500ms
2. ⚠️ Charge: Comportement avec 100 requêtes simultanées
3. ⚠️ Volume: Comportement avec une grande quantité de données (10 000+ enregistrements)

## Légende

- ✅ Test implémenté et passant
- ⚠️ Test à implémenter (prioritaire)
- ❌ Test en échec ou non implémenté

## Notes d'implémentation

Pour les tests d'API, nous utilisons:
- Tests unitaires avec Jest pour la logique de base
- Tests d'intégration avec des mocks pour les dépendances externes
- Tests E2E avec Playwright pour les flux complets

Les mocks pour les données de test sont disponibles dans `docs/api/search/test-api-mock.js`. 