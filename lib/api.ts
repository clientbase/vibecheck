import { Venue } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface GetVenuesOptions {
  lat?: number;
  lon?: number;
  query?: string;
  radius?: number;
}

export async function getVenues(options?: GetVenuesOptions): Promise<{ venues: Venue[]; total: number }> {
  const url = new URL(`${API_BASE_URL}/api/venues`);
  
  if (options?.lat !== undefined && options?.lon !== undefined) {
    url.searchParams.append('lat', options.lat.toString());
    url.searchParams.append('lon', options.lon.toString());
  }
  
  if (options?.query) {
    url.searchParams.append('query', options.query);
  }
  
  if (options?.radius) {
    url.searchParams.append('radius', options.radius.toString());
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch venues: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getVenueBySlug(slug: string): Promise<Venue> {
  const response = await fetch(`${API_BASE_URL}/api/venues/${slug}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch venue: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getGoogleVenueByPlaceId(placeId: string): Promise<Venue> {
  const response = await fetch(`${API_BASE_URL}/api/venues/google/${placeId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Google venue: ${response.statusText}`);
  }
  
  return response.json();
}

export async function submitVibeReport(
  slug: string, 
  data: {
    vibeLevel: number;
    queueLength?: string;
    coverCharge?: number;
    musicGenre?: string;
    notes?: string;
    imageUrl?: string;
    deviceId?: string;
    googleVenueData?: Venue;
  }
): Promise<{
  success: boolean;
  vibeReport: {
    id: string;
    vibeLevel: number;
    queueLength: string;
    coverCharge: number;
    musicGenre: string;
    notes?: string | null;
    imageUrl?: string | null;
    submittedAt: string;
    venue: {
      name: string;
      slug: string;
    };
  };
  rateLimit: {
    remaining: number;
    resetTime: string;
  };
  redirectToSlug?: string;
}> {
  // Get client IP from ipify
  let clientIP = 'unknown';
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      clientIP = ipData.ip;
    }
  } catch (error) {
    console.warn('Failed to get IP from ipify:', error);
  }

  const response = await fetch(`${API_BASE_URL}/api/venues/${slug}/vibe-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      clientIP,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to submit vibe report: ${response.statusText}`);
  }
  
  return response.json();
} 