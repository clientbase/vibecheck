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
  const [locationObtained, setLocationObtained] = useState(false);
  
  // Location hook - watch for location changes
  const { location, error: locationError, loading: locationLoading, getLocation } = useLocationWatch({
    enableHighAccuracy: true,
    timeout: 30000, // 30 seconds for mobile GPS
    maximumAge: 30000, // 30 seconds - allow cached location within 30s
  });

  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoading(true);
        const data = await getVenues();
        setVenues(data.venues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch venues');
      } finally {
        setLoading(false);
      }
    }

    fetchVenues();
  }, []);



  // Track when location is obtained
  useEffect(() => {
    if (location && !locationObtained) {
      setLocationObtained(true);
    }
  }, [location, locationObtained]);

  // Calculate distances for venues when location is available
  const venuesWithDistance = useMemo(() => {
    if (!location || !locationObtained) {
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
  }, [venues, location?.latitude, location?.longitude, locationObtained]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading venues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">VibeCheckTO</h1>
      </div>
      

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venuesWithDistance.map((venue) => (
          <VenueCard 
            key={venue.id} 
            venue={venue} 
            distance={venue.distance}
            onClick={() => router.push(`/venues/${venue.slug}`)} 
          />
        ))}
      </div>
    </div>
  );
}
