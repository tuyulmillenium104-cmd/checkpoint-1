import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Use the same session store from auth route (this works because they're in the same process)
// In production with multiple instances, use Redis or database
declare global {
  // eslint-disable-next-line no-var
  var adminSessions: Map<string, { createdAt: number; ip: string }> | undefined;
  // eslint-disable-next-line no-var
  var loginAttempts: Map<string, { count: number; lastAttempt: number; blockedUntil: number }> | undefined;
}

// Initialize global stores if not exists
if (!global.adminSessions) {
  global.adminSessions = new Map();
}
if (!global.loginAttempts) {
  global.loginAttempts = new Map();
}

const sessions = global.adminSessions;
const loginAttempts = global.loginAttempts;

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ATTEMPTS = 10; // More lenient for URL verification
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (cfIP) return cfIP.split(',')[0].trim();
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP.trim();
  
  return 'unknown';
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const body = await request.json();
    const { secretKey, action } = body;

    // Handle session verification
    if (action === 'verify') {
      const sessionToken = request.cookies.get('admin_session_token')?.value;
      
      if (!sessionToken) {
        return NextResponse.json({ authenticated: false });
      }

      const hashedToken = hashSessionToken(sessionToken);
      const session = sessions!.get(hashedToken);

      if (!session || Date.now() - session.createdAt > SESSION_DURATION_MS) {
        if (session) {
          sessions!.delete(hashedToken);
        }
        return NextResponse.json({ authenticated: false });
      }

      return NextResponse.json({ 
        authenticated: true,
        expiresIn: SESSION_DURATION_MS - (Date.now() - session.createdAt)
      });
    }

    // Handle logout
    if (action === 'logout') {
      const sessionToken = request.cookies.get('admin_session_token')?.value;
      if (sessionToken) {
        const hashedToken = hashSessionToken(sessionToken);
        sessions!.delete(hashedToken);
      }
      
      const response = NextResponse.json({ success: true });
      response.cookies.delete('admin_session');
      response.cookies.delete('admin_session_token');
      return response;
    }

    // Check rate limit
    const now = Date.now();
    const attempt = loginAttempts!.get(clientIP);
    
    if (attempt && attempt.blockedUntil > now) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many attempts',
          blockedFor: Math.ceil((attempt.blockedUntil - now) / 1000)
        },
        { status: 429 }
      );
    }

    // Verify secret key from server-side environment variable
    const validSecret = process.env.ADMIN_SECRET_KEY;
    
    if (!validSecret) {
      console.error('ADMIN_SECRET_KEY environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Secret key required' },
        { status: 400 }
      );
    }

    // Timing-safe comparison
    const keyBuffer = Buffer.from(secretKey, 'utf-8');
    const validKeyBuffer = Buffer.from(validSecret, 'utf-8');
    
    const expectedLength = validKeyBuffer.length;
    const inputLength = keyBuffer.length;
    
    const compareBuffer = Buffer.alloc(expectedLength);
    keyBuffer.copy(compareBuffer, 0, 0, Math.min(inputLength, expectedLength));
    
    const isValid = crypto.timingSafeEqual(compareBuffer, validKeyBuffer) && inputLength === expectedLength;

    if (!isValid) {
      // Record failed attempt
      if (attempt) {
        attempt.count++;
        attempt.lastAttempt = now;
        if (attempt.count >= MAX_ATTEMPTS) {
          attempt.blockedUntil = now + BLOCK_DURATION_MS;
        }
      } else {
        loginAttempts!.set(clientIP, { count: 1, lastAttempt: now, blockedUntil: 0 });
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid secret key' },
        { status: 401 }
      );
    }

    // Clear failed attempts on success
    loginAttempts!.delete(clientIP);

    // Generate session token
    const sessionToken = generateSessionToken();
    const hashedToken = hashSessionToken(sessionToken);
    
    sessions!.set(hashedToken, {
      createdAt: Date.now(),
      ip: clientIP
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin access granted',
      expiresIn: SESSION_DURATION_MS
    });

    // Set secure cookies
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/'
    });

    response.cookies.set('admin_session_token', sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check if user has valid admin session
  const sessionToken = request.cookies.get('admin_session_token')?.value;
  
  if (!sessionToken) {
    return NextResponse.json({ authenticated: false });
  }

  const hashedToken = hashSessionToken(sessionToken);
  const session = sessions!.get(hashedToken);

  if (!session || Date.now() - session.createdAt > SESSION_DURATION_MS) {
    if (session) {
      sessions!.delete(hashedToken);
    }
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ 
    authenticated: true,
    expiresIn: SESSION_DURATION_MS - (Date.now() - session.createdAt)
  });
}
