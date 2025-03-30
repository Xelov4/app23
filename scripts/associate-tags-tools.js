const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Association des tags aux outils existants...');
  
  // Récupérer tous les outils
  const tools = await prisma.tool.findMany();
  console.log(`Nombre d'outils trouvés: ${tools.length}`);
  
  // Récupérer tous les tags
  const tags = await prisma.tag.findMany();
  console.log(`Nombre de tags trouvés: ${tags.length}`);
  
  // Mappage des tags par slug pour un accès facile
  const tagsBySlug = {};
  tags.forEach(tag => {
    tagsBySlug[tag.slug] = tag.id;
  });
  
  // Règles d'association basées sur les attributs des outils
  const associationRules = [
    // Fonction pour associer les tags de modèle de tarification
    async (tool) => {
      const tagsToAdd = [];
      
      if (tool.pricingType === 'FREE') {
        tagsToAdd.push(tagsBySlug['free']);
      } else if (tool.pricingType === 'FREEMIUM') {
        tagsToAdd.push(tagsBySlug['freemium']);
      } else if (tool.pricingType === 'PAID') {
        // Vérifier s'il s'agit d'un abonnement ou d'un paiement unique
        if (tool.pricingDetails && tool.pricingDetails.toLowerCase().includes('mois')) {
          tagsToAdd.push(tagsBySlug['subscription']);
        } else if (tool.pricingDetails && tool.pricingDetails.toLowerCase().includes('usage')) {
          tagsToAdd.push(tagsBySlug['usage-based']);
        }
      }
      
      return tagsToAdd;
    },
    
    // Fonction pour associer les tags basés sur les caractéristiques (features)
    async (tool) => {
      const tagsToAdd = [];
      let features = [];
      
      try {
        // Tenter de parser les fonctionnalités si elles sont stockées en JSON
        if (tool.features) {
          features = JSON.parse(tool.features);
        }
      } catch (error) {
        console.log(`Impossible de parser les fonctionnalités pour ${tool.name}: ${error.message}`);
      }
      
      // Associer des tags basés sur les fonctionnalités
      if (features.length > 0) {
        for (const feature of features) {
          // Vérifier les mots-clés dans les fonctionnalités
          if (feature.toLowerCase().includes('intelligence artificielle') || feature.toLowerCase().includes('ia générative')) {
            tagsToAdd.push(tagsBySlug['ia-generative']);
          }
          if (feature.toLowerCase().includes('haute résolution') || feature.toLowerCase().includes('hd')) {
            tagsToAdd.push(tagsBySlug['hd-video']);
          }
          if (feature.toLowerCase().includes('4k')) {
            tagsToAdd.push(tagsBySlug['4k-video']);
          }
          if (feature.toLowerCase().includes('sous-titre') || feature.toLowerCase().includes('caption')) {
            tagsToAdd.push(tagsBySlug['automatic-subtitles']);
          }
          if (feature.toLowerCase().includes('temps réel') || feature.toLowerCase().includes('real-time')) {
            tagsToAdd.push(tagsBySlug['real-time']);
          }
          if (feature.toLowerCase().includes('personnalis')) {
            tagsToAdd.push(tagsBySlug['customization']);
          }
          if (feature.toLowerCase().includes('collaboration')) {
            tagsToAdd.push(tagsBySlug['collaboration']);
          }
          // Plus de règles peuvent être ajoutées ici
        }
      }
      
      // Vérifier le nom de l'outil pour associer des tags supplémentaires
      if (tool.name.toLowerCase().includes('deepfake') || tool.description.toLowerCase().includes('deepfake')) {
        tagsToAdd.push(tagsBySlug['deepfake']);
      }
      if (tool.name.toLowerCase().includes('swap') || tool.description.toLowerCase().includes('face swap')) {
        tagsToAdd.push(tagsBySlug['face-swap']);
      }
      if (tool.name.toLowerCase().includes('avatar') || tool.description.toLowerCase().includes('avatar')) {
        tagsToAdd.push(tagsBySlug['virtual-avatars']);
      }
      if (tool.name.toLowerCase().includes('upscale') || tool.description.toLowerCase().includes('upscale')) {
        tagsToAdd.push(tagsBySlug['upscaling']);
      }
      if (tool.name.toLowerCase().includes('stabiliz') || tool.description.toLowerCase().includes('stabiliz')) {
        tagsToAdd.push(tagsBySlug['stabilization']);
      }
      if (tool.description.toLowerCase().includes('discord')) {
        tagsToAdd.push(tagsBySlug['discord-integration']);
      }
      if (tool.description.toLowerCase().includes('open source') || tool.description.toLowerCase().includes('open-source')) {
        tagsToAdd.push(tagsBySlug['open-source']);
      }
      
      // Vérifier la présence de réseaux sociaux
      if (tool.twitterUrl) {
        tagsToAdd.push(tagsBySlug['twitter-x']);
      }
      if (tool.instagramUrl) {
        tagsToAdd.push(tagsBySlug['instagram']);
      }
      if (tool.linkedinUrl) {
        tagsToAdd.push(tagsBySlug['linkedin']);
      }
      
      return tagsToAdd;
    },
    
    // Fonction pour associer des tags basés sur la description
    async (tool) => {
      const tagsToAdd = [];
      
      if (tool.description) {
        const desc = tool.description.toLowerCase();
        
        // Cas d'utilisation
        if (desc.includes('marketing')) {
          tagsToAdd.push(tagsBySlug['marketing']);
        }
        if (desc.includes('e-commerce') || desc.includes('ecommerce')) {
          tagsToAdd.push(tagsBySlug['e-commerce']);
        }
        if (desc.includes('réseaux sociaux') || desc.includes('social media')) {
          tagsToAdd.push(tagsBySlug['social-media']);
        }
        if (desc.includes('youtube')) {
          tagsToAdd.push(tagsBySlug['youtube']);
        }
        if (desc.includes('tiktok')) {
          tagsToAdd.push(tagsBySlug['tiktok']);
        }
        if (desc.includes('entreprise') || desc.includes('business')) {
          tagsToAdd.push(tagsBySlug['enterprise']);
        }
        
        // Fonctionnalités spécifiques
        if (desc.includes('sous-titre') || desc.includes('caption')) {
          tagsToAdd.push(tagsBySlug['automatic-subtitles']);
        }
        if (desc.includes('traduction')) {
          tagsToAdd.push(tagsBySlug['translation']);
        }
        if (desc.includes('doublage') || desc.includes('dubbing')) {
          tagsToAdd.push(tagsBySlug['dubbing']);
        }
        if (desc.includes('texte en parole') || desc.includes('text-to-speech') || desc.includes('synthèse vocale')) {
          tagsToAdd.push(tagsBySlug['text-to-speech']);
        }
        if (desc.includes('reconnaissance vocale') || desc.includes('speech-to-text')) {
          tagsToAdd.push(tagsBySlug['speech-to-text']);
        }
        if (desc.includes('3d')) {
          tagsToAdd.push(tagsBySlug['3d']);
        }
        if (desc.includes('réalité augmentée') || desc.includes('augmented reality')) {
          tagsToAdd.push(tagsBySlug['augmented-reality']);
        }
        if (desc.includes('réalité virtuelle') || desc.includes('virtual reality')) {
          tagsToAdd.push(tagsBySlug['virtual-reality']);
        }
        if (desc.includes('suppression de bruit') || desc.includes('noise removal')) {
          tagsToAdd.push(tagsBySlug['noise-removal']);
        }
        if (desc.includes('suppression d\'arrière-plan') || desc.includes('background removal')) {
          tagsToAdd.push(tagsBySlug['background-removal']);
        }
        if (desc.includes('chroma key') || desc.includes('fond vert')) {
          tagsToAdd.push(tagsBySlug['chroma-key']);
        }
        if (desc.includes('montage automatique')) {
          tagsToAdd.push(tagsBySlug['auto-editing']);
        }
        if (desc.includes('basé sur le texte') || desc.includes('text-based')) {
          tagsToAdd.push(tagsBySlug['text-based-editing']);
        }
        
        // Caractéristiques générales
        if (desc.includes('sans code') || desc.includes('no-code')) {
          tagsToAdd.push(tagsBySlug['no-code']);
        }
        if (desc.includes('débutant') || desc.includes('beginner')) {
          tagsToAdd.push(tagsBySlug['beginner-friendly']);
        }
        if (desc.includes('professionnel') || desc.includes('professional')) {
          tagsToAdd.push(tagsBySlug['professional']);
        }
        if (desc.includes('temps réel') || desc.includes('real-time')) {
          tagsToAdd.push(tagsBySlug['real-time']);
        }
        if (desc.includes('multi-langues') || desc.includes('multilingual')) {
          tagsToAdd.push(tagsBySlug['multi-language']);
        }
      }
      
      return tagsToAdd;
    },
    
    // Fonction pour associer des tags basés sur les catégories existantes
    async (tool) => {
      const tagsToAdd = [];
      
      // Récupérer les catégories associées à l'outil
      const toolWithCategories = await prisma.tool.findUnique({
        where: { id: tool.id },
        include: {
          CategoriesOnTools: {
            include: {
              Category: true
            }
          }
        }
      });
      
      // Associer des tags basés sur les catégories
      if (toolWithCategories && toolWithCategories.CategoriesOnTools) {
        for (const categoryRel of toolWithCategories.CategoriesOnTools) {
          const category = categoryRel.Category;
          
          if (category) {
            if (category.slug === 'generation-images' || category.slug === 'generation-video') {
              tagsToAdd.push(tagsBySlug['ia-generative']);
            }
            if (category.slug === 'edition-video') {
              tagsToAdd.push(tagsBySlug['video-enhancement']);
            }
            if (category.slug === 'animation') {
              tagsToAdd.push(tagsBySlug['animation']);
            }
            if (category.slug === 'effets-speciaux') {
              tagsToAdd.push(tagsBySlug['special-effects']);
            }
            if (category.slug === 'traitement-audio') {
              tagsToAdd.push(tagsBySlug['speech-to-text']);
            }
            if (category.slug === 'texte-en-video') {
              tagsToAdd.push(tagsBySlug['text-based-editing']);
            }
            if (category.slug === 'videos-personnalisees') {
              tagsToAdd.push(tagsBySlug['customization']);
            }
          }
        }
      }
      
      return tagsToAdd;
    }
  ];
  
  // Appliquer les règles d'association à chaque outil
  for (const tool of tools) {
    console.log(`Traitement de l'outil: ${tool.name}`);
    
    // Ensemble pour stocker les IDs de tags uniques à associer
    const tagsToAssociate = new Set();
    
    // Appliquer chaque règle
    for (const rule of associationRules) {
      const tagIds = await rule(tool);
      tagIds.forEach(id => {
        if (id) tagsToAssociate.add(id);
      });
    }
    
    // Supprimer les associations existantes
    await prisma.tagsOnTools.deleteMany({
      where: { toolId: tool.id }
    });
    
    // Créer les nouvelles associations
    if (tagsToAssociate.size > 0) {
      const tagIdsArray = Array.from(tagsToAssociate);
      
      for (const tagId of tagIdsArray) {
        await prisma.tagsOnTools.create({
          data: {
            toolId: tool.id,
            tagId: tagId
          }
        });
      }
      
      console.log(`${tagIdsArray.length} tags associés à ${tool.name}`);
    } else {
      console.log(`Aucun tag associé à ${tool.name}`);
    }
  }
  
  console.log('Association des tags aux outils terminée avec succès!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 