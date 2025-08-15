import { Venue } from './types';

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
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
}

interface GooglePlaceDetailsResponse {
  result: GooglePlace;
  status: string;
  error_message?: string;
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

  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.append('location', `${lat},${lon}`);
  url.searchParams.append('radius', radius.toString());
  url.searchParams.append('keyword', query);
  url.searchParams.append('type', 'night_club|bar|restaurant');
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.statusText}`);
  }

  const data: GooglePlacesResponse = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data.results;
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

export function convertGooglePlaceToVenue(place: GooglePlace): Partial<Venue> {
  return {
    name: place.name,
    address: place.formatted_address,
    lat: place.geometry.location.lat,
    lon: place.geometry.location.lng,
    google_place_id: place.place_id,
    categories: [], // We'll determine this based on place types or set default
  };
}
