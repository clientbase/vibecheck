import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateVenueAggregatedData } from '@/lib/aggregation';
import { put } from '@vercel/blob';
import { isValidAdminRequest } from '@/lib/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const venue = await prisma.venue.findUnique({
      where: {
        slug: slug,
      },
      include: {
        vibeReports: {
          where: { flagged: false },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Calculate aggregated data for the venue
    const venueWithAggregatedData = {
      ...venue,
      aggregatedData: calculateVenueAggregatedData(venue.vibeReports),
    };

    return NextResponse.json(venueWithAggregatedData);
  } catch (error) {
    console.error('Error fetching venue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue' },
      { status: 500 }
    );
  }
} 

type UpdateVenueBody = {
  name?: string;
  slug?: string;
  address?: string;
  categories?: string[];
  isFeatured?: boolean;
  coverImageUrl?: string; // Optional remote image to download and store
};

type UpdateData = {
  name?: string;
  slug?: string;
  address?: string;
  categories?: string[];
  isFeatured?: boolean;
  lat?: number;
  lon?: number;
  coverPhotoUrl?: string;
};

async function geocodeAddress(address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('Missing GOOGLE_MAPS_API_KEY');
  const params = new URLSearchParams({ address, key: apiKey });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Geocoding failed: ${resp.statusText}`);
  const data = await resp.json();
  const loc = data?.results?.[0]?.geometry?.location;
  if (!loc) throw new Error('No geocoding results');
  return { lat: loc.lat as number, lon: loc.lng as number };
}

async function uploadImageFromUrl(remoteUrl: string, slug: string): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to download image: ${res.statusText}`);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) throw new Error('Provided URL is not an image');
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = contentType.split('/')[1] || 'jpg';
  const filename = `venues/${slug}-${Date.now()}.${ext}`;
  const blob = await put(filename, buffer, { access: 'public', addRandomSuffix: false, contentType });
  return blob.url;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'www-authenticate': 'api-key' } });
  }
  const { slug } = await params;
  try {
    const venue = await prisma.venue.findUnique({ where: { slug } });
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

    const body = (await request.json()) as UpdateVenueBody;

    const updateData: UpdateData = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (Array.isArray(body.categories)) updateData.categories = body.categories;

    // If address changes, geocode for new lat/lon
    if (body.address !== undefined) {
      updateData.address = body.address;
      try {
        const { lat, lon } = await geocodeAddress(body.address);
        updateData.lat = lat;
        updateData.lon = lon;
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
      }
    }

    // If new cover image URL provided, fetch and upload
    if (body.coverImageUrl) {
      try {
        const uploadedUrl = await uploadImageFromUrl(body.coverImageUrl, venue.slug);
        updateData.coverPhotoUrl = uploadedUrl;
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
      }
    }

    // If slug changes, ensure unique and update
    if (body.slug && body.slug !== venue.slug) {
      const exists = await prisma.venue.findUnique({ where: { slug: body.slug } });
      if (exists) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      updateData.slug = body.slug;
    }

    const updated = await prisma.venue.update({ where: { slug }, data: updateData });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating venue:', error);
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'www-authenticate': 'api-key' } });
  }
  const { slug } = await params;
  try {
    const venue = await prisma.venue.findUnique({ where: { slug } });
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    await prisma.vibeReport.deleteMany({ where: { venueId: venue.id } });
    await prisma.venue.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 });
  }
}