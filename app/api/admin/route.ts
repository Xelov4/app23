import { NextRequest, NextResponse } from 'next/server';

// This middleware handles routes with and without trailing slashes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Processing request for: ${pathname}`);
  
  // Ensure we don't have double trailing slashes
  if (pathname.endsWith('//')) {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathname.replace(/\/+$/, '/');
    return NextResponse.redirect(newUrl);
  }
  
  return NextResponse.next();
}

// Match all API routes in this directory
export const config = {
  matcher: '/api/admin/:path*',
}; 