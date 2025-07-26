import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle file upload size limits for API routes
  if (request.nextUrl.pathname.startsWith('/api/upload-photo')) {
    const response = NextResponse.next()
    
    // Set headers for larger file uploads
    response.headers.set('max-http-buffer-size', '10mb')
    response.headers.set('Content-Type', 'multipart/form-data')
    
    // Increase timeout for large file uploads
    response.headers.set('Connection', 'keep-alive')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/upload-photo',
    '/api/:path*'
  ],
} 