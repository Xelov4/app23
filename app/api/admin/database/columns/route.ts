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

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    
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
    
    // Récupérer les métadonnées des colonnes avec PRAGMA (spécifique à SQLite)
    const columns = await prisma.$queryRawUnsafe(`
      PRAGMA table_info("${tableName}");
    `);
    
    // Reformater les données des colonnes pour les rendre plus utiles à l'interface
    const formattedColumns = Array.isArray(columns) ? columns.map((col: any) => {
      return {
        name: col.name,
        type: col.type,
        notNull: Boolean(col.notnull),
        defaultValue: col.dflt_value,
        isPrimaryKey: Boolean(col.pk)
      };
    }) : [];
    
    // Convertir les BigInt en nombres pour la sérialisation JSON
    const serializedColumns = convertBigIntToNumber(formattedColumns);
    
    return NextResponse.json(serializedColumns);
  } catch (error) {
    console.error("Erreur lors de la récupération des colonnes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des colonnes", message: String(error) },
      { status: 500 }
    );
  }
} 