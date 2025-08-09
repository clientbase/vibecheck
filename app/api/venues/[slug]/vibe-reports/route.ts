import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REPORTS_PER_WINDOW = 3; // Maximum per hour per device/user

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory fallback store for rate limiting (used if Redis unavailable)
const rateLimitStore = new Map<string, RateLimitInfo>();

async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const redis = await getRedis();
  if (redis) {
    const ttlSeconds = Math.ceil(RATE_LIMIT_WINDOW / 1000);
    const redisKey = `rl:${key}`;
    // increment counter and set expiry on first increment
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, ttlSeconds);
    }
    const ttl = await redis.ttl(redisKey);
    if (count > MAX_REPORTS_PER_WINDOW) {
      return { allowed: false, remaining: 0, resetTime: now + (ttl > 0 ? ttl * 1000 : RATE_LIMIT_WINDOW) };
    }
    return { allowed: true, remaining: MAX_REPORTS_PER_WINDOW - count, resetTime: now + (ttl > 0 ? ttl * 1000 : RATE_LIMIT_WINDOW) };
  }

  // Fallback to in-memory when Redis not available
  const rateLimitInfo = rateLimitStore.get(key);
  
  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    // Reset rate limit
    rateLimitStore.set(key, {
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
  rateLimitStore.set(key, rateLimitInfo);
  
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
    const { vibeLevel, queueLength, coverCharge, musicGenre, notes, imageUrl, clientIP, deviceId } = body;
    
    // Check rate limit (prefer deviceId, else fallback to IP)
    const limiterKey = (deviceId && typeof deviceId === 'string' && deviceId.length > 0) ? `dev:${deviceId}` : `ip:${clientIP}`;
    const rateLimit = await checkRateLimit(limiterKey);
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
    if (!vibeLevel) {
      return NextResponse.json(
        { error: 'Missing required field: vibeLevel' },
        { status: 400 }
      );
    }
    
    // Validate values
    const validQueueLengths = ['NONE', 'SHORT', 'LONG', 'INSANE'];
    if (typeof vibeLevel !== 'number' || vibeLevel < 1 || vibeLevel > 5) {
      return NextResponse.json(
        { error: 'Invalid vibeLevel. Must be a number between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Validate optional queueLength if provided
    if (queueLength && !validQueueLengths.includes(queueLength)) {
      return NextResponse.json(
        { error: 'Invalid queueLength. Must be one of: NONE, SHORT, LONG, INSANE' },
        { status: 400 }
      );
    }
    
    // Validate optional cover charge if provided
    if (coverCharge !== undefined && (typeof coverCharge !== 'number' || coverCharge < 0)) {
      return NextResponse.json(
        { error: 'coverCharge must be a non-negative number' },
        { status: 400 }
      );
    }
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || null;
    
    // Get geo hint from headers (if available)
    const geoHint = request.headers.get('x-vercel-ip-country') || null;
    
    // Generate anonymous user ID (deviceId preferred, then IP+UA)
    const userAnonId = (deviceId && typeof deviceId === 'string')
      ? deviceId
      : Buffer.from(`${clientIP}-${userAgent}`).toString('base64').slice(0, 16);
    
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
        vibeLevel: Number(vibeLevel),
        queueLength: queueLength || null,
        coverCharge: coverCharge || null,
        musicGenre: musicGenre || null,
        notes: notes || null,
        imageUrl: imageUrl || null,
        ipAddress: clientIP,
        userAgent,
        geoHint,
        userAnonId,
        flagged: false,
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
        imageUrl: vibeReport.imageUrl,
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