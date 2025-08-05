"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Venue, VibeReport, VibeLevel, QueueLength } from "@/lib/types";
import { getVenueBySlug } from "@/lib/api";

export default function VenuePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getVibeLevelColor = (level: VibeLevel) => {
    switch (level) {
      case VibeLevel.DEAD: return "text-red-600";
      case VibeLevel.MID: return "text-yellow-600";
      case VibeLevel.LIT: return "text-green-600";
      case VibeLevel.CHAOTIC: return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const getQueueLengthColor = (length: QueueLength) => {
    switch (length) {
      case QueueLength.NONE: return "text-green-600";
      case QueueLength.SHORT: return "text-yellow-600";
      case QueueLength.LONG: return "text-orange-600";
      case QueueLength.INSANE: return "text-red-600";
      default: return "text-gray-600";
    }
  };

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
        <div className="flex items-start gap-6">
          {venue.coverPhotoUrl && (
            <img
              src={venue.coverPhotoUrl}
              alt={venue.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{venue.name}</h1>
            <p className="text-gray-600 mb-4">{venue.address}</p>
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

      {/* Vibe Reports Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Recent Vibe Reports</h2>
        {venue.vibeReports && venue.vibeReports.length > 0 ? (
          <div className="grid gap-4">
            {venue.vibeReports.map((report: VibeReport) => (
              <div
                key={report.id}
                className="bg-card border border-border rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getVibeLevelColor(report.vibeLevel)}`}>
                      {report.vibeLevel}
                    </span>
                    <span className={`font-semibold ${getQueueLengthColor(report.queueLength)}`}>
                      Queue: {report.queueLength}
                    </span>
                    <span className="text-gray-600">
                      Cover: ${report.coverCharge}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(report.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Music: </span>
                  <span className="font-medium">{report.musicGenre}</span>
                </div>
                
                {report.notes && (
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm text-muted-foreground">{report.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No vibe reports yet. Be the first to report the vibe!
          </div>
        )}
      </div>
    </div>
  );
} 