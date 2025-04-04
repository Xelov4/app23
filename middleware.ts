import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer le cookie de session admin
  const adminSessionCookie = request.cookies.get('admin_session');
  
  // Vérifier si l'utilisateur accède à une page admin (autre que la page de connexion)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      request.nextUrl.pathname !== '/admin' && 
      request.nextUrl.pathname !== '/admin/login') {
    
    // Si pas de cookie de session, rediriger vers la page de connexion avec
    // URL de redirection pour revenir après connexion
    if (!adminSessionCookie) {
      const url = new URL('/admin', request.url);
      // Sauvegarder l'URL de la page originale pour redirection après connexion
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configuration pour indiquer quels chemins doivent être traités par le middleware
export const config = {
  matcher: ['/admin/:path*'],
}; 