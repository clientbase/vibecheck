import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REPORTS_PER_WINDOW = 3; // Maximum 3 reports per hour per IP

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitInfo>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const rateLimitInfo = rateLimitStore.get(ip);
  
  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    // Reset rate limit
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: MAX_REPORTS_PER_WINDOW - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  if (rateLimitInfo.count >= MAX_REPORTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetTime: rateLimitInfo.resetTime };
  }
  
  // Increment count
  rateLimitInfo.count++;
  rateLimitStore.set(ip, rateLimitInfo);
  
  return { 
    allowed: true, 
    remaining: MAX_REPORTS_PER_WINDOW - rateLimitInfo.count, 
    resetTime: rateLimitInfo.resetTime 
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Parse request body
    const body = await request.json();
    const { vibeLevel, queueLength, coverCharge, musicGenre, notes, clientIP } = body;
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait before submitting another report.',
          resetTime: new Date(rateLimit.resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
          }
        }
      );
    }
    
    // Validate required fields
    if (!vibeLevel || !queueLength || !coverCharge || !musicGenre) {
      return NextResponse.json(
        { error: 'Missing required fields: vibeLevel, queueLength, coverCharge, musicGenre' },
        { status: 400 }
      );
    }
    
    // Validate enum values
    const validVibeLevels = ['DEAD', 'MID', 'LIT', 'CHAOTIC'];
    const validQueueLengths = ['NONE', 'SHORT', 'LONG', 'INSANE'];
    
    if (!validVibeLevels.includes(vibeLevel)) {
      return NextResponse.json(
        { error: 'Invalid vibeLevel. Must be one of: DEAD, MID, LIT, CHAOTIC' },
        { status: 400 }
      );
    }
    
    if (!validQueueLengths.includes(queueLength)) {
      return NextResponse.json(
        { error: 'Invalid queueLength. Must be one of: NONE, SHORT, LONG, INSANE' },
        { status: 400 }
      );
    }
    
    // Validate cover charge
    if (typeof coverCharge !== 'number' || coverCharge < 0) {
      return NextResponse.json(
        { error: 'coverCharge must be a non-negative number' },
        { status: 400 }
      );
    }
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || null;
    
    // Get geo hint from headers (if available)
    const geoHint = request.headers.get('x-vercel-ip-country') || null;
    
    // Generate anonymous user ID (fingerprint based on IP + User Agent)
    const userAnonId = Buffer.from(`${clientIP}-${userAgent}`).toString('base64').slice(0, 16);
    
    // Find the venue
    const venue = await prisma.venue.findUnique({
      where: { slug }
    });
    
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }
    
    // Create the vibe report
    const vibeReport = await prisma.vibeReport.create({
      data: {
        venueId: venue.id,
        vibeLevel,
        queueLength,
        coverCharge,
        musicGenre,
        notes: notes || null,
        ipAddress: clientIP,
        userAgent,
        geoHint,
        userAnonId,
      },
      include: {
        venue: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });
    
    // Set rate limit headers
    const response = NextResponse.json({
      success: true,
      vibeReport: {
        id: vibeReport.id,
        vibeLevel: vibeReport.vibeLevel,
        queueLength: vibeReport.queueLength,
        coverCharge: vibeReport.coverCharge,
        musicGenre: vibeReport.musicGenre,
        notes: vibeReport.notes,
        submittedAt: vibeReport.submittedAt,
        venue: vibeReport.venue,
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: new Date(rateLimit.resetTime).toISOString()
      }
    });
    
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
    
    return response;
    
  } catch (error) {
    console.error('Error creating vibe report:', error);
    return NextResponse.json(
      { error: 'Failed to create vibe report' },
      { status: 500 }
    );
  }
} 