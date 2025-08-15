"use client";

import Image from "next/image";
import { VenueCard } from "@/components/VenueCard";
import { Venue } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getVenues } from "@/lib/api";
import { useLocationWatch } from "@/lib/useLocation";
import { calculateDistance } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  
  // Location hook - watch for location changes
  const { location, error: locationError, loading: locationLoading, getLocation } = useLocationWatch({
    enableHighAccuracy: true,
    timeout: 30000, // 30 seconds for mobile GPS
    maximumAge: 30000, // 30 seconds - allow cached location within 30s
  });

  // Function to fetch venues with optional location
  const fetchVenues = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      const data = await getVenues(
        lat !== undefined && lon !== undefined 
          ? { lat, lon, query: 'night clubs', radius: 5000 } // 5km radius
          : undefined
      );
      setVenues(data.venues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch without location
  useEffect(() => {
    if (!initialFetchDone) {
      fetchVenues();
      setInitialFetchDone(true);
    }
  }, [initialFetchDone]);

  // Refetch with location when location becomes available
  useEffect(() => {
    if (location && initialFetchDone) {
      console.log('Location obtained, refetching venues with location:', location);
      fetchVenues(location.latitude, location.longitude);
    }
  }, [location?.latitude, location?.longitude, initialFetchDone]);

  // Calculate distances for venues when location is available
  const venuesWithDistance = useMemo(() => {
    if (!location) {
      return venues.map(venue => ({ ...venue, distance: undefined }));
    }
    
    const venuesWithDistances = venues.map(venue => ({
      ...venue,
      distance: calculateDistance(location.latitude, location.longitude, venue.lat, venue.lon)
    }));
    
    // Sort by distance when location is available
    return venuesWithDistances.sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  }, [venues, location?.latitude, location?.longitude]);

  if (loading && !initialFetchDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Image
          src="/VibeCheckTO Logo Design Skyline Alpha.png"
          alt="VibeCheckTO"
          width={400}
          height={120}
          className="h-24 w-auto mb-6"
          priority
        />
        <div className="text-lg text-muted-foreground">Loading venues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Image
          src="/VibeCheckTO Logo Design Skyline Alpha.png"
          alt="VibeCheckTO"
          width={400}
          height={120}
          className="h-24 w-auto mb-6"
          priority
        />
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      {/* <Header /> removed, global header is used */}
      <div className="container mx-auto px-4 py-8">
        {locationLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              📍 Getting your location to find nearby venues...
            </div>
          </div>
        )}
        
        {locationError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-700">
              📍 Location access denied. Showing all venues.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venuesWithDistance.map((venue) => (
            <VenueCard 
              key={venue.id} 
              venue={venue} 
              distance={venue.distance}
              onClick={() => {
                if (venue.source === 'google') {
                  // For Google Places venues, store the venue data in sessionStorage
                  sessionStorage.setItem(`google_venue_${venue.slug}`, JSON.stringify(venue));
                }
                router.push(`/venues/${venue.slug}`);
              }} 
            />
          ))}
        </div>
      </div>
    </>
  );
}
