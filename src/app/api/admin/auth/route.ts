import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Rate limiting - in-memory store (resets on server restart)
// For production with multiple instances, use Redis or similar
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 60 * 1000; // 1 minute window for counting attempts

// Session store - in production use Redis or database
const sessions = new Map<string, { createdAt: number; ip: string }>();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_DURATION_MS) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > BLOCK_DURATION_MS) {
      loginAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP (behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (cfIP) return cfIP.split(',')[0].trim();
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP.trim();
  
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; blockedFor: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, blockedFor: 0 };
  }
  
  // Check if currently blocked
  if (attempt.blockedUntil > now) {
    return { allowed: false, remainingAttempts: 0, blockedFor: Math.ceil((attempt.blockedUntil - now) / 1000) };
  }
  
  // Reset if outside the attempt window
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, blockedFor: 0 };
  }
  
  const remaining = MAX_ATTEMPTS - attempt.count;
  return { allowed: remaining > 0, remainingAttempts: Math.max(0, remaining), blockedFor: 0 };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now, blockedUntil: 0 });
  } else {
    // Reset count if outside window
    if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
      attempt.count = 1;
    } else {
      attempt.count++;
    }
    attempt.lastAttempt = now;
    
    // Block if max attempts reached
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
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
    
    // Check rate limit first
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many failed attempts',
          blockedFor: rateLimit.blockedFor,
          message: `Too many failed login attempts. Please try again in ${Math.ceil(rateLimit.blockedFor / 60)} minutes.`
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_ATTEMPTS.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': rateLimit.blockedFor.toString()
          }
        }
      );
    }

    const body = await request.json();
    const { password, action } = body;

    // Verify admin password from server-side environment variable (NOT NEXT_PUBLIC_)
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Handle different actions
    if (action === 'verify-session') {
      const { sessionToken } = body;
      if (!sessionToken) {
        return NextResponse.json({ success: false, valid: false });
      }
      
      const hashedToken = hashSessionToken(sessionToken);
      const session = sessions.get(hashedToken);
      
      if (!session) {
        return NextResponse.json({ success: false, valid: false });
      }
      
      // Check if session expired
      if (Date.now() - session.createdAt > SESSION_DURATION_MS) {
        sessions.delete(hashedToken);
        return NextResponse.json({ success: false, valid: false, reason: 'expired' });
      }
      
      return NextResponse.json({ success: true, valid: true });
    }

    if (action === 'logout') {
      const { sessionToken } = body;
      if (sessionToken) {
        const hashedToken = hashSessionToken(sessionToken);
        sessions.delete(hashedToken);
      }
      return NextResponse.json({ success: true });
    }

    // Validate password
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 400 }
      );
    }

    // Timing-safe comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(password, 'utf-8');
    const adminPasswordBuffer = Buffer.from(adminPassword, 'utf-8');
    
    // Use length of admin password for comparison
    const expectedLength = adminPasswordBuffer.length;
    const inputLength = passwordBuffer.length;
    
    // Create buffers of same length for comparison
    const compareBuffer = Buffer.alloc(expectedLength);
    passwordBuffer.copy(compareBuffer, 0, 0, Math.min(inputLength, expectedLength));
    
    // Always compare same length to prevent timing attacks
    const isValid = crypto.timingSafeEqual(compareBuffer, adminPasswordBuffer) && inputLength === expectedLength;

    if (!isValid) {
      recordFailedAttempt(clientIP);
      const newRateLimit = checkRateLimit(clientIP);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid password',
          remainingAttempts: newRateLimit.remainingAttempts,
          message: newRateLimit.remainingAttempts > 0 
            ? `Invalid password. ${newRateLimit.remainingAttempts} attempts remaining.`
            : 'Invalid password. Account temporarily locked.'
        },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Limit': MAX_ATTEMPTS.toString(),
            'X-RateLimit-Remaining': newRateLimit.remainingAttempts.toString()
          }
        }
      );
    }

    // Clear failed attempts on successful login
    clearAttempts(clientIP);

    // Generate session token
    const sessionToken = generateSessionToken();
    const hashedToken = hashSessionToken(sessionToken);
    
    // Store session
    sessions.set(hashedToken, {
      createdAt: Date.now(),
      ip: clientIP
    });

    // Return success with session token
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      expiresIn: SESSION_DURATION_MS
    });

    // Set secure HTTP-only cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS / 1000, // in seconds
      path: '/'
    });

    // Also set a non-httpOnly cookie for client-side session token
    response.cookies.set('admin_session_token', sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Verify session
  const sessionToken = request.cookies.get('admin_session_token')?.value;
  
  if (!sessionToken) {
    return NextResponse.json({ authenticated: false });
  }

  const hashedToken = hashSessionToken(sessionToken);
  const session = sessions.get(hashedToken);

  if (!session || Date.now() - session.createdAt > SESSION_DURATION_MS) {
    if (session) {
      sessions.delete(hashedToken);
    }
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ 
    authenticated: true,
    expiresIn: SESSION_DURATION_MS - (Date.now() - session.createdAt)
  });
}

export async function DELETE(request: NextRequest) {
  // Logout
  const sessionToken = request.cookies.get('admin_session_token')?.value;
  
  if (sessionToken) {
    const hashedToken = hashSessionToken(sessionToken);
    sessions.delete(hashedToken);
  }

  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('admin_session');
  response.cookies.delete('admin_session_token');

  return response;
}
