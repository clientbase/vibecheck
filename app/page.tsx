"use client";

import Image from "next/image";
import { VenueCard } from "@/components/VenueCard";
import { Venue } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getVenues } from "@/lib/api";
import { useLocationWatch } from "@/lib/useLocation";
import { calculateDistance } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [searchQuery, setSearchQuery] = useState('night club bar');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [lastSignificantLocation, setLastSignificantLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleSearch = () => {
    if (location) {
      fetchVenues(location.latitude, location.longitude);
    }
  };
  
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
          ? { lat, lon, query: searchQuery, radius: searchRadius } // 5km radius
          : undefined
      );
      setVenues(data.venues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  // Fetch with location when location becomes available
  useEffect(() => {
    if (location) {
      console.log('Location obtained, fetching venues with location:', location);
      fetchVenues(location.latitude, location.longitude);
      setInitialFetchDone(true);
    }
  }, [location?.latitude, location?.longitude]);

  // Function to check if location change is significant (more than 50 meters)
  const isLocationChangeSignificant = useCallback((newLat: number, newLng: number) => {
    if (!lastSignificantLocation) return true; // First location is always significant
    
    const distance = calculateDistance(
      lastSignificantLocation.lat, 
      lastSignificantLocation.lng, 
      newLat, 
      newLng
    );
    
    return distance > 50; // 50 meters threshold
  }, [lastSignificantLocation]);

  // Effect to update significant location when location changes
  useEffect(() => {
    if (location && isLocationChangeSignificant(location.latitude, location.longitude)) {
      setLastSignificantLocation({ lat: location.latitude, lng: location.longitude });
    }
  }, [location?.latitude, location?.longitude, isLocationChangeSignificant]);

  // Calculate distances for venues when location is available
  const venuesWithDistance = useMemo(() => {
    if (!lastSignificantLocation) {
      return venues.map(venue => ({ ...venue, distance: undefined }));
    }
    
    const venuesWithDistances = venues.map(venue => ({
      ...venue,
      distance: calculateDistance(lastSignificantLocation.lat, lastSignificantLocation.lng, venue.lat, venue.lon)
    }));
    
    // Sort by distance when location is available
    return venuesWithDistances.sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  }, [venues, lastSignificantLocation]);

  // Memoized venue card click handler
  const handleVenueClick = useCallback((venue: Venue & { distance?: number }) => {
    if (venue.source === 'google') {
      // For Google Places venues, store the venue data in sessionStorage
      sessionStorage.setItem(`google_venue_${venue.slug}`, JSON.stringify(venue));
    }
    router.push(`/venues/${venue.slug}`);
  }, [router]);

  // Memoized venue cards to prevent unnecessary re-renders
  const venueCards = useMemo(() => {
    return venuesWithDistance.map((venue) => (
      <VenueCard 
        key={venue.id} 
        venue={venue} 
        distance={venue.distance}
        onClick={() => handleVenueClick(venue)} 
      />
    ));
  }, [venuesWithDistance, handleVenueClick]);

  // Effect to hide skeleton after initial load
  useEffect(() => {
    if (venues.length > 0 && showSkeleton) {
      // Hide skeleton after 1.5 seconds to allow images to load
      const timeout = setTimeout(() => {
        setShowSkeleton(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [venues.length, showSkeleton]);

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

        {/* Show skeleton loading during initial load only */}
        {(loading || (showSkeleton && venues.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="w-full max-w-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16 ml-2" />
                  </div>
                </CardHeader>
                
                {/* Image area */}
                <Skeleton className="w-full h-40" />
                
                <CardContent>
                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  
                  {/* Vibe Emoji and Text */}
                  <div className="flex flex-col items-center mb-3">
                    <Skeleton className="h-10 w-10 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  
                  {/* Vibe Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Show actual venue cards when not loading and venues are available */}
        {!loading && venues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venueCards}
          </div>
        )}
      </div>
    </>
  );
}
