const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Vérification de l\'état de la base de données...');
  console.log('------------------------------------------------------------');

  // Compter les éléments dans les tables principales
  const tagCount = await prisma.tag.count();
  const categoryCount = await prisma.category.count();
  const toolCount = await prisma.tool.count();
  const tagsOnToolsCount = await prisma.tagsOnTools.count();
  const categoriesOnToolsCount = await prisma.categoriesOnTools.count();

  console.log(`Nombre de tags: ${tagCount}`);
  console.log(`Nombre de catégories: ${categoryCount}`);
  console.log(`Nombre d'outils: ${toolCount}`);
  console.log(`Nombre d'associations tags-outils: ${tagsOnToolsCount}`);
  console.log(`Nombre d'associations catégories-outils: ${categoriesOnToolsCount}`);
  console.log('------------------------------------------------------------');

  // Afficher les catégories
  console.log('CATÉGORIES:');
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          CategoriesOnTools: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  categories.forEach(category => {
    console.log(`- ${category.name} (${category.slug}): ${category._count.CategoriesOnTools} outils`);
  });
  console.log('------------------------------------------------------------');

  // Afficher quelques tags avec leur nombre d'outils
  console.log('TAGS (10 premiers):');
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          TagsOnTools: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    },
    take: 10
  });

  tags.forEach(tag => {
    console.log(`- ${tag.name} (${tag.slug}): ${tag._count.TagsOnTools} outils`);
  });
  console.log('------------------------------------------------------------');

  // Afficher quelques outils avec leurs catégories et tags
  console.log('OUTILS (5 premiers avec leurs catégories et tags):');
  const tools = await prisma.tool.findMany({
    include: {
      CategoriesOnTools: {
        include: {
          Category: true
        }
      },
      TagsOnTools: {
        include: {
          Tag: true
        }
      }
    },
    take: 5
  });

  tools.forEach(tool => {
    console.log(`- ${tool.name} (${tool.slug}):`);
    console.log('  Catégories:');
    tool.CategoriesOnTools.forEach(rel => {
      console.log(`  * ${rel.Category.name}`);
    });
    
    console.log('  Tags:');
    tool.TagsOnTools.forEach(rel => {
      console.log(`  * ${rel.Tag.name}`);
    });
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 