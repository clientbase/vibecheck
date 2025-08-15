import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface GoogleMapsButtonProps {
  address: string;
  placeId?: string; // Google Place ID for direct venue link
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function GoogleMapsButton({ 
  address, 
  placeId,
  variant = "outline", 
  size = "sm",
  className 
}: GoogleMapsButtonProps) {
  const handleOpenMaps = () => {
    let mapsUrl: string;
    
    if (placeId) {
      // Use Place ID for direct venue link
      mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    } else {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(address);
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }
    
    window.open(mapsUrl, '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleOpenMaps}
      className={className}
    >
      <MapPin className="h-4 w-4" />
      {size !== "icon" && "Open in Maps"}
    </Button>
  );
} 