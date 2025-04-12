const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');

const prisma = new PrismaClient();

// Fonction pour générer un slug
function generateSlug(name) {
  return slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

// Fonction pour convertir le nom de catégorie en slug
function getCategorySlug(name) {
  return slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

// Fonction principale
async function importTools() {
  try {
    const csvFilePath = path.join(__dirname, '../testons-clean.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parser le CSV
    const tools = parse(fileContent, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Nombre d'outils à importer: ${tools.length}`);

    // Obtenir toutes les catégories existantes
    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map();
    
    for (const category of existingCategories) {
      categoryMap.set(category.name.toLowerCase(), category);
    }

    let importedCount = 0;
    let skippedCount = 0;
    let categoriesCreated = 0;

    // Traiter chaque outil
    for (const tool of tools) {
      const toolName = tool.tool_name.trim();
      const toolCategory = tool.tool_category.trim();
      const toolUrl = tool.tool_link.trim();
      
      // Générer le slug pour l'outil
      const toolSlug = generateSlug(toolName);

      // Vérifier si l'outil existe déjà
      const existingTool = await prisma.tool.findUnique({
        where: { slug: toolSlug }
      });

      if (existingTool) {
        console.log(`Outil déjà existant: ${toolName} (${toolSlug})`);
        skippedCount++;
        continue;
      }

      // Vérifier si la catégorie existe, sinon la créer
      let categoryId;
      const categorySlug = getCategorySlug(toolCategory);
      const existingCategory = categoryMap.get(toolCategory.toLowerCase()) || 
                              await prisma.category.findFirst({
                                where: { slug: categorySlug }
                              });

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCategory = await prisma.category.create({
          data: {
            name: toolCategory,
            slug: categorySlug,
            description: `Outils de ${toolCategory}`,
            iconName: 'default'
          }
        });
        categoryId = newCategory.id;
        categoryMap.set(toolCategory.toLowerCase(), newCategory);
        categoriesCreated++;
        console.log(`Nouvelle catégorie créée: ${toolCategory}`);
      }

      // Créer l'outil
      const newTool = await prisma.tool.create({
        data: {
          name: toolName,
          slug: toolSlug,
          description: `${toolName} est un outil d'IA pour ${toolCategory.toLowerCase()}.`,
          websiteUrl: toolUrl,
          pricingType: 'freemium',
          features: JSON.stringify([]),
          isActive: true,
          CategoriesOnTools: {
            create: {
              categoryId: categoryId
            }
          }
        }
      });

      console.log(`Outil importé: ${toolName} (${toolSlug})`);
      importedCount++;
    }

    console.log(`\nRésumé de l'importation:`);
    console.log(`- Outils importés: ${importedCount}`);
    console.log(`- Outils ignorés (déjà existants): ${skippedCount}`);
    console.log(`- Nouvelles catégories créées: ${categoriesCreated}`);

  } catch (error) {
    console.error('Erreur lors de l\'importation des outils:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction principale
importTools()
  .then(() => console.log('Importation terminée!'))
  .catch(error => console.error('Erreur:', error)); 