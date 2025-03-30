const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

async function checkWebsite(url) {
  try {
    // Ajouter https:// si nécessaire
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(fullUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'follow',
      timeout: 10000 // 10 secondes de timeout
    });
    
    return {
      status: response.status,
      ok: response.ok
    };
  } catch (error) {
    console.error(`Erreur lors de la vérification de ${url}: ${error.message}`);
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('Démarrage du crawl et de la mise à jour des statuts des outils...');
  console.log('------------------------------------------------------------');
  
  // Récupérer tous les outils
  const tools = await prisma.tool.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      websiteUrl: true,
      isActive: true,
      httpCode: true
    }
  });
  
  console.log(`Nombre d'outils à vérifier: ${tools.length}`);
  
  // Statistiques
  let totalChecked = 0;
  let totalDisabled = 0;
  let totalEnabled = 0;
  const errorUrls = [];
  
  // Traiter chaque outil
  for (const tool of tools) {
    if (!tool.websiteUrl) {
      console.log(`Outil ${tool.name} (${tool.slug}) n'a pas d'URL de site web. Marqué comme inactif.`);
      await prisma.tool.update({
        where: { id: tool.id },
        data: { 
          isActive: false,
          httpCode: null
        }
      });
      totalDisabled++;
      totalChecked++;
      continue;
    }
    
    console.log(`Vérification de l'outil ${tool.name} (${tool.slug}) - URL: ${tool.websiteUrl}`);
    
    // Vérifier le site web
    const result = await checkWebsite(tool.websiteUrl);
    
    // Mise à jour du statut de l'outil
    const shouldBeActive = result.status === 200;
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: { 
        isActive: shouldBeActive,
        httpCode: result.status || null
      }
    });
    
    if (shouldBeActive) {
      console.log(`✅ ${tool.name} est en ligne avec le code HTTP ${result.status}. Statut: actif.`);
      totalEnabled++;
    } else {
      console.log(`❌ ${tool.name} n'est pas accessible (code HTTP ${result.status}). Statut: inactif.`);
      errorUrls.push({
        name: tool.name,
        url: tool.websiteUrl,
        status: result.status,
        error: result.error
      });
      totalDisabled++;
    }
    
    totalChecked++;
    
    // Afficher la progression
    if (totalChecked % 10 === 0) {
      console.log(`Progression: ${totalChecked}/${tools.length} (${Math.round(totalChecked/tools.length*100)}%)`);
    }
    
    // Pause pour éviter de surcharger les serveurs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('------------------------------------------------------------');
  console.log(`Crawl terminé! Résultats:`);
  console.log(`Total d'outils vérifiés: ${totalChecked}`);
  console.log(`Outils accessibles et activés: ${totalEnabled}`);
  console.log(`Outils inaccessibles et désactivés: ${totalDisabled}`);
  
  // Afficher les 10 premiers sites avec erreur
  if (errorUrls.length > 0) {
    console.log('------------------------------------------------------------');
    console.log(`Sites avec erreur (10 premiers sur ${errorUrls.length}):`);
    errorUrls.slice(0, 10).forEach(item => {
      console.log(`- ${item.name}: ${item.url} (Code: ${item.status}, Erreur: ${item.error || 'N/A'})`);
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 