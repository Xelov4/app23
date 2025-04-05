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

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const columnsParam = searchParams.get('columns');
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
    
    // Construire les conditions de filtre pour la requête SQL
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
            whereConditions += `"${filter.column}" = $${whereParams.length + 1}`;
            whereParams.push(filter.value);
            break;
          case 'contains':
            whereConditions += `"${filter.column}" ILIKE $${whereParams.length + 1}`;
            whereParams.push(`%${filter.value}%`);
            break;
          case 'startsWith':
            whereConditions += `"${filter.column}" ILIKE $${whereParams.length + 1}`;
            whereParams.push(`${filter.value}%`);
            break;
          case 'endsWith':
            whereConditions += `"${filter.column}" ILIKE $${whereParams.length + 1}`;
            whereParams.push(`%${filter.value}`);
            break;
          case 'greater':
            whereConditions += `"${filter.column}" > $${whereParams.length + 1}`;
            whereParams.push(filter.value);
            break;
          case 'less':
            whereConditions += `"${filter.column}" < $${whereParams.length + 1}`;
            whereParams.push(filter.value);
            break;
          case 'between':
            whereConditions += `"${filter.column}" BETWEEN $${whereParams.length + 1} AND $${whereParams.length + 2}`;
            whereParams.push(filter.value);
            whereParams.push(filter.value2);
            break;
        }
      });
    }

    // Formater les colonnes pour la requête SQL
    const columnsStr = columns.map(col => `"${col}"`).join(', ');

    // Requête pour récupérer les données
    const dataQuery = `
      SELECT ${columnsStr}
      FROM "${tableName}"
      ${whereConditions}
      ORDER BY ${columns[0]}
    `;
    
    const data = await prisma.$queryRawUnsafe(dataQuery, ...whereParams);

    // Convertir les données en CSV
    let csv = columns.join(';') + '\n';
    
    (data as any[]).forEach((row) => {
      const values = columns.map(col => {
        const value = row[col];
        
        // Traiter les différents types de données
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Échapper les guillemets et ajouter des guillemets autour des chaînes
          return `"${value.replace(/"/g, '""')}"`;
        } else if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        } else if (typeof value === 'object') {
          // Pour les objets et les tableaux, convertir en JSON
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      });
      
      csv += values.join(';') + '\n';
    });

    // Créer et renvoyer la réponse CSV
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': `attachment; filename=${tableName}_export.csv`
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'export des données:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    );
  }
} 