import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateVenueAggregatedData } from '@/lib/aggregation';
import { put } from '@vercel/blob';
import { isValidAdminRequest } from '@/lib/admin';

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        vibeReports: {
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
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

type CreateVenueBody = {
  name: string;
  slug?: string;
  address: string;
  categories?: string[];
  isFeatured?: boolean;
  coverImageUrl?: string; // Optional remote image to download and store
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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