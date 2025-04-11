// Données de test pour le script de seeding

const users = [
  {
    email: 'admin@video-ia.net',
    name: 'Admin',
    password: 'admin123', // Sera hashé dans le script de seed
    role: 'ADMIN'
  },
  {
    email: 'editor@video-ia.net',
    name: 'Éditeur',
    password: 'editor123',
    role: 'EDITOR'
  },
  {
    email: 'user1@example.com',
    name: 'User Test',
    password: 'user123',
    role: 'USER'
  }
];

const categories = [
  {
    name: 'Édition Vidéo',
    slug: 'edition-video',
    description: 'Outils d\'IA pour l\'édition et le montage vidéo',
    iconName: 'VideoIcon'
  },
  {
    name: 'Génération Vidéo',
    slug: 'generation-video',
    description: 'Créer des vidéos à partir de texte ou d\'images avec l\'IA',
    iconName: 'FilmIcon'
  },
  {
    name: 'Animation',
    slug: 'animation',
    description: 'Animer des personnages ou des objets avec l\'intelligence artificielle',
    iconName: 'ActivityIcon'
  },
  {
    name: 'Sous-titrage',
    slug: 'sous-titrage',
    description: 'Générer et traduire des sous-titres automatiquement',
    iconName: 'TypeIcon'
  },
  {
    name: 'Effets Spéciaux',
    slug: 'effets-speciaux',
    description: 'Création d\'effets visuels et de VFX avec l\'IA',
    iconName: 'SparklesIcon'
  },
  {
    name: 'Voix Off',
    slug: 'voix-off',
    description: 'Synthèse vocale et narration IA pour vos vidéos',
    iconName: 'MicIcon'
  },
  {
    name: 'Analyse Vidéo',
    slug: 'analyse-video',
    description: 'Analyse de contenu vidéo et extraction de données',
    iconName: 'BarChartIcon'
  },
  {
    name: 'Marketing Vidéo',
    slug: 'marketing-video',
    description: 'Outils pour optimiser vos campagnes marketing vidéo',
    iconName: 'TrendingUpIcon'
  },
  {
    name: 'Streaming',
    slug: 'streaming',
    description: 'Solutions IA pour améliorer vos streams en direct',
    iconName: 'WifiIcon'
  },
  {
    name: 'Audio',
    slug: 'audio',
    description: 'Traitement audio intelligent pour vos productions vidéo',
    iconName: 'MusicIcon'
  }
];

const features = [
  {
    name: 'Transcription Automatique',
    slug: 'transcription-automatique',
    description: 'Conversion de la parole en texte avec précision grâce à l\'IA'
  },
  {
    name: 'Génération de Vidéos',
    slug: 'generation-de-videos',
    description: 'Création de contenu vidéo à partir de texte ou d\'images'
  },
  {
    name: 'Montage Automatique',
    slug: 'montage-automatique',
    description: 'Montage vidéo intelligent basé sur le contenu'
  },
  {
    name: 'Coloration',
    slug: 'coloration',
    description: 'Amélioration et correction des couleurs par IA'
  },
  {
    name: 'Reconnaissance Faciale',
    slug: 'reconnaissance-faciale',
    description: 'Détection et reconnaissance des visages dans les vidéos'
  },
  {
    name: 'Suppression de Bruit',
    slug: 'suppression-de-bruit',
    description: 'Élimination intelligente des bruits indésirables'
  },
  {
    name: 'Animation de Personnages',
    slug: 'animation-de-personnages',
    description: 'Animation automatique de personnages virtuels'
  },
  {
    name: 'Text-to-Speech',
    slug: 'text-to-speech',
    description: 'Conversion de texte en voix naturelle'
  },
  {
    name: 'Traduction de Sous-titres',
    slug: 'traduction-de-sous-titres',
    description: 'Traduction automatique des sous-titres en plusieurs langues'
  },
  {
    name: 'Stabilisation Vidéo',
    slug: 'stabilisation-video',
    description: 'Stabilisation automatique des séquences tremblantes'
  },
  {
    name: 'Suivi d\'Objets',
    slug: 'suivi-dobjets',
    description: 'Tracking d\'objets dans les séquences vidéo'
  },
  {
    name: 'Clonage Vocal',
    slug: 'clonage-vocal',
    description: 'Création de voix synthétiques basées sur des échantillons'
  }
];

const tags = [
  { name: 'Gratuit', slug: 'gratuit' },
  { name: 'Débutant', slug: 'debutant' },
  { name: 'Professionnel', slug: 'professionnel' },
  { name: 'Temps Réel', slug: 'temps-reel' },
  { name: 'YouTube', slug: 'youtube' },
  { name: 'TikTok', slug: 'tiktok' },
  { name: 'Instagram', slug: 'instagram' },
  { name: 'Cinéma', slug: 'cinema' },
  { name: 'Animation 3D', slug: 'animation-3d' },
  { name: 'Motion Design', slug: 'motion-design' },
  { name: 'Open Source', slug: 'open-source' },
  { name: 'IA Générative', slug: 'ia-generative' }
];

