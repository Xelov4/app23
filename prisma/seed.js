const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Définition des types d'enum utilisés par Prisma
const PricingType = {
  FREE: "FREE",
  FREEMIUM: "FREEMIUM",
  PAID: "PAID",
  CONTACT: "CONTACT"
};

async function main() {
  // Créer ou récupérer les catégories
  const categoriesData = [
    { name: "Génération d'images", slug: "generation-images", description: "Outils IA pour créer des images à partir de descriptions textuelles" },
    { name: "Édition vidéo", slug: "edition-video", description: "Outils IA pour éditer et améliorer des vidéos" },
    { name: "Montage automatique", slug: "montage-automatique", description: "Outils IA pour automatiser le montage vidéo" },
    { name: "Traitement audio", slug: "traitement-audio", description: "Outils IA pour analyser et manipuler l'audio" },
    { name: "Animation", slug: "animation", description: "Outils IA pour créer des animations" },
    { name: "Effets spéciaux", slug: "effets-speciaux", description: "Outils IA pour ajouter des effets spéciaux aux médias" }
  ];

  const categories = await Promise.all(
    categoriesData.map(async (category) => {
      return prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
    })
  );

  // Liste de base d'outils
  const toolsBase = [
    {
      name: "Midjourney",
      slug: "midjourney",
      description: "Générateur d'images IA offrant des résultats artistiques exceptionnels via une interface Discord.",
      logoUrl: "/images/tools/midjourney.png",
      websiteUrl: "https://www.midjourney.com",
      pricingType: PricingType.PAID,
      pricingDetails: "À partir de 10$/mois",
      features: ["Génération d'images haute résolution", "Interface Discord", "Styles artistiques variés"],
    },
    {
      name: "DALL-E 3",
      slug: "dall-e-3",
      description: "Modèle de génération d'images d'OpenAI offrant des résultats photoréalistes à partir de descriptions textuelles.",
      logoUrl: "/images/tools/dall-e.png",
      websiteUrl: "https://openai.com/dall-e-3",
      pricingType: PricingType.PAID,
      pricingDetails: "Usage basé sur les crédits",
      features: ["Génération photoréaliste", "Haute résolution", "Intégration ChatGPT"],
    },
    {
      name: "Runway",
      slug: "runway",
      description: "Suite d'outils IA pour la création visuelle, permettant la génération de vidéos à partir de texte et l'édition avancée.",
      logoUrl: "/images/tools/runway.png",
      websiteUrl: "https://runwayml.com",
      pricingType: PricingType.FREEMIUM,
      pricingDetails: "Version gratuite limitée, Pro à partir de 15$/mois",
      features: ["Génération de vidéos", "Rotoscopie automatique", "Inpainting vidéo"],
    },
    {
      name: "Descript",
      slug: "descript",
      description: "Plateforme d'édition vidéo basée sur le texte, permettant de monter vos vidéos aussi facilement qu'un document texte.",
      logoUrl: "/images/tools/descript.png",
      websiteUrl: "https://www.descript.com",
      pricingType: PricingType.FREEMIUM,
      pricingDetails: "Pro à partir de 12$/mois",
      features: ["Montage basé sur le texte", "Suppression des hésitations", "Clonage vocal"],
    },
    {
      name: "Stable Diffusion",
      slug: "stable-diffusion",
      description: "Modèle open-source de génération d'images offrant une grande personnalisation et flexibilité.",
      logoUrl: "/images/tools/stable-diffusion.png",
      websiteUrl: "https://stability.ai",
      pricingType: PricingType.FREE,
      pricingDetails: "Open source et gratuit",
      features: ["Open-source", "Installation locale possible", "Communauté active"],
    },
    {
      name: "Pika Labs",
      slug: "pika-labs",
      description: "Outil de création de vidéos génératives à partir de prompts textuels, accessible via Discord.",
      logoUrl: "/images/tools/pika-labs.png",
      websiteUrl: "https://www.pika.art",
      pricingType: PricingType.FREEMIUM,
      pricingDetails: "Version Pro à 8$/mois",
      features: ["Génération de vidéos à partir de texte", "Interface Discord", "Animation de personnages"],
    },
    {
      name: "ElevenLabs",
      slug: "elevenlabs",
      description: "Plateforme de synthèse vocale IA permettant de créer des voix réalistes et expressives.",
      logoUrl: "/images/tools/elevenlabs.png",
      websiteUrl: "https://elevenlabs.io",
      pricingType: PricingType.FREEMIUM,
      pricingDetails: "5000 caractères gratuits, puis à partir de 5$/mois",
      features: ["Voix réalistes", "Clonage vocal", "API disponible"],
    },
    {
      name: "Synthesia",
      slug: "synthesia",
      description: "Créez des vidéos professionnelles avec présentateurs virtuels générés par IA, sans équipement ni acteurs.",
      logoUrl: "/images/tools/synthesia.png",
      websiteUrl: "https://www.synthesia.io",
      pricingType: PricingType.PAID,
      pricingDetails: "À partir de 30$/mois",
      features: ["Avatars réalistes", "Support multilingue", "Personnalisation complète"],
    },
    {
      name: "Adobe Podcast",
      slug: "adobe-podcast",
      description: "Suite d'outils audio IA d'Adobe pour améliorer l'enregistrement, nettoyer le son et générer du contenu.",
      logoUrl: "/images/tools/adobe-podcast.png",
      websiteUrl: "https://podcast.adobe.com",
      pricingType: PricingType.FREEMIUM,
      pricingDetails: "Version beta gratuite",
      features: ["Amélioration vocale", "Suppression de bruit", "Édition intelligente"],
    },
    {
      name: "D-ID",
      slug: "d-id",
      description: "Technologie d'animation de photos et création d'avatars parlants pour contenu vidéo personnalisé.",
      logoUrl: "/images/tools/d-id.png",
      websiteUrl: "https://www.d-id.com",
      pricingType: PricingType.PAID,
      pricingDetails: "À partir de 25$/mois",
      features: ["Animation de photos", "Avatars parlants", "Personnalisation faciale"],
    }
  ];

  // Créer des catégories pour chaque outil
  const toolToCategory = {
    "midjourney": 0, // Génération d'images
    "dall-e-3": 0,
    "stable-diffusion": 0,
    "runway": 1, // Édition vidéo
    "pika-labs": 1,
    "descript": 2, // Montage automatique
    "elevenlabs": 3, // Traitement audio
    "adobe-podcast": 3,
    "synthesia": 4, // Animation
    "d-id": 4
  };

  // Liste des slugs pour vérification
  const predefinedSlugs = Object.keys(toolToCategory);

  // Générer des outils supplémentaires jusqu'à 50
  const toolsData = [...toolsBase];
  const aiNames = ["AI", "Vision", "Creator", "Gen", "Neural", "Deep", "Smart", "Synth", "Auto", "Flux", "Pro", "Nova", "Max", "Ultra"];
  const domains = ["Image", "Video", "Audio", "Media", "Pic", "Frame", "Sound", "Voice", "Motion", "Visual", "Scene", "Studio"];
  const features = [
    "Haute résolution", "Export multi-format", "Édition par lot", "Interface intuitive", "Partage facilité", 
    "Intelligence contextuelle", "Styles personnalisables", "Traitement rapide", "Mode hors-ligne", 
    "Reconnaissance d'objets", "Effets temps réel", "Analyse sémantique", "Intégration cloud", 
    "Correction automatique", "Filtres avancés", "Modèles pré-entraînés", "API disponible", 
    "Retouche intelligente", "Conversion de formats", "Collaboration en temps réel"
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
    "5$/mois pour les utilisateurs réguliers"
  ];

  for (let i = toolsBase.length; i < 50; i++) {
    const name = `${aiNames[Math.floor(Math.random() * aiNames.length)]} ${domains[Math.floor(Math.random() * domains.length)]}`;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Générer un type de prix aléatoire (on évite CONTACT qui n'est pas dans le schéma)
    const pricingTypes = [PricingType.FREE, PricingType.FREEMIUM, PricingType.PAID];
    const pricingType = pricingTypes[Math.floor(Math.random() * pricingTypes.length)];
    
    // Sélection aléatoire de 3-5 fonctionnalités
    const featureCount = Math.floor(Math.random() * 3) + 3;
    const toolFeatures = [];
    const usedIndexes = new Set();
    
    while (toolFeatures.length < featureCount) {
      const index = Math.floor(Math.random() * features.length);
      if (!usedIndexes.has(index)) {
        usedIndexes.add(index);
        toolFeatures.push(features[index]);
      }
    }

    const categoryIndex = Math.floor(Math.random() * categories.length);
    let description = "";
    
    switch (categoryIndex) {
      case 0: // Génération d'images
        description = `Solution IA pour générer des images de haute qualité à partir de descriptions textuelles ou d'esquisses`;
        break;
      case 1: // Édition vidéo
        description = `Plateforme d'édition vidéo assistée par IA offrant des fonctionnalités avancées pour créateurs de contenu`;
        break;
      case 2: // Montage automatique
        description = `Outil de montage vidéo automatisé permettant de créer des vidéos professionnelles en quelques minutes`;
        break;
      case 3: // Traitement audio
        description = `Solution IA pour nettoyer, améliorer et transformer vos fichiers audio avec une qualité professionnelle`;
        break;
      case 4: // Animation
        description = `Plateforme d'animation IA permettant de créer et animer des personnages et des scènes facilement`;
        break;
      case 5: // Effets spéciaux
        description = `Suite d'outils pour ajouter des effets spéciaux impressionnants à vos vidéos grâce à l'IA`;
        break;
      default:
        description = `Solution IA pour optimiser vos processus créatifs et améliorer la qualité de vos contenus`;
    }

    toolsData.push({
      name,
      slug,
      description,
      logoUrl: `/images/tools/${slug}.png`,
      websiteUrl: `https://www.${slug}.ai`,
      pricingType,
      pricingDetails: pricingDetails[Math.floor(Math.random() * pricingDetails.length)],
      features: toolFeatures,
    });
  }

  // Insérer tous les outils dans la base de données
  for (const tool of toolsData) {
    // Créer l'outil
    const createdTool = await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: tool,
      create: tool
    });

    // Déterminer la catégorie pour l'outil
    let categoryId;
    if (predefinedSlugs.includes(tool.slug)) {
      // Pour les outils prédéfinis, utiliser la catégorie spécifiée
      const categoryIndex = toolToCategory[tool.slug];
      categoryId = categories[categoryIndex].id;
    } else {
      // Pour les outils générés aléatoirement, choisir une catégorie au hasard
      categoryId = categories[Math.floor(Math.random() * categories.length)].id;
    }

    // Créer la relation entre l'outil et la catégorie
    await prisma.categoriesOnTools.upsert({
      where: {
        toolId_categoryId: {
          toolId: createdTool.id,
          categoryId: categoryId
        }
      },
      update: {},
      create: {
        toolId: createdTool.id,
        categoryId: categoryId
      }
    });
  }

  console.log("Base de données remplie avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 