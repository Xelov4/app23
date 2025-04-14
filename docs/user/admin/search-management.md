# Guide d'administration du système de recherche

Ce document est destiné aux administrateurs et détaille les fonctionnalités disponibles pour gérer le système de recherche.

## Vue d'ensemble

Le système de recherche permet aux utilisateurs de trouver des outils d'IA en fonction de diverses caractéristiques. En tant qu'administrateur, vous pouvez :

1. Consulter les statistiques de recherche
2. Gérer les termes de recherche personnalisés
3. Créer et modifier des pages de résultats dédiées
4. Exporter les données de recherche

## Interface d'administration

L'interface d'administration du système de recherche est accessible via `/admin/search`.

### Tableau de bord des recherches

Le tableau de bord présente les statistiques suivantes :

- Termes de recherche les plus fréquents
- Évolution des recherches dans le temps
- Répartition des recherches par catégorie
- Termes de recherche sans résultats

Vous pouvez filtrer ces données par période (jour, semaine, mois, année).

### Gestion des termes de recherche

Dans la section `/admin/search/terms`, vous pouvez :

1. **Consulter** la liste des termes de recherche existants
2. **Créer** de nouveaux termes de recherche personnalisés
3. **Modifier** les propriétés des termes existants
4. **Activer/Désactiver** des termes
5. **Supprimer** des termes inutilisés

#### Propriétés d'un terme de recherche

Chaque terme possède les propriétés suivantes :

- **Mot-clé** : Le terme de recherche lui-même
- **Slug** : Version URL-friendly du terme (généré automatiquement)
- **Description** : Description pour l'administration
- **Titre SEO** : Titre personnalisé pour la page de résultats
- **Meta description** : Description pour les résultats de recherche
- **Statut** : Actif ou inactif
- **Outils associés** : Liste des outils à mettre en avant pour ce terme

### Pages de recherche personnalisées

La section `/admin/search/pages` permet de créer des pages de résultats de recherche personnalisées.

#### Création d'une page personnalisée

1. Accédez à `/admin/search/pages/create`
2. Saisissez le terme de recherche principal
3. Configurez les options d'affichage :
   - Titre de la page
   - Description
   - Mise en page (standard, grille, liste)
   - Filtres à afficher par défaut
4. Sélectionnez les outils à mettre en avant
5. Définissez l'ordre d'affichage des résultats
6. Enregistrez la page

#### Gestion des pages existantes

Vous pouvez modifier, dupliquer ou supprimer les pages existantes depuis la liste.

### Export des données

Pour exporter les données de recherche :

1. Accédez à `/admin/search/data`
2. Sélectionnez la période souhaitée
3. Choisissez le format d'export (CSV, Excel)
4. Cliquez sur "Exporter"

## Optimisation SEO

Le système permet d'optimiser les pages de résultats pour le référencement :

1. **URLs conviviales** : Les pages utilisent le format `/search/[slug]`
2. **Méta-données personnalisées** : Titre, description et balises Open Graph
3. **Structure de données** : Balisage JSON-LD pour les moteurs de recherche
4. **Redirections** : Configuration automatique des redirections pour les termes similaires

### Bonnes pratiques SEO

- Utilisez des mots-clés pertinents dans les titres et descriptions
- Créez des descriptions uniques pour chaque terme de recherche
- Associez les outils les plus pertinents à chaque terme
- Surveillez régulièrement les termes de recherche sans résultats pour les optimiser

## Suivi des performances

Le système enregistre automatiquement les métriques suivantes :

- Nombre de recherches par terme
- Taux de clic sur les résultats
- Temps passé sur les pages de résultats
- Recherches sans résultats

Ces données sont accessibles via le tableau de bord d'administration.

## Dépannage

### Problèmes courants

1. **Terme de recherche introuvable** : Vérifiez l'orthographe et les synonymes
2. **Page personnalisée non accessible** : Vérifiez que le statut est "Actif"
3. **Statistiques incomplètes** : Les données sont agrégées toutes les 24h

### Support

Pour toute assistance supplémentaire, contactez l'équipe technique via le canal Slack #support-search ou par email à support@example.com. 