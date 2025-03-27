import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const success = await clearAdminSession();
    
    if (!success) {
      return NextResponse.json(
        { message: 'Erreur lors de la suppression de la session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Session supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    );
  }
} 