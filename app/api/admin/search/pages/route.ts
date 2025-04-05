import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

// GET /api/admin/search/pages
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const cookiesStore = cookies();
    const adminSessionCookie = await cookiesStore.get('admin_session');
    
    if (!adminSessionCookie) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 401 }
      );
    }
    
    // Récupérer toutes les pages de recherche
    const searchPages = await db.search.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(searchPages);
  } catch (error) {
    console.error('Erreur lors de la récupération des pages de recherche:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/search/pages
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const cookiesStore = cookies();
    const adminSessionCookie = await cookiesStore.get('admin_session');
    
    if (!adminSessionCookie) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 401 }
      );
    }
    
    // Récupérer les données de la requête
    const data = await request.json();
    const { keyword, slug, description, isActive } = data;
    
    // Vérifier les données requises
    if (!keyword || !slug) {
      return NextResponse.json(
        { message: 'Le mot-clé et le slug sont requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si un slug identique existe déjà
    const existingSearch = await db.search.findUnique({
      where: { slug }
    });
    
    if (existingSearch) {
      return NextResponse.json(
        { message: 'Une page avec ce slug existe déjà' },
        { status: 400 }
      );
    }
    
    // Créer la nouvelle page de recherche
    const newSearchPage = await db.search.create({
      data: {
        keyword,
        slug,
        description,
        isActive: isActive ?? true
      }
    });
    
    return NextResponse.json(newSearchPage, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la page de recherche:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 