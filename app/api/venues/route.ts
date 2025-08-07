import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateVenueAggregatedData } from '@/lib/aggregation';

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