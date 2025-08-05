import { Venue } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getVenues(): Promise<{ venues: Venue[]; total: number }> {
  const response = await fetch(`${API_BASE_URL}/api/venues`);
  
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

export async function submitVibeReport(
  slug: string, 
  data: {
    vibeLevel: string;
    queueLength: string;
    coverCharge: number;
    musicGenre: string;
    notes?: string;
  }
): Promise<{
  success: boolean;
  vibeReport: {
    id: string;
    vibeLevel: string;
    queueLength: string;
    coverCharge: number;
    musicGenre: string;
    notes?: string | null;
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
}> {
  const response = await fetch(`${API_BASE_URL}/api/venues/${slug}/vibe-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to submit vibe report: ${response.statusText}`);
  }
  
  return response.json();
} 