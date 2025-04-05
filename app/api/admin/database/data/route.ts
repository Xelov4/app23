import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Interface pour les filtres
type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between';

interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: string;
  value2?: string; // Pour 'between'
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

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const columnsParam = searchParams.get('columns');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '15');
    const filtersParam = searchParams.get('filters');

    if (!tableName) {
      return NextResponse.json(
        { error: "Le nom de la table est requis" },
        { status: 400 }
      );
    }

    if (!columnsParam) {
      return NextResponse.json(
        { error: "Les colonnes à récupérer sont requises" },
        { status: 400 }
      );
    }

    const columns = columnsParam.split(',');
    const filters: FilterCondition[] = filtersParam ? JSON.parse(filtersParam) : [];
    
    // Vérifier que la table existe (pour SQLite)
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
    
    // Construire les conditions de filtre pour SQLite
    let whereConditions = '';
    const whereParams: any[] = [];

    if (filters.length > 0) {
      whereConditions = 'WHERE ';
      
      filters.forEach((filter, index) => {
        if (index > 0) {
          whereConditions += ' AND ';
        }

        switch (filter.operator) {
          case 'equals':
            whereConditions += `"${filter.column}" = ?`;
            whereParams.push(filter.value);
            break;
          case 'contains':
            whereConditions += `"${filter.column}" LIKE ?`;
            whereParams.push(`%${filter.value}%`);
            break;
          case 'startsWith':
            whereConditions += `"${filter.column}" LIKE ?`;
            whereParams.push(`${filter.value}%`);
            break;
          case 'endsWith':
            whereConditions += `"${filter.column}" LIKE ?`;
            whereParams.push(`%${filter.value}`);
            break;
          case 'greater':
            whereConditions += `"${filter.column}" > ?`;
            whereParams.push(filter.value);
            break;
          case 'less':
            whereConditions += `"${filter.column}" < ?`;
            whereParams.push(filter.value);
            break;
          case 'between':
            whereConditions += `"${filter.column}" BETWEEN ? AND ?`;
            whereParams.push(filter.value);
            whereParams.push(filter.value2);
            break;
        }
      });
    }

    // Requête pour récupérer le nombre total de lignes
    const countQuery = `SELECT COUNT(*) as count FROM "${tableName}" ${whereConditions}`;
    const totalRowsResult = await prisma.$queryRawUnsafe(countQuery, ...whereParams);
    
    // Extraire le nombre de lignes du résultat
    const totalRows = Number((totalRowsResult as any[])[0].count);

    // Calculer l'offset pour la pagination
    const offset = (page - 1) * pageSize;

    // Formater les colonnes pour la requête SQL
    const columnsStr = columns.map(col => `"${col}"`).join(', ');

    // Requête pour récupérer les données
    const dataQuery = `
      SELECT ${columnsStr}
      FROM "${tableName}"
      ${whereConditions}
      ORDER BY ${columns[0]} 
      LIMIT ${pageSize} OFFSET ${offset}
    `;
    
    const data = await prisma.$queryRawUnsafe(dataQuery, ...whereParams);

    // Convertir les BigInt en nombres avant la sérialisation
    const serializedData = convertBigIntToNumber(data);
    
    return NextResponse.json({
      data: serializedData,
      totalRows,
      page,
      pageSize,
      totalPages: Math.ceil(totalRows / pageSize)
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données", message: String(error) },
      { status: 500 }
    );
  }
} 