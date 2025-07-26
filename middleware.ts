import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle file upload size limits for API routes
  if (request.nextUrl.pathname.startsWith('/api/upload-photo')) {
    const response = NextResponse.next()
    
    // Set headers for larger file uploads (10MB)
    response.headers.set('max-http-buffer-size', '10mb')
    response.headers.set('Content-Type', 'multipart/form-data')
    
    // Increase timeout for large file uploads
    response.headers.set('Connection', 'keep-alive')
    response.headers.set('Transfer-Encoding', 'chunked')
    
    // Set additional headers for better upload handling
    response.headers.set('X-Accel-Buffering', 'no')
    response.headers.set('Cache-Control', 'no-cache')
    
    return response
  }

  // Handle access denied redirects and clear cookies
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.get('error') === 'AccessDenied') {
    const response = NextResponse.next()
    
    // Clear authentication cookies when access is denied
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token', 
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.csrf-token',
      '__Secure-next-auth.callback-url',
      'auth-token',
      'user-session'
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    console.log('Middleware: Cleared cookies due to access denial')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/upload-photo',
    '/api/:path*',
    '/'
  ],
} 