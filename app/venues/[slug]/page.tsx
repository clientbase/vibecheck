"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Venue, VibeReport } from "@/lib/types";
import { getVenueBySlug, getGoogleVenueByPlaceId } from "@/lib/api";
import { VibeReportCard } from "@/components/VibeReportCard";
import { VibeReportForm } from "@/components/VibeReportForm";
import { GoogleMapsButton } from "@/components/GoogleMapsButton";
import { useLocationWatch } from "@/lib/useLocation";
import { calculateDistance, formatDistance, getVibeEmoji, getVibeLabel, timeSince } from "@/lib/utils";
import { toast } from "sonner";

export default function VenuePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [venue, setVenue] = useState<Venue | null>(null);
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
    async function fetchVenue() {
      try {
        setLoading(true);
        
        // Check if this is a Google Places venue
        if (slug.startsWith('google_')) {
          const googleVenueData = sessionStorage.getItem(`google_venue_${slug}`);
          if (googleVenueData) {
            const googleVenue = JSON.parse(googleVenueData);
            setVenue(googleVenue);
            // Clean up the sessionStorage after use
            sessionStorage.removeItem(`google_venue_${slug}`);
            setLoading(false);
            return;
          } else {
            // Fallback: fetch from Google Places API if sessionStorage is empty
            const placeId = slug.replace('google_', '');
            try {
              const googleVenue = await getGoogleVenueByPlaceId(placeId);
              setVenue(googleVenue);
              setLoading(false);
              return;
            } catch (err) {
              console.error('Failed to fetch Google Place details:', err);
              // Continue to try database fetch as last resort
              // (in case the venue was already created from a previous vibe report)
            }
          }
        }
        
        // For database venues, fetch from API
        const data = await getVenueBySlug(slug);
        setVenue(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch venue');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchVenue();
    }
  }, [slug]);



  // Track when location is obtained
  useEffect(() => {
    if (location && !locationObtained) {
      setLocationObtained(true);
    }
  }, [location, locationObtained]);

  // Calculate distance when location and venue are available
  const distance = useMemo(() => {
    if (!location || !venue || !locationObtained) return undefined;
    
    return calculateDistance(location.latitude, location.longitude, venue.lat, venue.lon);
  }, [location, venue, locationObtained]);

  const maxDistanceKm: number = (() => {
    const raw = process.env.NEXT_PUBLIC_VIBEREPORT_MAX_KM || '0.5';
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.5;
  })();

  const handleFormOpenClickCapture = (e: React.SyntheticEvent) => {
    if (!locationObtained || !location) {
      e.preventDefault();
      e.stopPropagation();
      toast.error('Location Required', { description: 'You must allow location to post a vibe.' });
      return;
    }
    if (typeof distance === 'number' && distance > maxDistanceKm) {
      e.preventDefault();
      e.stopPropagation();
      const km = maxDistanceKm.toFixed(maxDistanceKm < 1 ? 2 : 1);
      toast.error('Too far from venue', { description: `You must be within ${km} km to post a vibe.` });
      return;
    }
  };



  if (loading) {
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
        <div className="text-lg text-muted-foreground">Loading venue...</div>
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

  if (!venue) {
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
        <div className="text-lg">Venue not found</div>
      </div>
    );
  }

  return (
    <>
      {/* <Header /> removed, global header is used */}
      <div className="container mx-auto px-4 py-8">
        {/* Venue Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {venue.coverPhotoUrl && (
            <img
              src={venue.coverPhotoUrl}
              alt={venue.name}
              className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold break-words flex-1">{venue.name}</h1>
              {distance !== undefined && (
                <div className="ml-4 flex-shrink-0">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    📍 {formatDistance(distance)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-gray-600 break-words flex-1">{venue.address}</p>
              <GoogleMapsButton 
                address={venue.address}
                venueName={venue.name}
                variant="outline"
                size="sm"
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {venue.categories.map((category) => (
                <span
                  key={category}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
            {venue.isFeatured && (
              <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Submit Vibe Report Section - moved above Vibe Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6" onClickCapture={handleFormOpenClickCapture}>
          <VibeReportForm 
            venueSlug={venue.slug} 
            venueName={venue.name}
            googleVenueData={venue.source === 'google' ? venue : undefined}
          />
        </div>
      </div>

      {/* Vibe Stats Section */}
      <div className="mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Vibe Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {venue.aggregatedData?.totalVibes || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Vibes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {venue.aggregatedData?.vibesLastHour || 0}
              </div>
              <div className="text-sm text-muted-foreground">Last Hour</div>
            </div>
            {/* <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {venue.aggregatedData?.averageCoverCharge ? `$${venue.aggregatedData.averageCoverCharge}` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Cover</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {venue.aggregatedData?.averageQueueLength || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Queue</div>
            </div> */}
          </div>
          
          {/* Additional Stats */}
          {venue.aggregatedData && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Vibe:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getVibeEmoji(venue.aggregatedData.averageVibeLevel)}</span>
                    <span className="font-medium">{getVibeLabel(venue.aggregatedData.averageVibeLevel) || 'N/A'}</span>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Top Genre:</span>
                  <span className="font-medium">{venue.aggregatedData.mostCommonMusicGenre || 'N/A'}</span>
                </div> */}
                {venue.aggregatedData.lastVibeReportAt && (
                  <div className="flex items-center justify-between md:col-span-2">
                    <span className="text-sm text-muted-foreground">Last Report:</span>
                    <span className="font-medium">{timeSince(venue.aggregatedData.lastVibeReportAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Vibe Reports Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Vibe Reports</h2>
        </div>
        {venue.vibeReports && venue.vibeReports.length > 0 ? (
          <div className="grid gap-4">
            {venue.vibeReports.map((report: VibeReport) => (
              <VibeReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No vibe reports yet. Be the first to report the vibe!</p>
            <div className="flex items-center justify-center" onClickCapture={handleFormOpenClickCapture}>
              <VibeReportForm 
                venueSlug={venue.slug} 
                venueName={venue.name}
                googleVenueData={venue.source === 'google' ? venue : undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
} 