import { NextResponse } from 'next/server';
import { getPlaceDetails, convertGooglePlaceToVenue } from '@/lib/googlePlaces';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  try {
    const { placeId } = await params;
    
    // Fetch place details from Google Places API
    const googlePlace = await getPlaceDetails(placeId);
    
    // Convert to venue format
    const venue = {
      ...convertGooglePlaceToVenue(googlePlace),
      id: `google_${googlePlace.place_id}`,
      slug: `google_${googlePlace.place_id}`,
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
      source: 'google'
    };

    return NextResponse.json(venue);
  } catch (error) {
    console.error('Error fetching Google Place details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}
