import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Fonction pour convertir les BigInt en nombre normal
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToNumber(item));
  }
  
  if (typeof obj === 'object') {
    const newObj: Record<string, any> = {};
    
    for (const key in obj) {
      newObj[key] = convertBigIntToNumber(obj[key]);
    }
    
    return newObj;
  }
  
  return obj;
}

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Récupérer les données du corps de la requête
    const { table, data } = await request.json();
    
    if (!table) {
      return NextResponse.json(
        { error: "Le nom de la table est requis" },
        { status: 400 }
      );
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Les données à importer sont requises" },
        { status: 400 }
      );
    }
    
    // Vérifier que la table existe
    const tables = await prisma.$queryRawUnsafe<{ tableName: string }[]>(`
      SELECT name as tableName
      FROM sqlite_schema
      WHERE type = 'table' AND name = ?
    `, table);
    
    if (tables.length === 0) {
      return NextResponse.json(
        { error: "Table non trouvée" },
        { status: 404 }
      );
    }
    
    // Récupérer les métadonnées des colonnes
    const columns = await prisma.$queryRawUnsafe<{ name: string, type: string }[]>(`
      PRAGMA table_info("${table}");
    `);
    
    const columnNames = columns.map(col => col.name);
    
    // Vérifier que les données à importer correspondent aux colonnes de la table
    const sampleDataKeys = Object.keys(data[0]);
    const invalidColumns = sampleDataKeys.filter(key => !columnNames.includes(key));
    
    if (invalidColumns.length > 0) {
      return NextResponse.json(
        { 
          error: "Certaines colonnes dans les données n'existent pas dans la table",
          invalidColumns 
        },
        { status: 400 }
      );
    }
    
    // Préparer les données pour l'insertion
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of data) {
      try {
        // Construire la requête d'insertion dynamiquement
        const keys = Object.keys(item).filter(key => item[key] !== undefined && item[key] !== null);
        const values = keys.map(key => item[key]);
        
        // Construire la requête SQL avec des placeholders
        const sql = `
          INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')})
          VALUES (${keys.map((_, i) => `?`).join(', ')})
        `;
        
        // Exécuter la requête
        await prisma.$executeRawUnsafe(sql, ...values);
        
        successCount++;
        results.push({ status: 'success', item });
      } catch (error) {
        errorCount++;
        results.push({ 
          status: 'error', 
          item,
          error: String(error) 
        });
      }
    }
    
    return NextResponse.json({
      table,
      totalProcessed: data.length,
      successCount,
      errorCount,
      results: convertBigIntToNumber(results)
    });
  } catch (error) {
    console.error("Erreur lors de l'importation des données:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'importation des données", message: String(error) },
      { status: 500 }
    );
  }
} 