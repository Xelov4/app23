import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Suppression du cookie de session
    const cookieStore = cookies();
    
    // On définit un cookie avec une date d'expiration dans le passé pour le supprimer
    cookieStore.set('admin_session', '', {
      expires: new Date(0),
      path: '/',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 