const userTypes = [
  { name: 'Créateurs de Contenu', slug: 'createurs-de-contenu' },
  { name: 'YouTubers', slug: 'youtubers' },
  { name: 'Monteurs Vidéo', slug: 'monteurs-video' },
  { name: 'Réalisateurs', slug: 'realisateurs' },
  { name: 'Streamers', slug: 'streamers' },
  { name: 'Motion Designers', slug: 'motion-designers' },
  { name: 'Animateurs', slug: 'animateurs' },
  { name: 'Entreprises', slug: 'entreprises' },
  { name: 'Marketeurs', slug: 'marketeurs' },
  { name: 'Étudiants', slug: 'etudiants' }
];

const tools = [
  {
    name: 'Pika Labs',
    slug: 'pika-labs',
    description: 'Plateforme de génération vidéo IA qui transforme du texte et des images en vidéos de haute qualité.',
    websiteUrl: 'https://www.pika.art',
    pricingType: 'FREEMIUM',
    pricingDetails: 'Gratuit avec des limites, plan Pro à 15$/mois',
    twitterUrl: 'https://twitter.com/pika_labs',
    isActive: true,
    features: 'Génération de vidéos, Animation, Effets spéciaux',
    hasAffiliateProgram: false
  },
  {
    name: 'Runway ML',
    slug: 'runway-ml',
    description: 'Suite d\'outils IA pour les créateurs vidéo, permettant l\'édition avancée et la génération de contenu.',
    websiteUrl: 'https://runwayml.com',
    pricingType: 'PAID',
    pricingDetails: 'À partir de 15$/mois, version d\'essai disponible',
    twitterUrl: 'https://twitter.com/runwayml',
    instagramUrl: 'https://instagram.com/runwayml',
    youtubeUrl: 'https://youtube.com/c/RunwayML',
    isActive: true,
    features: 'Montage vidéo AI, Génération d\'images, Animation',
    hasAffiliateProgram: true,
    affiliateUrl: 'https://runwayml.com/affiliates'
  },
  {
    name: 'Descript',
    slug: 'descript',
    description: 'Éditeur audio et vidéo basé sur le texte, utilisant l\'IA pour simplifier le montage et la production.',
    websiteUrl: 'https://www.descript.com',
    pricingType: 'FREEMIUM',
    pricingDetails: 'Gratuit, Pro à 12$/mois, Enterprise sur devis',
    twitterUrl: 'https://twitter.com/descript',
    youtubeUrl: 'https://youtube.com/c/Descript',
    isActive: true,
    features: 'Montage basé sur texte, Transcription, Suppression de silence',
    hasAffiliateProgram: false
  },
  {
    name: 'Synthesia',
    slug: 'synthesia',
    description: 'Plateforme de création de vidéos d\'avatar IA, permettant de générer des vidéos professionnelles sans caméra ni microphone.',
    websiteUrl: 'https://www.synthesia.io',
    pricingType: 'PAID',
    pricingDetails: 'À partir de 30$/mois par utilisateur',
    twitterUrl: 'https://twitter.com/synthesiaIO',
    linkedinUrl: 'https://linkedin.com/company/synthesia-io',
    isActive: true,
    features: 'Avatars IA, Vidéos explicatives, Traduction vidéo',
    hasAffiliateProgram: true,
    affiliateUrl: 'https://www.synthesia.io/partners'
  },
  {
    name: 'Neural Voice',
    slug: 'neural-voice',
    description: 'Solution de voix de synthèse ultra-réaliste pour les créateurs de contenu vidéo et audio.',
    websiteUrl: 'https://www.neural-voice.ai',
    pricingType: 'FREEMIUM',
    pricingDetails: 'Plan gratuit limité, Pro à 19€/mois',
    twitterUrl: 'https://twitter.com/neuralvoiceai',
    isActive: true,
    features: 'Clonage vocal, 120+ voix, 20+ langues',
    hasAffiliateProgram: true,
    affiliateUrl: 'https://www.neural-voice.ai/affiliate'
  },
  {
    name: 'Stable Diffusion Video',
    slug: 'stable-diffusion-video',
    description: 'Modèle open-source pour la génération de vidéos à partir de texte ou d\'images.',
    websiteUrl: 'https://github.com/Stability-AI/generative-models',
    pricingType: 'FREE',
    pricingDetails: 'Gratuit et open-source',
    githubUrl: 'https://github.com/Stability-AI/generative-models',
    isActive: true,
    features: 'Génération vidéo, Animation, Open-source',
    hasAffiliateProgram: false
  },
  {
    name: 'Topaz Video AI',
    slug: 'topaz-video-ai',
    description: 'Logiciel d\'amélioration vidéo IA pour upscaling, débruitage et interpolation de frames.',
    websiteUrl: 'https://www.topazlabs.com/topaz-video-ai',
    pricingType: 'PAID',
    pricingDetails: '199$ (achat unique), mises à jour pendant un an',
    twitterUrl: 'https://twitter.com/topazlabs',
    youtubeUrl: 'https://youtube.com/c/TopazLabs',
    isActive: true,
    features: 'Upscaling 8K, Débruitage, Slow-motion IA',
    hasAffiliateProgram: true,
    affiliateUrl: 'https://www.topazlabs.com/affiliates'
  },
  {
    name: 'D-ID',
    slug: 'd-id',
    description: 'Plateforme de création d\'avatars parlants à partir de photos et de texte.',
    websiteUrl: 'https://www.d-id.com',
    pricingType: 'FREEMIUM',
    pricingDetails: 'Plan gratuit limité, Business à partir de 29$/mois',
    twitterUrl: 'https://twitter.com/didspeaking',
    linkedinUrl: 'https://www.linkedin.com/company/d-id/',
    isActive: true,
    features: 'Avatars IA, Animation de photos, Text-to-speech',
    hasAffiliateProgram: false
  },
  {
    name: 'Auphonic',
    slug: 'auphonic',
    description: 'Service de post-production audio automatisé pour améliorer la qualité sonore des vidéos.',
    websiteUrl: 'https://auphonic.com',
    pricingType: 'FREEMIUM',
    pricingDetails: '2h gratuites/mois, plans payants à partir de 11$/mois',
    twitterUrl: 'https://twitter.com/auphonic',
    isActive: true,
    features: 'Normalisation audio, Réduction de bruit, Égalisation',
    hasAffiliateProgram: false
  },
  {
    name: 'Kapwing',
    slug: 'kapwing',
    description: 'Éditeur vidéo en ligne avec outils d\'IA pour simplifier la création de contenu.',
    websiteUrl: 'https://www.kapwing.com',
    pricingType: 'FREEMIUM',
    pricingDetails: 'Plan gratuit avec watermark, Pro à 20$/mois',
    twitterUrl: 'https://twitter.com/kapwing',
    instagramUrl: 'https://instagram.com/kapwingstudio',
    isActive: true,
    features: 'Édition collaborative, Sous-titrage auto, Montage vidéo',
    hasAffiliateProgram: true,
    affiliateUrl: 'https://www.kapwing.com/affiliate'
  }
];

