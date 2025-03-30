const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

async function main() {
  console.log('Création du système de tags...');

  const tags = [
    // Caractéristiques techniques
    { name: 'Intelligence Artificielle Générative', slug: 'ia-generative' },
    { name: 'Deep Learning', slug: 'deep-learning' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Traitement du Langage Naturel', slug: 'nlp' },
    { name: 'Vision par Ordinateur', slug: 'computer-vision' },
    { name: 'API', slug: 'api' },
    { name: 'Open Source', slug: 'open-source' },
    { name: 'Intégration Discord', slug: 'discord-integration' },
    { name: 'Cloud', slug: 'cloud' },

    // Formats vidéo
    { name: 'Vidéo HD', slug: 'hd-video' },
    { name: 'Vidéo 4K', slug: '4k-video' },
    { name: 'Vidéo 8K', slug: '8k-video' },
    { name: 'Shorts', slug: 'shorts' },
    { name: 'Réels', slug: 'reels' },
    { name: 'Format Vertical', slug: 'vertical-format' },
    { name: 'Format Horizontal', slug: 'horizontal-format' },
    { name: 'Format Carré', slug: 'square-format' },

    // Cas d'utilisation
    { name: 'Marketing', slug: 'marketing' },
    { name: 'E-commerce', slug: 'e-commerce' },
    { name: 'Réseaux Sociaux', slug: 'social-media' },
    { name: 'YouTube', slug: 'youtube' },
    { name: 'TikTok', slug: 'tiktok' },
    { name: 'Instagram', slug: 'instagram' },
    { name: 'LinkedIn', slug: 'linkedin' },
    { name: 'Twitter/X', slug: 'twitter-x' },
    { name: 'Enseignement', slug: 'education' },
    { name: 'Entreprise', slug: 'enterprise' },
    { name: 'Cinéma', slug: 'cinema' },
    { name: 'Jeux Vidéo', slug: 'gaming' },
    { name: 'Publicité', slug: 'advertising' },
    { name: 'Contenu Automatisé', slug: 'automated-content' },
    { name: 'Storytelling', slug: 'storytelling' },
    { name: 'Divertissement', slug: 'entertainment' },

    // Fonctionnalités spécifiques
    { name: 'Sous-titres Automatiques', slug: 'automatic-subtitles' },
    { name: 'Traduction', slug: 'translation' },
    { name: 'Doublage', slug: 'dubbing' },
    { name: 'Synthèse Vocale', slug: 'text-to-speech' },
    { name: 'Reconnaissance Vocale', slug: 'speech-to-text' },
    { name: 'Avatars Virtuels', slug: 'virtual-avatars' },
    { name: 'Humains Virtuels', slug: 'virtual-humans' },
    { name: 'Mouvement', slug: 'motion' },
    { name: 'Animation', slug: 'animation' },
    { name: 'Effets Spéciaux', slug: 'special-effects' },
    { name: '3D', slug: '3d' },
    { name: 'Réalité Augmentée', slug: 'augmented-reality' },
    { name: 'Réalité Virtuelle', slug: 'virtual-reality' },
    { name: 'Deepfake', slug: 'deepfake' },
    { name: 'Face Swap', slug: 'face-swap' },
    { name: 'Stylisation', slug: 'stylization' },
    { name: 'Amélioration Vidéo', slug: 'video-enhancement' },
    { name: 'Upscaling', slug: 'upscaling' },
    { name: 'Stabilisation', slug: 'stabilization' },
    { name: 'Interpolation', slug: 'interpolation' },
    { name: 'Personnes Réelles', slug: 'real-people' },
    { name: 'Suppression de Bruit', slug: 'noise-removal' },
    { name: 'Compression', slug: 'compression' },
    { name: 'Changement de Voix', slug: 'voice-changing' },
    { name: 'Suppression d\'Arrière-plan', slug: 'background-removal' },
    { name: 'Inpainting Vidéo', slug: 'video-inpainting' },
    { name: 'Rotoscopie', slug: 'rotoscoping' },
    { name: 'Chroma Key', slug: 'chroma-key' },
    { name: 'Montage Automatique', slug: 'auto-editing' },
    { name: 'Édition Non-Destructive', slug: 'non-destructive-editing' },
    { name: 'Édition Basée sur le Texte', slug: 'text-based-editing' },
    
    // Autres caractéristiques
    { name: 'Sans Code', slug: 'no-code' },
    { name: 'Débutant', slug: 'beginner-friendly' },
    { name: 'Professionnel', slug: 'professional' },
    { name: 'Temps Réel', slug: 'real-time' },
    { name: 'Personnalisation', slug: 'customization' },
    { name: 'Collaboration', slug: 'collaboration' },
    { name: 'Multi-langues', slug: 'multi-language' },
    { name: 'Multiplateforme', slug: 'multi-platform' },
    { name: 'Mobile', slug: 'mobile' },
    { name: 'Web', slug: 'web' },
    { name: 'Windows', slug: 'windows' },
    { name: 'Mac', slug: 'mac' },
    { name: 'Linux', slug: 'linux' },
    { name: 'Plugin', slug: 'plugin' },
    { name: 'Extension', slug: 'extension' },
    
    // Modèles de tarification
    { name: 'Gratuit', slug: 'free' },
    { name: 'Freemium', slug: 'freemium' },
    { name: 'Abonnement', slug: 'subscription' },
    { name: 'Paiement Unique', slug: 'one-time-payment' },
    { name: 'Basé sur l\'Usage', slug: 'usage-based' },
    { name: 'Essai Gratuit', slug: 'free-trial' },
    { name: 'Plan Entreprise', slug: 'enterprise-plan' }
  ];

  // Création des tags pour chaque tag dans la liste
  for (const tag of tags) {
    try {
      // Vérifier si le tag existe déjà
      const existingTag = await prisma.tag.findUnique({
        where: { slug: tag.slug }
      });

      if (!existingTag) {
        // Créer le tag s'il n'existe pas
        await prisma.tag.create({
          data: {
            name: tag.name,
            slug: tag.slug
          }
        });
        console.log(`Tag créé: ${tag.name}`);
      } else {
        console.log(`Le tag existe déjà: ${tag.name}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la création du tag ${tag.name}:`, error);
    }
  }

  console.log('Système de tags créé avec succès!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 