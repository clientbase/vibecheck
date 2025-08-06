// Types for Venues and Vibe Reports based on Prisma schema

export enum VibeLevel {
  DEAD = "DEAD",
  MID = "MID", 
  LIT = "LIT",
  CHAOTIC = "CHAOTIC"
}

export enum QueueLength {
  NONE = "NONE",
  SHORT = "SHORT",
  LONG = "LONG", 
  INSANE = "INSANE"
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  lat: number;
  lon: number;
  categories: string[]; // Example: ["hip-hop", "rooftop"]
  isFeatured: boolean;
  coverPhotoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  vibeReports?: VibeReport[];
  distance?: number; // Distance from user location in kilometers
}

export interface VibeReport {
  id: string;
  venueId: string;
  venue?: Venue;
  submittedAt: Date;
  vibeLevel: VibeLevel;
  queueLength?: QueueLength | null;
  coverCharge?: number | null;
  musicGenre?: string | null;
  notes?: string | null;
  ipAddress?: string | null; // For light anti-spam tracking
  userAgent?: string | null;
  geoHint?: string | null; // Browser-based or derived from IP
  userAnonId?: string | null; // Optional: Fingerprinted session or device ID
}

// API Response types
export interface VenuesResponse {
  venues: Venue[];
  total: number;
}

export interface VibeReportsResponse {
  vibeReports: VibeReport[];
  total: number;
}

// Create/Update types (for forms)
export interface CreateVenueData {
  name: string;
  slug: string;
  address: string;
  lat: number;
  lon: number;
  categories: string[];
  isFeatured?: boolean;
  coverPhotoUrl?: string;
}

export interface CreateVibeReportData {
  venueId: string;
  vibeLevel: VibeLevel;
  queueLength?: QueueLength;
  coverCharge?: number;
  musicGenre?: string;
  notes?: string;
}

// Filter/Search types
export interface VenueFilters {
  categories?: string[];
  isFeatured?: boolean;
  search?: string;
  lat?: number;
  lon?: number;
  radius?: number; // in kilometers
}

export interface VibeReportFilters {
  venueId?: string;
  vibeLevel?: VibeLevel[];
  queueLength?: QueueLength[];
  dateFrom?: Date;
  dateTo?: Date;
} 