import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface TableName {
  tableName: string;
}

interface RowCount {
  count: number;
}

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

export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Solution pour SQLite - récupérer la liste des tables
    // SQLite stocke les informations sur les tables dans sqlite_schema
    const tables = await prisma.$queryRawUnsafe<TableName[]>(`
      SELECT 
        name as tableName
      FROM 
        sqlite_schema
      WHERE 
        type = 'table' AND 
        name NOT LIKE 'sqlite_%' AND
        name NOT LIKE '_prisma_%'
      ORDER BY 
        name;
    `);
    
    // Pour chaque table, obtenir le nombre de colonnes et de lignes
    const tableInfoPromises = tables.map(async (table) => {
      // Obtenir les informations sur les colonnes
      const columns = await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info("${table.tableName}");`);
      
      // Compter le nombre de lignes
      const rowCountResult = await prisma.$queryRawUnsafe<RowCount[]>(`SELECT COUNT(*) as count FROM "${table.tableName}";`);
      const rowCount = rowCountResult[0].count;
      
      return {
        tableName: table.tableName,
        columnCount: columns.length,
        rowCount: Number(rowCount) // Convertir explicitement en Number
      };
    });
    
    const tableInfo = await Promise.all(tableInfoPromises);
    
    // Convertir les BigInt en nombres pour la sérialisation JSON
    const serializedTableInfo = convertBigIntToNumber(tableInfo);
    
    return NextResponse.json(serializedTableInfo);
  } catch (error) {
    console.error("Erreur lors de la récupération des tables:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tables", message: String(error) },
      { status: 500 }
    );
  }
} 