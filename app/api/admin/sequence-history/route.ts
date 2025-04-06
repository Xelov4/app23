import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/admin/sequence-history
// Récupérer l'historique de séquençage
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification - facultative en développement
    const session = await getServerSession(authOptions);
    if (!session && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Extraire les paramètres de requête
    const url = new URL(req.url);
    const toolId = url.searchParams.get('toolId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Construire la requête
    const where = toolId ? { toolId } : {};
    
    // Récupérer l'historique de séquençage
    const history = await db.sequenceHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching sequence history:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique de séquençage' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sequence-history
// Créer un nouvel enregistrement d'historique de séquençage
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification - facultative en développement
    const session = await getServerSession(authOptions);
    if (!session && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Extraire les données de la requête
    const data = await req.json();
    
    // Valider les données requises
    if (!data.toolId || !data.startTime || !data.processResults) {
      return NextResponse.json(
        { error: 'Données manquantes: toolId, startTime et processResults sont requis' },
        { status: 400 }
      );
    }
    
    // S'assurer que les dates sont des objets Date
    const startTime = new Date(data.startTime);
    const endTime = data.endTime ? new Date(data.endTime) : undefined;
    
    // Créer l'enregistrement
    const history = await db.sequenceHistory.create({
      data: {
        toolId: data.toolId,
        toolName: data.toolName || 'Outil sans nom',
        startTime,
        endTime,
        success: !!data.success,
        processResults: data.processResults
      }
    });
    
    console.log(`[${new Date().toLocaleTimeString()}] Historique de séquençage créé pour l'outil ${data.toolId}`);
    
    return NextResponse.json({
      message: 'Historique de séquençage créé avec succès',
      history
    });
  } catch (error) {
    console.error('Error creating sequence history:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'historique de séquençage' },
      { status: 500 }
    );
  }
} 