import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Fonction pour convertir une valeur de colonne SQLite en valeur JSON appropriée
function convertColumnValue(value: any) {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Convertir les BigInt en nombre
  if (typeof value === 'bigint') {
    return Number(value);
  }
  
  try {
    // Si la valeur est un JSON valide
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      return JSON.parse(value);
    }
  } catch (e) {
    // Si ce n'est pas un JSON valide, retourner la valeur telle quelle
  }
  
  return value;
}

// Fonction pour convertir les BigInt en nombre normal pour toute structure
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

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    if (!tableName) {
      return NextResponse.json(
        { error: "Le nom de la table est requis" },
        { status: 400 }
      );
    }
    
    // Vérifier que la table existe
    const tables = await prisma.$queryRawUnsafe<{ tableName: string }[]>(`
      SELECT name as tableName
      FROM sqlite_schema
      WHERE type = 'table' AND name = ?
    `, tableName);
    
    if (tables.length === 0) {
      return NextResponse.json(
        { error: "Table non trouvée" },
        { status: 404 }
      );
    }
    
    // Obtenir les métadonnées des colonnes
    const columns = await prisma.$queryRawUnsafe<{ name: string, type: string }[]>(`
      PRAGMA table_info("${tableName}");
    `);
    
    const columnNames = columns.map(col => col.name);
    
    // Calculer la pagination
    const offset = (page - 1) * pageSize;
    
    // Obtenir le nombre total de lignes
    const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(`
      SELECT COUNT(*) as count FROM "${tableName}";
    `);
    
    const totalRows = Number(countResult[0].count);
    const totalPages = Math.ceil(totalRows / pageSize);
    
    // Construire la requête pour obtenir les données paginées
    const dataQuery = `
      SELECT ${columnNames.map(col => `"${col}"`).join(', ')}
      FROM "${tableName}"
      LIMIT ${pageSize} OFFSET ${offset};
    `;
    
    const rows = await prisma.$queryRawUnsafe(dataQuery);
    
    // Convertir les valeurs de colonne
    const formattedRows = Array.isArray(rows) ? rows.map(row => {
      const formattedRow: Record<string, any> = {};
      
      for (const colName of columnNames) {
        formattedRow[colName] = convertColumnValue((row as any)[colName]);
      }
      
      return formattedRow;
    }) : [];

    // Convertir tout BigInt en nombre avant la sérialisation
    const response = {
      table: tableName,
      columns: convertBigIntToNumber(columns),
      rows: formattedRows,
      pagination: {
        page,
        pageSize,
        totalRows,
        totalPages
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de l'exploration de la table:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'exploration de la table", message: String(error) },
      { status: 500 }
    );
  }
} 