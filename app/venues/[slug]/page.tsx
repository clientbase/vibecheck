"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Venue, VibeReport } from "@/lib/types";
import { getVenueBySlug } from "@/lib/api";
import { VibeReportCard } from "@/components/VibeReportCard";
import { VibeReportForm } from "@/components/VibeReportForm";
import { GoogleMapsButton } from "@/components/GoogleMapsButton";
import { useLocationWatch } from "@/lib/useLocation";
import { calculateDistance, formatDistance } from "@/lib/utils";

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



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading venue...</div>
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

  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Venue not found</div>
      </div>
    );
  }

  return (
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

      {/* Vibe Stats Section */}
      <div className="mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Vibe Statistics</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Total Vibes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">12</div>
              <div className="text-sm text-muted-foreground">Last Hour</div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Vibe Report Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <VibeReportForm venueSlug={venue.slug} venueName={venue.name} />
        </div>
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
            <VibeReportForm venueSlug={venue.slug} venueName={venue.name} />
          </div>
        )}
      </div>
    </div>
  );
} 