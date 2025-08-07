import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateVenueAggregatedData } from '@/lib/aggregation';

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