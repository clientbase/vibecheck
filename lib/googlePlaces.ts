import { Venue } from './types';
import { getRedis } from '@/lib/redis';

interface GooglePlace {
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
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  error_message?: string;
  next_page_token?: string;
}

interface GooglePlaceDetailsResponse {
  result: GooglePlace;
  status: string;
  error_message?: string;
}

interface GooglePlacePhoto {
  photo_reference: string;
}

export async function searchNearbyPlaces(
  lat: number,
  lon: number,
  query: string = 'night clubs',
  radius: number = 1000
): Promise<GooglePlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  let allResults: GooglePlace[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.append('location', `${lat},${lon}`);
    url.searchParams.append('radius', radius.toString());
    url.searchParams.append('keyword', query);
    // url.searchParams.append('type', 'night_club|bar|restaurant');
    url.searchParams.append('key', apiKey);
    if (nextPageToken) {
      url.searchParams.append('pagetoken', nextPageToken);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data: GooglePlacesResponse = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (!data.results) {
      throw new Error('No results found in Google Places API response');
    }

    allResults = allResults.concat(data.results);
    nextPageToken = data.next_page_token;

    // Google API requires a short delay before using the next_page_token
    if (nextPageToken) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } while (nextPageToken);

  return allResults;
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlace> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.append('place_id', placeId);
  url.searchParams.append('fields', 'place_id,name,formatted_address,geometry,business_status,types,rating,user_ratings_total,price_level');
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.statusText}`);
  }

  const data: GooglePlaceDetailsResponse = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data.result;
}

export async function getPlacePhotos(placeId: string): Promise<string[]> {
  const redis = await getRedis();
  const cacheKey = `place_photos:${placeId}`;

  // Check cache first
  const cachedPhotos = await redis?.get(cacheKey);
  if (cachedPhotos) {
    return JSON.parse(cachedPhotos);
  }

  // Fetch from Google Places API
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.append('place_id', placeId);
  url.searchParams.append('fields', 'photos');
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  const photos = data.result.photos ? data.result.photos.map((photo: GooglePlacePhoto) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;
  }) : [];

  // Cache the result
  await redis?.set(cacheKey, JSON.stringify(photos), 'EX', 60 * 60 * 24); // Cache for 24 hours

  return photos;
}

export function convertGooglePlaceToVenue(place: GooglePlace): Partial<Venue> {
  return {
    name: place.name,
    address: place.formatted_address || place.vicinity || 'Address not available',
    lat: place.geometry.location.lat,
    lon: place.geometry.location.lng,
    google_place_id: place.place_id,
    categories: [], // We'll determine this based on place types or set default
  };
}
