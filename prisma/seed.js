const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Types d'enum pour le prix
const PricingType = {
  FREE: "FREE",
  FREEMIUM: "FREEMIUM",
  PAID: "PAID",
  CONTACT: "CONTACT"
};

// Données de base pour générer les outils
const aiNames = ["AI", "Vision", "Creator", "Gen", "Neural", "Deep", "Smart", "Synth", "Auto", "Flux", "Pro", "Nova", "Max", "Ultra", "Intelligent", "Cognitive", "Logic", "System", "Assistant", "Genius", "Expert", "Master", "Craft", "Canvas", "Workshop", "Lab", "Studio", "Factory", "Forge", "Architect", "Builder", "Creator", "Designer", "Developer", "Engineer", "Maker", "Producer"];
const domains = ["Image", "Video", "Audio", "Media", "Pic", "Frame", "Sound", "Voice", "Motion", "Visual", "Scene", "Studio", "Production", "Director", "Editor", "Mixer", "Enhancer", "Filter", "Effect", "Transform", "Render", "Compose", "Create", "Generate", "Stream", "Process", "Analyze", "Optimize", "Model", "Design", "Animation", "Graphics", "Content", "Art"];
const features = [
  "Haute résolution", "Export multi-format", "Édition par lot", "Interface intuitive", "Partage facilité", 
  "Intelligence contextuelle", "Styles personnalisables", "Traitement rapide", "Mode hors-ligne", 
  "Reconnaissance d'objets", "Effets temps réel", "Analyse sémantique", "Intégration cloud", 
  "Correction automatique", "Filtres avancés", "Modèles pré-entraînés", "API disponible", 
  "Retouche intelligente", "Conversion de formats", "Collaboration en temps réel",
  "Génération d'images", "Montage vidéo", "Traitement audio", "Animation automatique",
  "Suppression de bruit", "Reconnaissance vocale", "Sous-titrage automatique",
  "Synthèse vocale", "Effets spéciaux", "Stabilisation vidéo", "Correction colorimétrique",
  "Masking intelligent", "Tracking d'objets", "Restoration d'image", "Upscaling vidéo"
];
const pricingDetails = [
  "Gratuit pour usage personnel",
  "À partir de 9,99$/mois",
  "Freemium avec fonctionnalités avancées payantes",
  "Offre d'essai gratuite de 14 jours",
  "Version Pro à 19,99$/mois",
  "Contacter l'équipe pour un devis personnalisé",
  "Tarification basée sur l'usage",
  "Plan entreprise disponible",
  "5$/mois pour les utilisateurs réguliers",
  "Version gratuite limitée, Pro à 29$/mois",
  "Tarification flexible selon les besoins",
  "Gratuit pour les étudiants, 15$/mois pour les professionnels"
];

// Catégories prédéfinies
const categories = [
  { name: "Génération d'images", slug: "generation-images", description: "Outils IA pour créer des images à partir de descriptions textuelles" },
  { name: "Édition vidéo", slug: "edition-video", description: "Outils IA pour éditer et améliorer des vidéos" },
  { name: "Montage automatique", slug: "montage-automatique", description: "Outils IA pour automatiser le montage vidéo" },
  { name: "Traitement audio", slug: "traitement-audio", description: "Outils IA pour analyser et manipuler l'audio" },
  { name: "Animation", slug: "animation", description: "Outils IA pour créer des animations" },
  { name: "Effets spéciaux", slug: "effets-speciaux", description: "Outils IA pour ajouter des effets spéciaux aux médias" },
  { name: "Transcription", slug: "transcription", description: "Outils IA pour transcrire l'audio en texte" },
  { name: "Sous-titrage", slug: "sous-titrage", description: "Outils IA pour générer des sous-titres" },
  { name: "Voix off", slug: "voix-off", description: "Outils IA pour créer des voix synthétiques" },
  { name: "Marketing vidéo", slug: "marketing-video", description: "Outils IA pour optimiser le marketing vidéo" },
];

// Tags prédéfinis
const tags = [
  { name: "Gratuit", slug: "gratuit" },
  { name: "Débutant", slug: "debutant" },
  { name: "Professionnel", slug: "professionnel" },
  { name: "Temps Réel", slug: "temps-reel" },
  { name: "YouTube", slug: "youtube" },
  { name: "TikTok", slug: "tiktok" },
  { name: "Instagram", slug: "instagram" },
  { name: "Cinéma", slug: "cinema" },
  { name: "Animation 3D", slug: "animation-3d" },
  { name: "Motion Design", slug: "motion-design" },
  { name: "Open Source", slug: "open-source" },
  { name: "IA Générative", slug: "ia-generative" }
];

