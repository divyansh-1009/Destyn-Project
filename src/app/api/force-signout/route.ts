import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'Force sign out completed' 
    });

    // Clear all possible authentication cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token', 
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.csrf-token',
      '__Secure-next-auth.callback-url',
      'auth-token',
      'user-session',
      // Clear any Google OAuth related cookies
      'G_AUTHUSER_H',
      'SID',
      'SSID',
      'APISID',
      'SAPISID',
      '__Secure-1PSID',
      '__Secure-3PSID',
      '__Secure-1PAPISID',
      '__Secure-3PAPISID'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Also clear without httpOnly for client-side access
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    console.log('Force sign out completed - all cookies cleared');
    return response;

  } catch (error) {
    console.error('Error during force sign out:', error);
    return NextResponse.json(
      { error: 'Failed to force sign out' },
      { status: 500 }
    );
  }
} 