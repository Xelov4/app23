const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

async function main() {
  console.log('Création et mise à jour du système de catégories...');

  const categories = [
    {
      name: 'Génération de vidéo',
      slug: 'generation-video',
      description: 'Outils d\'IA pour créer des vidéos complètes à partir de texte, d\'images ou d\'autres médias.',
      imageUrl: null
    },
    {
      name: 'Édition vidéo',
      slug: 'edition-video',
      description: 'Outils d\'IA pour modifier, améliorer et transformer des vidéos existantes.',
      imageUrl: null
    },
    {
      name: 'Montage automatique',
      slug: 'montage-automatique',
      description: 'Outils d\'IA qui automatisent le processus de montage vidéo, sélectionnant et assemblant les meilleures séquences.',
      imageUrl: null
    },
    {
      name: 'Traitement audio',
      slug: 'traitement-audio',
      description: 'Outils d\'IA pour améliorer, modifier ou extraire l\'audio des vidéos, y compris la suppression de bruit et l\'amélioration de la voix.',
      imageUrl: null
    },
    {
      name: 'Animation',
      slug: 'animation',
      description: 'Outils d\'IA pour créer ou améliorer des animations, y compris l\'animation 2D et 3D.',
      imageUrl: null
    },
    {
      name: 'Effets spéciaux',
      slug: 'effets-speciaux',
      description: 'Outils d\'IA pour ajouter des effets visuels et des transformations créatives aux vidéos.',
      imageUrl: null
    },
    {
      name: 'Avatars et humains virtuels',
      slug: 'avatars-humains-virtuels',
      description: 'Outils d\'IA pour créer et animer des présentateurs, avatars et personnages virtuels dans les vidéos.',
      imageUrl: null
    },
    {
      name: 'Texte en vidéo',
      slug: 'texte-en-video',
      description: 'Outils d\'IA qui transforment du texte en contenu vidéo, y compris la génération de scripts et de storyboards.',
      imageUrl: null
    },
    {
      name: 'Sous-titrage et transcription',
      slug: 'sous-titrage-transcription',
      description: 'Outils d\'IA pour automatiquement générer des sous-titres, des transcriptions et des légendes pour les vidéos.',
      imageUrl: null
    },
    {
      name: 'Vidéos personnalisées',
      slug: 'videos-personnalisees',
      description: 'Outils d\'IA pour créer des vidéos personnalisées adaptées à des individus ou des audiences spécifiques.',
      imageUrl: null
    },
    {
      name: 'Amélioration vidéo',
      slug: 'amelioration-video',
      description: 'Outils d\'IA pour augmenter la résolution, améliorer la qualité et stabiliser les vidéos.',
      imageUrl: null
    },
    {
      name: 'Analyse vidéo',
      slug: 'analyse-video',
      description: 'Outils d\'IA pour analyser le contenu des vidéos, extraire des informations et générer des insights.',
      imageUrl: null
    },
    {
      name: 'Marketing vidéo',
      slug: 'marketing-video',
      description: 'Outils d\'IA spécialisés dans la création de contenu vidéo optimisé pour le marketing et la publicité.',
      imageUrl: null
    },
    {
      name: 'Réseaux sociaux',
      slug: 'reseaux-sociaux',
      description: 'Outils d\'IA pour créer et adapter des vidéos aux formats populaires sur les réseaux sociaux (Shorts, Reels, TikTok).',
      imageUrl: null
    },
    {
      name: 'Présentation et explications',
      slug: 'presentation-explications',
      description: 'Outils d\'IA pour créer des vidéos explicatives, des tutoriels et des présentations visuelles.',
      imageUrl: null
    }
  ];

  // Création ou mise à jour des catégories
  for (const category of categories) {
    try {
      // Vérifier si la catégorie existe déjà
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (!existingCategory) {
        // Créer la catégorie si elle n'existe pas
        await prisma.category.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            imageUrl: category.imageUrl
          }
        });
        console.log(`Catégorie créée: ${category.name}`);
      } else {
        // Mettre à jour la catégorie existante
        await prisma.category.update({
          where: { slug: category.slug },
          data: {
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl || existingCategory.imageUrl
          }
        });
        console.log(`Catégorie mise à jour: ${category.name}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la gestion de la catégorie ${category.name}:`, error);
    }
  }

  console.log('Système de catégories créé et mis à jour avec succès!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 