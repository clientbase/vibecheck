import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Venue } from "@/lib/types";
import { formatDistance, getVibeEmoji, getVibeLabel } from "@/lib/utils";
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
      
      {/* Always show image area - either cover photo or placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center relative overflow-hidden">
        {venue.coverPhotoUrl ? (
          <img
            src={venue.coverPhotoUrl}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="text-4xl mb-2">🎵</div>
            <div className="text-sm font-medium opacity-90">Venue Photo</div>
            <div className="text-xs opacity-75">Coming Soon</div>
          </div>
        )}
      </div>

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
        
        {/* Vibe Emoji and Text */}
        <div className="flex flex-col items-center mb-3">
          <span className="text-4xl">{getVibeEmoji(venue.aggregatedData?.averageVibeLevel)}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">
            {getVibeLabel(venue.aggregatedData?.averageVibeLevel) || 'N/A'}
          </span>
        </div>
        
        {/* Vibe Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {venue.aggregatedData?.totalVibes || 0}
            </div>
            <div className="text-xs text-muted-foreground">Total Vibes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {venue.aggregatedData?.vibesLastHour || 0}
            </div>
            <div className="text-xs text-muted-foreground">Last Hour</div>
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