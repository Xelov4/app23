import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Vérification de la présence du cookie de session
    const cookiesStore = await cookies();
    const adminSessionCookie = cookiesStore.get('admin_session');
    
    // Dans un système réel, nous vérifierions la validité du token de session
    // en le comparant à une base de données ou en décodant un JWT
    const isAuthenticated = !!adminSessionCookie;
    
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de session' },
      { status: 500 }
    );
  }
} 