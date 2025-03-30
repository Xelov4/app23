const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Réorganisation des catégories des outils...');
  
  // Récupérer tous les outils avec leurs catégories
  const tools = await prisma.tool.findMany({
    include: {
      CategoriesOnTools: {
        include: {
          Category: true
        }
      }
    }
  });
  
  console.log(`Nombre d'outils trouvés: ${tools.length}`);
  
  // Récupérer toutes les catégories
  const categories = await prisma.category.findMany();
  console.log(`Nombre de catégories trouvées: ${categories.length}`);
  
  // Mappage des catégories par slug pour un accès facile
  const categoriesBySlug = {};
  categories.forEach(category => {
    categoriesBySlug[category.slug] = category.id;
  });
  
  // Règles de catégorisation basées sur les attributs des outils et les mots-clés
  const categorizationRules = {
    "generation-video": [
      "video generator", "générateur de vidéo", "génération de vidéo", "video generation", 
      "ai video", "vidéo ia", "create video", "créer des vidéos", "text to video", "texte en vidéo",
      "image to video", "image en vidéo", "sora", "gen2", "motion", "animation from text"
    ],
    "edition-video": [
      "edit", "editing", "édition", "modifier", "enhance", "améliorer", "transform", "transformer",
      "cut", "couper", "trim", "rogner", "split", "diviser", "join", "joindre", "merge", "fusionner"
    ],
    "montage-automatique": [
      "automatic editing", "montage automatique", "auto edit", "auto montage", "smart editing",
      "montage intelligent", "ai edit", "montage ia", "automated cutting", "découpage automatisé"
    ],
    "traitement-audio": [
      "audio", "son", "voice", "voix", "speech", "parole", "noise", "bruit", "enhancement", "amélioration",
      "extraction", "transcription", "transcript", "dub", "doublage", "mix", "mixage"
    ],
    "animation": [
      "animation", "animate", "animer", "animated", "animé", "character", "personnage", "motion",
      "movement", "mouvement", "rigging", "rig"
    ],
    "effets-speciaux": [
      "special effects", "effets spéciaux", "vfx", "visual effects", "effet visuel", "filter", "filtre",
      "transition", "transform", "transformation", "style", "artistic", "artistique"
    ],
    "avatars-humains-virtuels": [
      "avatar", "virtual human", "humain virtuel", "virtual character", "personnage virtuel",
      "talking head", "tête parlante", "digital human", "humain numérique", "presenter", "présentateur"
    ],
    "texte-en-video": [
      "text to video", "texte en vidéo", "script to video", "script en vidéo", "story to video",
      "histoire en vidéo", "text-based", "basé sur le texte", "presentation", "présentation"
    ],
    "sous-titrage-transcription": [
      "subtitle", "sous-titre", "caption", "transcription", "transcribe", "transcrire", "srt",
      "closed caption", "sous-titrage"
    ],
    "videos-personnalisees": [
      "personalized", "personnalisé", "custom", "customized", "sur mesure", "tailored", "adapté",
      "individual", "individuel", "personal", "personnel"
    ],
    "amelioration-video": [
      "enhance", "améliorer", "enhancement", "amélioration", "upscale", "upscaling", "resolution",
      "quality", "qualité", "stabilize", "stabiliser", "denoise", "débruiter", "sharpen", "netteté"
    ],
    "analyse-video": [
      "analysis", "analyse", "analytics", "analytique", "insight", "aperçu", "data", "données",
      "extract", "extraire", "summarize", "résumer", "summary", "résumé"
    ],
    "marketing-video": [
      "marketing", "ads", "publicité", "advertising", "promotion", "commercial", "campaign", "campagne",
      "social media", "réseaux sociaux", "outreach", "diffusion"
    ],
    "reseaux-sociaux": [
      "social media", "réseaux sociaux", "tiktok", "instagram", "facebook", "youtube", "shorts",
      "reels", "twitter", "linkedin", "vertical", "horizontal", "square", "carré"
    ],
    "presentation-explications": [
      "presentation", "présentation", "explain", "expliquer", "explanation", "explication", "tutorial",
      "tutoriel", "educational", "éducatif", "learning", "apprentissage", "teach", "enseigner"
    ]
  };
  
  // Fonction pour déterminer les catégories appropriées pour un outil
  async function determineCategories(tool) {
    const categoriesToAssign = new Set();
    
    // 1. Analyser les catégories existantes
    const existingCategories = tool.CategoriesOnTools.map(rel => 
      rel.Category.slug === 'videos-personnalisees' ? 'videos-personnalisees' :
      rel.Category.slug === 'texte-en-video' ? 'texte-en-video' :
      rel.Category.slug === 'generation-de-video' ? 'generation-video' :
      rel.Category.slug
    );
    
    // Convertir certaines catégories anciennes vers les nouvelles
    if (existingCategories.includes('generation-de-video')) {
      categoriesToAssign.add('generation-video');
    }
    if (existingCategories.includes('outils-video')) {
      // Ne pas garder cette catégorie trop générique, mais l'analyser plus finement
    }
    
    // 2. Analyser le nom et la description pour trouver des mots-clés
    const textToAnalyze = `${tool.name.toLowerCase()} ${tool.description.toLowerCase()}`;
    
    for (const [categorySlug, keywords] of Object.entries(categorizationRules)) {
      for (const keyword of keywords) {
        if (textToAnalyze.includes(keyword.toLowerCase())) {
          categoriesToAssign.add(categorySlug);
          break;
        }
      }
    }
    
    // 3. Règles spécifiques basées sur les caractéristiques de l'outil
    let features = [];
    try {
      if (tool.features) {
        features = JSON.parse(tool.features);
      }
    } catch (error) {
      console.log(`Impossible de parser les fonctionnalités pour ${tool.name}`);
    }
    
    if (features.length > 0) {
      const featuresText = features.join(' ').toLowerCase();
      
      for (const [categorySlug, keywords] of Object.entries(categorizationRules)) {
        for (const keyword of keywords) {
          if (featuresText.includes(keyword.toLowerCase())) {
            categoriesToAssign.add(categorySlug);
            break;
          }
        }
      }
    }
    
    // 4. Règles spécifiques pour certains termes exacts
    if (tool.name.toLowerCase().includes('subtitle') || tool.name.toLowerCase().includes('caption')) {
      categoriesToAssign.add('sous-titrage-transcription');
    }
    if (tool.name.toLowerCase().includes('enhance') || tool.name.toLowerCase().includes('upscale')) {
      categoriesToAssign.add('amelioration-video');
    }
    if (tool.name.toLowerCase().includes('avatar') || tool.name.toLowerCase().includes('human')) {
      categoriesToAssign.add('avatars-humains-virtuels');
    }
    
    // Conserver au moins une catégorie existante si aucune nouvelle n'est trouvée
    if (categoriesToAssign.size === 0 && existingCategories.length > 0) {
      if (existingCategories.includes('generation-images')) {
        categoriesToAssign.add('generation-video'); // Probablement un outil qui fait les deux
      } else {
        categoriesToAssign.add(existingCategories[0]);
      }
    }
    
    // S'assurer qu'il y a au moins une catégorie
    if (categoriesToAssign.size === 0) {
      categoriesToAssign.add('generation-video'); // Catégorie par défaut
    }
    
    // Transformer le set en tableau
    return Array.from(categoriesToAssign);
  }
  
  // Traiter chaque outil
  for (const tool of tools) {
    console.log(`Traitement de l'outil: ${tool.name}`);
    
    // Déterminer les catégories appropriées
    const categoriesToAssign = await determineCategories(tool);
    console.log(`Catégories déterminées pour ${tool.name}: ${categoriesToAssign.join(', ')}`);
    
    // Supprimer les associations existantes
    await prisma.categoriesOnTools.deleteMany({
      where: { toolId: tool.id }
    });
    
    // Créer les nouvelles associations
    for (const categorySlug of categoriesToAssign) {
      const categoryId = categoriesBySlug[categorySlug];
      
      if (categoryId) {
        await prisma.categoriesOnTools.create({
          data: {
            toolId: tool.id,
            categoryId: categoryId
          }
        });
      } else {
        console.log(`Catégorie non trouvée: ${categorySlug}`);
      }
    }
    
    console.log(`${categoriesToAssign.length} catégories associées à ${tool.name}`);
  }
  
  console.log('Réorganisation des catégories terminée avec succès!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 