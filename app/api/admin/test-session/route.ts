import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Création d'une session pour l'administrateur à des fins de test
    const sessionId = crypto.randomUUID();
    
    // Définition des cookies de session
    const cookiesStore = cookies();
    cookiesStore.set('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cookie de session admin défini pour les tests'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la session test:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session test' },
      { status: 500 }
    );
  }
} 