// Types d'utilisateurs prédéfinis
const userTypes = [
  { name: "Créateurs de Contenu", slug: "createurs-de-contenu" },
  { name: "YouTubers", slug: "youtubers" },
  { name: "Monteurs Vidéo", slug: "monteurs-video" },
  { name: "Réalisateurs", slug: "realisateurs" },
  { name: "Streamers", slug: "streamers" },
  { name: "Motion Designers", slug: "motion-designers" },
  { name: "Animateurs", slug: "animateurs" },
  { name: "Entreprises", slug: "entreprises" },
  { name: "Marketeurs", slug: "marketeurs" },
  { name: "Étudiants", slug: "etudiants" }
];

// Générer une description basée sur la catégorie
function generateDescription(categoryIndex) {
  const descriptions = [
    "Solution IA pour générer des images de haute qualité à partir de descriptions textuelles",
    "Plateforme d'édition vidéo assistée par IA offrant des fonctionnalités avancées pour créateurs",
    "Outil de montage vidéo automatisé permettant de créer des vidéos professionnelles rapidement",
    "Solution IA pour nettoyer, améliorer et transformer vos fichiers audio avec une qualité professionnelle",
    "Plateforme d'animation IA permettant de créer et animer des personnages et des scènes facilement",
    "Suite d'outils pour ajouter des effets spéciaux impressionnants à vos vidéos grâce à l'IA",
    "Logiciel de transcription audio alimenté par l'IA offrant une précision remarquable",
    "Outil de génération automatique de sous-titres précis pour vos vidéos",
    "Technologie de synthèse vocale pour créer des voix off de qualité professionnelle",
    "Suite d'outils IA pour optimiser vos vidéos marketing et maximiser leur impact"
  ];
  return descriptions[categoryIndex % descriptions.length];
}

// Fonction utilitaire pour attendre X millisecondes
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Nombre total d'outils à générer
const TOTAL_TOOLS = 1885;

