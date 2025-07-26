import { NextRequest, NextResponse } from 'next/server';

// Allowed email domains
const ALLOWED_DOMAINS = [
  'iitj.ac.in',
  'nlujodhpur.ac.in',
  'mbm.ac.in',
  'nift.ac.in',
  'jietjodhpur.ac.in',
  'aiimsjodhpur.edu.in'
];

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    if (!emailDomain) {
      return NextResponse.json(
        { 
          allowed: false, 
          reason: 'Invalid email format' 
        },
        { status: 200 }
      );
    }

    const isAllowed = ALLOWED_DOMAINS.includes(emailDomain);
    
    return NextResponse.json({
      allowed: isAllowed,
      domain: emailDomain,
      reason: isAllowed ? 'Domain is allowed' : 'Domain is not in allowed list'
    });

  } catch (error) {
    console.error('Error checking domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 