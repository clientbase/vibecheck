import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateVenueAggregatedData } from '@/lib/aggregation';
import { searchNearbyPlaces, convertGooglePlaceToVenue, getPlaceDetails, getPlacePhotos } from '@/lib/googlePlaces';
import { put } from '@vercel/blob';
import { isValidAdminRequest } from '@/lib/admin';
import { slugify } from '@/lib/slugify';
import type { Venue, VibeReport } from '@prisma/client';
import { getRedis } from '@/lib/redis';

type GooglePlace = {
  place_id: string;
  name: string;
  formatted_address?: string; // Only available in Place Details API
  vicinity?: string; // Available in Nearby Search API
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  business_status?: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
};

type VenueWithVibeReports = Venue & {
  vibeReports: VibeReport[];
  google_place_id?: string | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const query = searchParams.get('query') || 'night clubs';
    const radius = parseInt(searchParams.get('radius') || '1000');

    if (lat && lon) {
      // Location-based search with Google Places integration
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      
      if (isNaN(latNum) || isNaN(lonNum)) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude' },
          { status: 400 }
        );
      }

      // Query all venues from database (frontend will filter by distance)
      const dbVenues = await prisma.venue.findMany({
        include: {
          vibeReports: {
            where: { flagged: false },
            orderBy: { submittedAt: 'desc' },
          },
        },
      });

      // Get venues from Google Places
      let googlePlaces: GooglePlace[] = [];
      try {
        googlePlaces = await searchNearbyPlaces(latNum, lonNum, query, radius);
      } catch (error) {
        console.warn('Google Places API error:', error);
        // Continue with just DB results if Google API fails
      }

      // Combine and deduplicate results
      const combinedVenues = await combineVenueResults(dbVenues, googlePlaces);

      return NextResponse.json({
        venues: combinedVenues,
        total: combinedVenues.length,
      });
    } else {
      // Fallback to original behavior - return all venues
      const venues = await prisma.venue.findMany({
        include: {
          vibeReports: {
            where: { flagged: false },
            orderBy: {
              submittedAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate aggregated data for each venue
      const venuesWithAggregatedData = venues.map(venue => ({
        ...venue,
        aggregatedData: calculateVenueAggregatedData(venue.vibeReports),
      }));

      return NextResponse.json({
        venues: venuesWithAggregatedData,
        total: venues.length,
      });
    }
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

// Helper function to combine DB venues and Google Places results
async function combineVenueResults(dbVenues: VenueWithVibeReports[], googlePlaces: GooglePlace[]) {
  const redis = await getRedis();

  const venuesWithAggregatedData = dbVenues.map(venue => ({
    ...venue,
    aggregatedData: calculateVenueAggregatedData(venue.vibeReports),
    source: 'database'
  }));

  const googleVenues = await Promise.all(googlePlaces
    .filter(place => {
      return !dbVenues.some(dbVenue => dbVenue.google_place_id === place.place_id);
    })
    .map(async place => {
      let photos = [];
      const cacheKey = `place_details:${place.place_id}`;

      if (redis) {
        const cachedDetails = await redis.get(cacheKey);
        if (cachedDetails) {
          const cachedData = JSON.parse(cachedDetails);
          photos = cachedData.photos;
        } else {
          photos = await getPlacePhotos(place.place_id);
          await redis.set(cacheKey, JSON.stringify({ photos }), 'EX', 60 * 60 * 24);
        }
      } else {
        photos = await getPlacePhotos(place.place_id);
      }

      return {
        ...convertGooglePlaceToVenue(place),
        id: `google_${place.place_id}`,
        slug: `google_${place.place_id}`,
        categories: [],
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        vibeReports: [],
        aggregatedData: {
          totalVibes: 0,
          vibesLastHour: 0,
          averageVibeLevel: null,
          averageQueueLength: null,
          averageCoverCharge: null,
          mostCommonMusicGenre: null,
          lastVibeReportAt: null,
        },
        source: 'google',
        coverPhotoUrl: photos[0] || null
      };
    }));

  return [...venuesWithAggregatedData, ...googleVenues];
}

type CreateVenueBody = {
  name: string;
  slug?: string;
  address: string;
  categories?: string[];
  isFeatured?: boolean;
  coverImageUrl?: string;
  google_place_id?: string; // Add this field
};

async function geocodeAddress(address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY');
  }

  const params = new URLSearchParams({ address, key: apiKey });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Geocoding request failed: ${resp.statusText}`);
  }
  const data = await resp.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('No geocoding results found for the provided address');
  }
  const loc = data.results[0].geometry?.location;
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
    throw new Error('Invalid geocoding response');
  }
  return { lat: loc.lat as number, lon: loc.lng as number };
}



async function uploadImageFromUrl(remoteUrl: string, slug: string): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) {
    throw new Error(`Failed to download image from URL: ${res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error('Provided URL is not an image');
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = contentType.split('/')[1] || 'jpg';
  const filename = `venues/${slug}-${Date.now()}.${ext}`;
  const blob = await put(filename, buffer, { access: 'public', addRandomSuffix: false, contentType });
  return blob.url;
}

export async function POST(request: Request) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'www-authenticate': 'api-key' } });
  }
  try {
    const body = (await request.json()) as CreateVenueBody;
    const { name, address } = body;
    if (!name || !address) {
      return NextResponse.json({ error: 'name and address are required' }, { status: 400 });
    }

    const slug = body.slug?.trim() || slugify(name);
    if (!slug) {
      return NextResponse.json({ error: 'Unable to derive slug from name' }, { status: 400 });
    }

    // Ensure slug is unique
    const existing = await prisma.venue.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists. Please choose another.' }, { status: 409 });
    }

    // Geocode address
    const { lat, lon } = await geocodeAddress(address);

    // If image URL provided, fetch and upload to blob store
    let coverPhotoUrl: string | undefined = undefined;
    if (body.coverImageUrl) {
      try {
        coverPhotoUrl = await uploadImageFromUrl(body.coverImageUrl, slug);
      } catch (err) {
        console.warn('Image upload failed, proceeding without cover image:', err);
      }
    }

    const categories = Array.isArray(body.categories) ? body.categories : [];
    const venue = await prisma.venue.create({
      data: {
        name,
        slug,
        address,
        lat,
        lon,
        categories,
        isFeatured: Boolean(body.isFeatured),
        coverPhotoUrl,
      },
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
  }
}