const searches = [
  {
    keyword: 'générateur vidéo ia',
    slug: 'generateur-video-ia',
    description: 'Outils d\'IA pour générer des vidéos automatiquement',
    isActive: true
  },
  {
    keyword: 'montage vidéo automatique',
    slug: 'montage-video-automatique',
    description: 'Solutions d\'édition vidéo automatisées par IA',
    isActive: true
  },
  {
    keyword: 'voix off ia',
    slug: 'voix-off-ia',
    description: 'Outils de synthèse vocale pour vidéos et narration',
    isActive: true
  },
  {
    keyword: 'sous-titres automatiques',
    slug: 'sous-titres-automatiques',
    description: 'Génération et traduction de sous-titres par IA',
    isActive: true
  },
  {
    keyword: 'avatars vidéo ia',
    slug: 'avatars-video-ia',
    description: 'Création de présentateurs virtuels par IA',
    isActive: true
  },
  {
    keyword: 'animation personnages ia',
    slug: 'animation-personnages-ia',
    description: 'Animation de personnages automatisée par IA',
    isActive: true
  },
  {
    keyword: 'amélioration vidéo ia',
    slug: 'amelioration-video-ia',
    description: 'Upscaling et restauration vidéo par IA',
    isActive: true
  },
  {
    keyword: 'transcription vidéo',
    slug: 'transcription-video',
    description: 'Outils pour transcrire automatiquement l\'audio des vidéos',
    isActive: true
  },
  {
    keyword: 'effets spéciaux ia',
    slug: 'effets-speciaux-ia',
    description: 'Création d\'effets visuels générés par IA',
    isActive: true
  },
  {
    keyword: 'vidéo marketing ia',
    slug: 'video-marketing-ia',
    description: 'Outils IA pour le marketing vidéo',
    isActive: true
  }
];

module.exports = {
  users,
  categories,
  features,
  tags,
  userTypes,
  tools,
  searches
}; 