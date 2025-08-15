import { NextResponse } from 'next/server';
import { getPlaceDetails, convertGooglePlaceToVenue, getPlacePhotos } from '@/lib/googlePlaces';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  try {
    const { placeId } = await params;
    console.log(`Fetching details for placeId: ${placeId}`);
    
    // Fetch place details from Google Places API
    const googlePlace = await getPlaceDetails(placeId);
    console.log('Fetched Google Place details:', googlePlace);
    
    // Fetch and cache photos
    const photos = await getPlacePhotos(placeId);
    
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
      source: 'google',
      coverPhotoUrl: photos[0] || null, // Set coverPhotoUrl to the first photo
      photos // Include photos in the venue object
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
