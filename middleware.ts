import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer le cookie de session admin
  const adminSessionCookie = request.cookies.get('admin_session');
  
  // Vérifier si l'utilisateur accède à une page admin qui nécessite authentification
  // et n'est pas déjà sur la page d'authentification
  if (
    request.nextUrl.pathname.startsWith('/admin') && 
    !request.nextUrl.pathname.match(/^\/admin\/?$/) && // Exclure /admin et /admin/
    !request.nextUrl.pathname.includes('/admin/login') && 
    !adminSessionCookie
  ) {
    // Si pas de cookie de session, rediriger vers la page de connexion
    const loginUrl = new URL('/admin', request.url);
    // Sauvegarder l'URL de la page originale pour redirection après connexion
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Configuration pour indiquer quels chemins doivent être traités par le middleware
export const config = {
  matcher: ['/admin/:path*'],
}; 