async function main() {
  console.log(`🌱 Début du processus de seed pour générer ${TOTAL_TOOLS} outils...`);
  
  // Créer un utilisateur admin
  console.log("👤 Création de l'utilisateur admin...");
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN'
    },
  });
  
  // Créer les catégories
  console.log('📂 Création des catégories...');
  const createdCategories = await Promise.all(
    categories.map(async (category) => {
      return prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      });
    })
  );
  
  // Créer les tags
  console.log('🏷️ Création des tags...');
  const createdTags = await Promise.all(
    tags.map(async (tag) => {
      return prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: {
          name: tag.name,
          slug: tag.slug,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      });
    })
  );
  
  // Créer les types d'utilisateurs
  console.log("👥 Création des types d'utilisateurs...");
  const createdUserTypes = await Promise.all(
    userTypes.map(async (userType) => {
      return prisma.userType.upsert({
        where: { slug: userType.slug },
        update: {},
        create: {
          name: userType.name,
          slug: userType.slug,
          description: `Pour les ${userType.name.toLowerCase()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      });
    })
  );
  
  // Créer les fonctionnalités
  console.log('🔧 Création des fonctionnalités...');
  const createdFeatures = await Promise.all(
    features.map(async (feature, index) => {
      const slug = feature.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
      return prisma.feature.upsert({
        where: { slug },
        update: {},
        create: {
          name: feature,
          slug,
          description: `Fonctionnalité permettant ${feature.toLowerCase()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      });
    })
  );
  
  // Génération des 1885 outils en batch
  console.log(`🛠️ Génération de ${TOTAL_TOOLS} outils...`);
  
  // Génération par lots pour éviter de saturer la mémoire et les timeouts
  const BATCH_SIZE = 25; // Réduit de 100 à 25
  const batches = Math.ceil(TOTAL_TOOLS / BATCH_SIZE);
  
  for (let batch = 0; batch < batches; batch++) {
    const startIndex = batch * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, TOTAL_TOOLS);
    console.log(`💾 Traitement du lot ${batch + 1}/${batches} (outils ${startIndex + 1} à ${endIndex})...`);
    
    const toolsPromises = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      // Générer un nom unique pour chaque outil
      const nameIndex1 = i % aiNames.length;
      const nameIndex2 = Math.floor(i / aiNames.length) % domains.length;
      const name = `${aiNames[nameIndex1]} ${domains[nameIndex2]} ${Math.floor(i / (aiNames.length * domains.length))}`;
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Choisir une catégorie, un type de prix et des détails de prix
      const categoryIndex = i % categories.length;
      const pricingTypeIndex = i % 3; // Distribuer équitablement entre FREE, FREEMIUM, PAID
      const pricingType = Object.values(PricingType)[pricingTypeIndex];
      const pricingDetail = pricingDetails[i % pricingDetails.length];
      
      // Générer une description basée sur la catégorie
      const description = generateDescription(categoryIndex);
      
      // Créer l'outil
      const toolPromise = prisma.tool.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
          description,
          logoUrl: `/images/tools/generated-${i % 20 + 1}.png`,
          websiteUrl: `https://www.${slug}.ai`,
          features: `${features[i % 10]}, ${features[(i + 5) % features.length]}, ${features[(i + 10) % features.length]}`,
          pricingType,
          pricingDetails: pricingDetail,
          isActive: true,
          hasAffiliateProgram: i % 5 === 0, // 20% ont un programme d'affiliation
          createdAt: new Date(Date.now() - Math.random() * 10000000000),
          updatedAt: new Date()
        },
      }).then(async (tool) => {
        // Ajouter des relations avec les catégories (1-2 catégories par outil)
        const categoryCount = (i % 2) + 1;
        const categoryPromises = [];
        for (let j = 0; j < categoryCount; j++) {
          const categoryIndex = (i + j) % createdCategories.length;
          categoryPromises.push(
            prisma.categoriesOnTools.upsert({
              where: {
                toolId_categoryId: {
                  toolId: tool.id,
                  categoryId: createdCategories[categoryIndex].id
                }
              },
              update: {},
              create: {
                toolId: tool.id,
                categoryId: createdCategories[categoryIndex].id
              }
            })
          );
        }
        
        // Ajouter des relations avec les tags (2-4 tags par outil)
        const tagCount = (i % 3) + 2;
        const tagPromises = [];
        for (let j = 0; j < tagCount; j++) {
          const tagIndex = (i + j) % createdTags.length;
          tagPromises.push(
            prisma.tagsOnTools.upsert({
              where: {
                toolId_tagId: {
                  toolId: tool.id,
                  tagId: createdTags[tagIndex].id
                }
              },
              update: {},
              create: {
                toolId: tool.id,
                tagId: createdTags[tagIndex].id
              }
            })
          );
        }
        
        // Ajouter des relations avec les fonctionnalités (2-4 fonctionnalités par outil)
        const featureCount = (i % 3) + 2;
        const featurePromises = [];
        for (let j = 0; j < featureCount; j++) {
          const featureIndex = (i + j) % createdFeatures.length;
          featurePromises.push(
            prisma.featuresOnTools.upsert({
              where: {
                toolId_featureId: {
                  toolId: tool.id,
                  featureId: createdFeatures[featureIndex].id
                }
              },
              update: {},
              create: {
                toolId: tool.id,
                featureId: createdFeatures[featureIndex].id
              }
            })
          );
        }
        
        // Ajouter des relations avec les types d'utilisateurs (1-2 types par outil)
        const userTypeCount = (i % 2) + 1;
        const userTypePromises = [];
        for (let j = 0; j < userTypeCount; j++) {
          const userTypeIndex = (i + j) % createdUserTypes.length;
          userTypePromises.push(
            prisma.userTypesOnTools.upsert({
              where: {
                toolId_userTypeId: {
                  toolId: tool.id,
                  userTypeId: createdUserTypes[userTypeIndex].id
                }
              },
              update: {},
              create: {
                toolId: tool.id,
                userTypeId: createdUserTypes[userTypeIndex].id
              }
            })
          );
        }
        
        // Ajouter quelques avis pour 20% des outils
        const reviewPromises = [];
        if (i % 5 === 0) {
          const reviewCount = (i % 3) + 1;
          for (let j = 0; j < reviewCount; j++) {
            reviewPromises.push(
              prisma.review.upsert({
                where: { id: `review-${i}-${j}` },
                update: {},
                create: {
                  id: `review-${i}-${j}`,
                  title: `Avis sur ${name}`,
                  content: `C'est un excellent outil pour ${description.toLowerCase()}.`,
                  rating: 3.5 + (j % 2),
                  userEmail: `user${i % 100}@example.com`,
                  userName: `Utilisateur ${i % 100}`,
                  toolId: tool.id,
                  createdAt: new Date(Date.now() - Math.random() * 5000000000),
                  updatedAt: new Date()
                }
              })
            );
          }
        }
        
        // Exécuter toutes les promesses de relations en parallèle
        await Promise.all([
          ...categoryPromises,
          ...tagPromises,
          ...featurePromises,
          ...userTypePromises,
          ...reviewPromises
        ]);
        
        return tool;
      });
      
      toolsPromises.push(toolPromise);
    }
    
    // Attendre la fin de toutes les opérations du lot
    await Promise.all(toolsPromises);
    
    // Ajouter un délai entre les lots pour éviter de surcharger la BD
    if (batch < batches - 1) {
      console.log(`⏱️ Pause de 2 secondes avant le lot suivant...`);
      await sleep(2000);
    }
  }
  
  console.log(`✅ Base de données remplie avec succès avec ${TOTAL_TOOLS} outils!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 