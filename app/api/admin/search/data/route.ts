import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

// Initialiser le client Prisma
const prisma = new PrismaClient();

// GET /api/admin/search/data
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const cookiesStore = cookies();
    const adminSessionCookie = cookiesStore.get('admin_session');
    
    if (!adminSessionCookie) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 401 }
      );
    }
    
    // Récupérer le paramètre de filtre de temps
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange');
    
    // Préparer la requête
    let dateFilter: any = {};
    
    if (timeRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          // Pas de filtre de date
          startDate = new Date(0);
      }
      
      dateFilter = {
        lastSearchedAt: {
          gte: startDate
        }
      };
    }
    
    // Récupérer les données de recherche
    const searchData = await prisma.searchData.findMany({
      where: dateFilter,
      orderBy: {
        count: 'desc'
      }
    });
    
    return NextResponse.json(searchData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de recherche:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/search/data - pour enregistrer un terme de recherche
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const cookiesStore = cookies();
    const adminSessionCookie = cookiesStore.get('admin_session');
    
    if (!adminSessionCookie) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 401 }
      );
    }
    
    // Récupérer les données de la requête
    const data = await request.json();
    const { term } = data;
    
    if (!term) {
      return NextResponse.json(
        { message: 'Le terme de recherche est requis' },
        { status: 400 }
      );
    }
    
    // Rechercher si le terme existe déjà
    const existingTerm = await prisma.searchData.findFirst({
      where: { term: { equals: term, mode: 'insensitive' } }
    });
    
    if (existingTerm) {
      // Mettre à jour le compteur et la date
      const updatedTerm = await prisma.searchData.update({
        where: { id: existingTerm.id },
        data: {
          count: { increment: 1 },
          lastSearchedAt: new Date()
        }
      });
      
      return NextResponse.json(updatedTerm);
    } else {
      // Créer un nouveau terme
      const newTerm = await prisma.searchData.create({
        data: {
          term,
          count: 1,
          lastSearchedAt: new Date()
        }
      });
      
      return NextResponse.json(newTerm, { status: 201 });
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du terme de recherche:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET /api/admin/search/data/export - pour exporter les données au format CSV
export async function exportData(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const cookiesStore = cookies();
    const adminSessionCookie = cookiesStore.get('admin_session');
    
    if (!adminSessionCookie) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 401 }
      );
    }
    
    // Récupérer le paramètre de filtre de temps
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange');
    
    // Préparer la requête (même filtrage que GET)
    let dateFilter: any = {};
    
    if (timeRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          // Pas de filtre de date
          startDate = new Date(0);
      }
      
      dateFilter = {
        lastSearchedAt: {
          gte: startDate
        }
      };
    }
    
    // Récupérer les données de recherche triées
    const searchData = await prisma.searchData.findMany({
      where: dateFilter,
      orderBy: {
        count: 'desc'
      }
    });
    
    // Créer le contenu CSV
    let csv = 'Terme;Nombre de recherches;Dernière recherche;Date de création\n';
    
    for (const item of searchData) {
      const lastSearchedAt = new Date(item.lastSearchedAt).toLocaleString('fr-FR');
      const createdAt = new Date(item.createdAt).toLocaleString('fr-FR');
      
      // Échapper les guillemets et ajouter des guillemets autour du terme (au cas où il contient des points-virgules)
      const escapedTerm = `"${item.term.replace(/"/g, '""')}"`;
      
      csv += `${escapedTerm};${item.count};${lastSearchedAt};${createdAt}\n`;
    }
    
    // Renvoyer le fichier CSV
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': `attachment; filename=recherches_${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données de recherche:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 