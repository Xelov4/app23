import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Dans un vrai système, ces informations seraient stockées dans une base de données
// et les mots de passe seraient hachés et salés
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Création d'une session pour l'administrateur
      // Dans un système de production, un token JWT serait préférable
      const sessionId = crypto.randomUUID();
      
      // Définition des cookies de session
      cookies().set('admin_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 heures
        path: '/',
      });
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
} 