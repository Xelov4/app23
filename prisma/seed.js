const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const seedData = require('./seed-data');

const prisma = new PrismaClient();

// Définition des types d'enum utilisés par Prisma
const PricingType = {
  FREE: "FREE",
  FREEMIUM: "FREEMIUM",
  PAID: "PAID",
  CONTACT: "CONTACT"
};

async function main() {
  console.log('🌱 Début du processus de seed...');
  
  // Créer les utilisateurs
  console.log('👤 Création des utilisateurs...');
  for (const userData of seedData.users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: hashedPassword,
        role: userData.role
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role
      },
    });
  }
  console.log(`✅ ${seedData.users.length} utilisateurs créés avec succès.`);
  
  // Créer les catégories
  console.log('📂 Création des catégories...');
  for (const categoryData of seedData.categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: {
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
  }
  console.log(`✅ ${seedData.categories.length} catégories créées avec succès.`);
  
  // Créer les fonctionnalités
  console.log('🔧 Création des fonctionnalités...');
  for (const featureData of seedData.features) {
    await prisma.feature.upsert({
      where: { slug: featureData.slug },
      update: featureData,
      create: {
        ...featureData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
  }
  console.log(`✅ ${seedData.features.length} fonctionnalités créées avec succès.`);
  
  // Créer les tags
  console.log('🏷️ Création des tags...');
  for (const tagData of seedData.tags) {
    await prisma.tag.upsert({
      where: { slug: tagData.slug },
      update: tagData,
      create: {
        ...tagData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
  }
  console.log(`✅ ${seedData.tags.length} tags créés avec succès.`);
  
  // Créer les types d'utilisateurs
  console.log('👥 Création des types d\'utilisateurs...');
  for (const userTypeData of seedData.userTypes) {
    await prisma.userType.upsert({
      where: { slug: userTypeData.slug },
      update: userTypeData,
      create: {
        ...userTypeData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
  }
  console.log(`✅ ${seedData.userTypes.length} types d'utilisateurs créés avec succès.`);
  
  // Créer les outils et leurs relations
  console.log('🛠️ Création des outils...');
  for (const toolData of seedData.tools) {
    // Créer l'outil de base avec des valeurs par défaut pour tous les champs
    try {
      const toolCreate = {
        name: toolData.name,
        slug: toolData.slug,
        description: toolData.description,
        websiteUrl: toolData.websiteUrl,
        pricingType: toolData.pricingType,
        features: toolData.features || '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Ajouter les champs optionnels seulement s'ils existent
      if (toolData.pricingDetails) toolCreate.pricingDetails = toolData.pricingDetails;
      if (toolData.twitterUrl) toolCreate.twitterUrl = toolData.twitterUrl;
      if (toolData.instagramUrl) toolCreate.instagramUrl = toolData.instagramUrl;
      if (toolData.facebookUrl) toolCreate.facebookUrl = toolData.facebookUrl;
      if (toolData.linkedinUrl) toolCreate.linkedinUrl = toolData.linkedinUrl;
      if (toolData.githubUrl) toolCreate.githubUrl = toolData.githubUrl;
      if (toolData.youtubeUrl) toolCreate.youtubeUrl = toolData.youtubeUrl;
      if (toolData.appStoreUrl) toolCreate.appStoreUrl = toolData.appStoreUrl;
      if (toolData.playStoreUrl) toolCreate.playStoreUrl = toolData.playStoreUrl;
      if (toolData.affiliateUrl) toolCreate.affiliateUrl = toolData.affiliateUrl;
      if (toolData.hasAffiliateProgram !== undefined) toolCreate.hasAffiliateProgram = toolData.hasAffiliateProgram;

      const tool = await prisma.tool.upsert({
        where: { slug: toolData.slug },
        update: toolCreate,
        create: toolCreate
      });
      
      // Ajouter des relations aléatoires avec les catégories
      const categoryCount = Math.floor(Math.random() * 3) + 1;
      const randomCategories = seedData.categories.sort(() => 0.5 - Math.random()).slice(0, categoryCount);
      
      for (const category of randomCategories) {
        const categoryRecord = await prisma.category.findUnique({
          where: { slug: category.slug }
        });
        
        if (categoryRecord) {
          // Vérifier si la relation existe déjà
          const existingRelation = await prisma.categoriesOnTools.findUnique({
            where: {
              toolId_categoryId: {
                toolId: tool.id,
                categoryId: categoryRecord.id
              }
            }
          });
          
          if (!existingRelation) {
            await prisma.categoriesOnTools.create({
              data: {
                toolId: tool.id,
                categoryId: categoryRecord.id
              }
            });
          }
        }
      }
      
      // Ajouter des relations aléatoires avec les tags
      const tagCount = Math.floor(Math.random() * 5) + 2;
      const randomTags = seedData.tags.sort(() => 0.5 - Math.random()).slice(0, tagCount);
      
      for (const tag of randomTags) {
        const tagRecord = await prisma.tag.findUnique({
          where: { slug: tag.slug }
        });
        
        if (tagRecord) {
          // Vérifier si la relation existe déjà
          const existingRelation = await prisma.tagsOnTools.findUnique({
            where: {
              toolId_tagId: {
                toolId: tool.id,
                tagId: tagRecord.id
              }
            }
          });
          
          if (!existingRelation) {
            await prisma.tagsOnTools.create({
              data: {
                toolId: tool.id,
                tagId: tagRecord.id
              }
            });
          }
        }
      }
      
      // Ajouter des relations aléatoires avec les fonctionnalités
      const featureCount = Math.floor(Math.random() * 4) + 2;
      const randomFeatures = seedData.features.sort(() => 0.5 - Math.random()).slice(0, featureCount);
      
      for (const feature of randomFeatures) {
        const featureRecord = await prisma.feature.findUnique({
          where: { slug: feature.slug }
        });
        
        if (featureRecord) {
          // Vérifier si la relation existe déjà
          const existingRelation = await prisma.featuresOnTools.findUnique({
            where: {
              toolId_featureId: {
                toolId: tool.id,
                featureId: featureRecord.id
              }
            }
          });
          
          if (!existingRelation) {
            await prisma.featuresOnTools.create({
              data: {
                toolId: tool.id,
                featureId: featureRecord.id
              }
            });
          }
        }
      }
      
      // Ajouter des relations aléatoires avec les types d'utilisateurs
      const userTypeCount = Math.floor(Math.random() * 3) + 1;
      const randomUserTypes = seedData.userTypes.sort(() => 0.5 - Math.random()).slice(0, userTypeCount);
      
      for (const userType of randomUserTypes) {
        const userTypeRecord = await prisma.userType.findUnique({
          where: { slug: userType.slug }
        });
        
        if (userTypeRecord) {
          // Vérifier si la relation existe déjà
          const existingRelation = await prisma.userTypesOnTools.findUnique({
            where: {
              toolId_userTypeId: {
                toolId: tool.id,
                userTypeId: userTypeRecord.id
              }
            }
          });
          
          if (!existingRelation) {
            await prisma.userTypesOnTools.create({
              data: {
                toolId: tool.id,
                userTypeId: userTypeRecord.id
              }
            });
          }
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la création de l'outil ${toolData.slug}:`, error);
    }
  }
  console.log(`✅ ${seedData.tools.length} outils créés avec succès avec leurs relations.`);
  
  // Créer les recherches
  console.log('🔍 Création des recherches...');
  for (const searchData of seedData.searches) {
    const search = await prisma.search.upsert({
      where: { slug: searchData.slug },
      update: {
        keyword: searchData.keyword,
        description: searchData.description || null,
        isActive: searchData.isActive || false,
        searchCount: Math.floor(Math.random() * 100) + 10,
        lastSearchedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      },
      create: {
        keyword: searchData.keyword,
        slug: searchData.slug,
        description: searchData.description || null,
        isActive: searchData.isActive || false,
        searchCount: Math.floor(Math.random() * 100) + 10,
        lastSearchedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
    
    // Ajouter des relations aléatoires avec les outils
    const toolCount = Math.floor(Math.random() * 5) + 3;
    const randomTools = seedData.tools.sort(() => 0.5 - Math.random()).slice(0, toolCount);
    
    for (const tool of randomTools) {
      const toolRecord = await prisma.tool.findUnique({
        where: { slug: tool.slug }
      });
      
      if (toolRecord) {
        // Vérifier si la relation existe déjà
        const existingRelation = await prisma.toolsOnSearches.findUnique({
          where: {
            toolId_searchId: {
              toolId: toolRecord.id,
              searchId: search.id
            }
          }
        });
        
        if (!existingRelation) {
          await prisma.toolsOnSearches.create({
            data: {
              toolId: toolRecord.id,
              searchId: search.id,
              relevance: Math.random() * 0.5 + 0.5
            }
          });
        }
      }
    }
    
    // Créer quelques données de recherche
    const searchCount = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < searchCount; i++) {
      await prisma.searchData.create({
        data: {
          searchId: search.id,
          searchTerm: `${searchData.keyword}${i > 0 ? ` ${['gratuit', 'meilleur', 'comparatif', 'top 10', 'avis'][i % 5]}` : ''}`,
          count: Math.floor(Math.random() * 40) + 1,
          lastSearchedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }
  console.log(`✅ ${seedData.searches.length} recherches créées avec succès avec leurs données.`);
  
  // Créer quelques séquences historiques
  console.log('📝 Création des historiques de séquençage...');
  for (const tool of seedData.tools) {
    const toolRecord = await prisma.tool.findUnique({
      where: { slug: tool.slug }
    });
    
    if (toolRecord) {
      const sequenceCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < sequenceCount; i++) {
        const startTime = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + Math.floor(Math.random() * 120) * 60 * 1000);
        const success = Math.random() > 0.3;
        
        const processResults = {
          1: {
            status: 'success',
            message: 'URL valide (200)',
            data: { statusCode: 200, isRedirected: false }
          },
          2: {
            status: Math.random() > 0.4 ? 'success' : 'warning',
            message: Math.random() > 0.4 ? '3 liens sociaux trouvés et sauvegardés' : 'Aucun lien social trouvé',
            data: { socialLinks: {} }
          },
          3: {
            status: Math.random() > 0.2 ? 'success' : 'error',
            message: Math.random() > 0.2 ? 'Contenu extrait avec succès' : 'Échec de l\'extraction de contenu',
            data: { pagesProcessed: 5 }
          },
          4: {
            status: Math.random() > 0.3 ? 'success' : 'warning',
            message: Math.random() > 0.3 ? 'Informations de tarification trouvées' : 'Informations de tarification partielles',
            data: {}
          },
          5: {
            status: 'success',
            message: 'Description SEO générée',
            data: {}
          }
        };
        
        // Simuler des erreurs dans certains cas
        if (!success) {
          processResults[Math.floor(Math.random() * 5) + 1].status = 'error';
          processResults[Math.floor(Math.random() * 5) + 1].message = 'Erreur lors du traitement';
        }
        
        await prisma.sequenceHistory.create({
          data: {
            toolId: toolRecord.id,
            toolName: tool.name,
            startTime,
            endTime,
            success,
            processResults: JSON.stringify(processResults),
            createdAt: endTime,
            updatedAt: endTime
          }
        });
      }
    }
  }
  console.log(`✅ Historiques de séquençage créés avec succès.`);
  
  console.log('✨ Processus de seed terminé avec succès!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Erreur lors du processus de seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 