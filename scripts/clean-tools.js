const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify/sync');

// Fonction pour nettoyer une URL en supprimant les paramètres de requête
function cleanUrl(url) {
  if (!url || url === 'undefined' || url === '') return '';
  
  try {
    // Créer un objet URL pour faciliter la manipulation
    const urlObj = new URL(url);
    // Retourner l'URL sans les paramètres de requête
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
  } catch (error) {
    // Si l'URL n'est pas valide, retourner l'URL d'origine
    console.error(`URL invalide: ${url}`);
    return url;
  }
}

// Fonction pour convertir la catégorie en français
function translateCategory(category) {
  if (!category || category === 'undefined') return '';
  
  const translations = {
    'Chat': 'Chat',
    'Developer tools': 'Outils de développement',
    'Art Generation': 'Génération artistique',
    '3d': '3D',
    'Content creation': 'Création de contenu',
    'Design': 'Design',
    'E-commerce': 'E-commerce',
    'Gaming': 'Jeux vidéo',
    'Image scanning': 'Numérisation d\'images',
    'Interior design': 'Design d\'intérieur',
    'Motion capture': 'Capture de mouvement',
    'Image editing': 'Édition d\'images',
    'Marketing': 'Marketing',
    'Copywriting': 'Rédaction',
    'Advertising': 'Publicité',
    'Productivity': 'Productivité',
    'Resources': 'Ressources',
    'Automation': 'Automatisation',
    'Personal assistant': 'Assistant personnel',
    'Audio generation': 'Génération audio',
    'Data analysis': 'Analyse de données',
    'Customer support': 'Support client',
    'Email': 'Email',
    'Health': 'Santé',
    'Image generation': 'Génération d\'images',
    'Life assistant': 'Assistant de vie',
    'Meeting assistant': 'Assistant de réunion',
    'Pets': 'Animaux',
    'Recipe Generator': 'Générateur de recettes',
    'Relationships': 'Relations',
    'Research': 'Recherche',
    'Self-improvement': 'Développement personnel',
    'SEO': 'SEO',
    'Speech-to-text': 'Parole à texte',
    'Sports': 'Sports',
    'Spreadsheets': 'Tableurs',
    'Summarizer': 'Résumé',
    'Travel': 'Voyage',
    'AI Assistant': 'Assistant IA',
    'Paraphraser': 'Paraphraseur',
    'Essay writer': 'Rédacteur d\'essais',
    'Aggregators': 'Agrégateurs',
    'Avatar': 'Avatar',
    'Branding': 'Image de marque',
    'Fun': 'Divertissement',
    'Images': 'Images',
    'Presentations': 'Présentations',
    'AI detection': 'Détection d\'IA',
    'Music': 'Musique',
    'Video generation': 'Génération vidéo',
    'Audio editing': 'Édition audio',
    'Podcasting': 'Podcasting',
    'Transcriber': 'Transcription',
    'Translation': 'Traduction',
    'Text-to-speech': 'Texte à parole',
    'Video': 'Vidéo',
    'Image improvement': 'Amélioration d\'images',
    'Prompt Guides': 'Guides de prompt',
    // Ajoutez d'autres traductions au besoin
  };

  return translations[category] || category;
}

// Lire le fichier CSV
const csvFilePath = path.join(__dirname, '../testons.csv');
const outputPath = path.join(__dirname, '../testons-clean.csv');

try {
  // Lire le contenu du fichier
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  
  // Traitement manuel plutôt qu'avec csv-parse qui semble avoir des problèmes
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  
  const headers = lines[0].split(';');
  const records = [];
  
  // Parser chaque ligne
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length >= 3) {
      records.push({
        tool_name: values[0].trim(),
        tool_category: values[1].trim(),
        tool_link: values[2].trim()
      });
    }
  }

  console.log(`Nombre d'enregistrements avant nettoyage: ${records.length}`);

  // Nettoyer les URLs et traduire les catégories
  const cleanedRecords = records
    .filter(record => record.tool_name && record.tool_name.trim() !== '')
    .map(record => ({
      tool_name: record.tool_name,
      tool_category: translateCategory(record.tool_category),
      tool_link: cleanUrl(record.tool_link)
    }));

  // Supprimer les doublons basés sur le nom de l'outil
  const uniqueTools = new Map();
  for (const tool of cleanedRecords) {
    if (tool.tool_name && !uniqueTools.has(tool.tool_name)) {
      uniqueTools.set(tool.tool_name, tool);
    }
  }

  const uniqueRecords = Array.from(uniqueTools.values());
  console.log(`Nombre d'enregistrements après suppression des doublons: ${uniqueRecords.length}`);

  // Écrire les données nettoyées dans un nouveau fichier CSV
  const output = stringify(uniqueRecords, {
    header: true,
    delimiter: ';'
  });
  
  fs.writeFileSync(outputPath, output);
  console.log(`Fichier nettoyé sauvegardé à ${outputPath}`);

} catch (error) {
  console.error('Erreur lors du traitement du fichier CSV:', error);
} 