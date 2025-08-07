import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Venue } from "@/lib/types";
import { formatDistance, getVibeEmoji } from "@/lib/utils";
import { GoogleMapsButton } from "@/components/GoogleMapsButton";

type VenueCardProps = {
  venue: Venue;
  onClick?: () => void;
  distance?: number;
};



export function VenueCard({ venue, onClick, distance }: VenueCardProps) {
  return (
    <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition" onClick={onClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="truncate">{venue.name}</CardTitle>
            <div className="text-xs text-muted-foreground">{venue.address}</div>
          </div>
          {distance !== undefined && (
            <Badge variant="outline" className="text-xs ml-2">
              📍 {formatDistance(distance)}
            </Badge>
          )}
        </div>
      </CardHeader>
      {venue.coverPhotoUrl && (
        <img
          src={venue.coverPhotoUrl}
          alt={venue.name}
          className="w-full h-40 object-cover"
        />
      )}
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-3">
          {venue.categories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="text-xs"
            >
              {cat}
            </Badge>
          ))}
        </div>
        
        {/* Vibe Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="text-4xl">{getVibeEmoji(venue.aggregatedData?.averageVibeLevel)}</span>
                <span className="text-base font-bold text-muted-foreground px-2 py-1">
                  {venue.aggregatedData?.averageVibeLevel || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Total: {venue.aggregatedData?.totalVibes || 0} vibes
                </span>
                <span className="text-xs text-muted-foreground">
                  Last hour: {venue.aggregatedData?.vibesLastHour || 0} vibes
                </span>
              </div>
            </div>
          </div>
          
          {/* Cover & Line Info */}
          {/* <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span className="font-medium">
                {venue.aggregatedData?.averageCoverCharge ? `$${venue.aggregatedData.averageCoverCharge}` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>⏳</span>
              <span className="font-medium">
                {venue.aggregatedData?.averageQueueLength || 'N/A'}
              </span>
            </div>
          </div> */}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-2">
          {venue.isFeatured && (
            <Badge className="text-xs bg-yellow-500 text-dark hover:bg-yellow-600">
              Featured
            </Badge>
          )}
        </div>
        <GoogleMapsButton 
          address={venue.address}
          venueName={venue.name}
          variant="outline"
          size="sm"
        />
      </CardFooter>
    </Card>
  );
}