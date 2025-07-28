import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the hostname and protocol
  const hostname = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const url = request.nextUrl.clone();

  // Only redirect to HTTPS in production (not on localhost)
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('0.0.0.0');
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = hostname.includes('vercel.app') || hostname.includes('.vercel.app');
  
  // Check if we need to redirect to HTTPS
  const needsHttpsRedirect = isProduction && 
    !isLocalhost && 
    protocol !== 'https' && 
    (isVercel || hostname.includes('.com') || hostname.includes('.org') || hostname.includes('.net'));

  if (needsHttpsRedirect) {
    // Create HTTPS URL
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    
    // Preserve the original path and query parameters
    httpsUrl.pathname = url.pathname;
    httpsUrl.search = url.search;
    
    // Redirect to HTTPS
    return NextResponse.redirect(httpsUrl, {
      status: 301, // Permanent redirect
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  }

  // Continue with the request if no redirect is needed
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
}; 