const { execSync } = require('child_process');
const path = require('path');

console.log('Démarrage de la mise à jour complète du système de catégorisation...');
console.log('------------------------------------------------------------');

try {
  // 1. Créer/mettre à jour les catégories
  console.log('\n\n');
  console.log('ÉTAPE 1: Mise à jour des catégories');
  console.log('------------------------------------------------------------');
  execSync('node ' + path.join(__dirname, 'create-categories-system.js'), { stdio: 'inherit' });
  
  // 2. Créer les tags
  console.log('\n\n');
  console.log('ÉTAPE 2: Création des tags');
  console.log('------------------------------------------------------------');
  execSync('node ' + path.join(__dirname, 'create-tags-system.js'), { stdio: 'inherit' });
  
  // 3. Réorganiser les catégories des outils
  console.log('\n\n');
  console.log('ÉTAPE 3: Réorganisation des catégories des outils');
  console.log('------------------------------------------------------------');
  execSync('node ' + path.join(__dirname, 'reorganize-tool-categories.js'), { stdio: 'inherit' });
  
  // 4. Associer les tags aux outils
  console.log('\n\n');
  console.log('ÉTAPE 4: Association des tags aux outils');
  console.log('------------------------------------------------------------');
  execSync('node ' + path.join(__dirname, 'associate-tags-tools.js'), { stdio: 'inherit' });
  
  console.log('\n\n');
  console.log('TERMINÉ: La mise à jour du système de catégorisation est terminée avec succès!');
  console.log('------------------------------------------------------------');
} catch (error) {
  console.error('Une erreur est survenue lors de l\'exécution des scripts:');
  console.error(error.message);
  process.exit(1);
} 