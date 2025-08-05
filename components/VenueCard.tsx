import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Venue } from "@/lib/types";

type VenueCardProps = {
  venue: Venue;
  onClick?: () => void;
};

export function VenueCard({ venue, onClick }: VenueCardProps) {
  return (
    <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition" onClick={onClick}>
      {venue.coverPhotoUrl && (
        <img
          src={venue.coverPhotoUrl}
          alt={venue.name}
          className="w-full h-40 object-cover rounded-t-md"
        />
      )}
      <CardHeader>
        <CardTitle className="truncate">{venue.name}</CardTitle>
        <div className="text-xs text-muted-foreground">{venue.address}</div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {venue.categories.map((cat) => (
            <span
              key={cat}
              className="bg-muted px-2 py-0.5 rounded text-xs font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {venue.isFeatured && (
          <span className="text-xs font-semibold text-primary">Featured</span>
        )}
      </CardFooter>
    </Card>
  );
}