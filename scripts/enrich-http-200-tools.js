// Script pour enrichir les outils avec un code HTTP 200
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const prisma = new PrismaClient();

// Fonction pour exécuter une commande shell
const runCommand = async (command) => {
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) console.error('stderr:', stderr);
    return stdout;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${error.message}`);
    return null;
  }
};

// Fonction pour enrichir un outil
const enrichTool = async (tool) => {
  console.log(`Enrichissement de l'outil ${tool.name} (${tool.slug})...`);
  try {
    // Exécuter le script d'enrichissement pour cet outil
    const command = `cd /root/vidéo-ia.net && node -e "require('./app/admin/enrichir/enrichScript').default('${tool.slug}')"`;
    const result = await runCommand(command);
    console.log(`Résultat pour ${tool.slug}: ${result}`);
    
    // Mettre à jour le statut dans la base de données pour indiquer que l'outil a été enrichi
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        // Vous pouvez ajouter ici un champ spécifique pour indiquer l'enrichissement
        // Par exemple, ajouter une note dans pricingDetails
        pricingDetails: `Enrichi automatiquement le ${new Date().toISOString()}`
      }
    });
    
    console.log(`Enrichissement réussi pour ${tool.slug}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'enrichissement de ${tool.slug}: ${error.message}`);
    return false;
  }
};

// Fonction principale
async function main() {
  try {
    console.log("Récupération des outils avec un code HTTP 200...");
    
    // Récupérer tous les outils avec un code HTTP 200
    const http200Tools = await prisma.tool.findMany({
      where: {
        httpCode: 200
      },
      select: {
        id: true,
        name: true,
        slug: true,
        websiteUrl: true
      }
    });
    
    console.log(`Nombre d'outils à enrichir: ${http200Tools.length}`);
    
    // Traiter les outils par lots de 3
    const batchSize = 3;
    for (let i = 0; i < http200Tools.length; i += batchSize) {
      const batch = http200Tools.slice(i, i + batchSize);
      console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(http200Tools.length / batchSize)}`);
      
      // Traiter chaque outil du lot en parallèle
      const results = await Promise.all(batch.map(tool => enrichTool(tool)));
      
      // Attendre un peu entre chaque lot pour éviter de surcharger le système
      if (i + batchSize < http200Tools.length) {
        console.log("Pause de 5 secondes entre les lots...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log("Enrichissement terminé pour tous les outils avec un code HTTP 200");
  } catch (error) {
    console.error("Erreur lors de l'exécution du script:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
main().catch(e => {
  console.error(e);
  process.exit(1);
}); 