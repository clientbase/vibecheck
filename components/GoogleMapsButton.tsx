import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface GoogleMapsButtonProps {
  address: string;
  venueName?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function GoogleMapsButton({ 
  address, 
  venueName, 
  variant = "outline", 
  size = "sm",
  className 
}: GoogleMapsButtonProps) {
  const handleOpenMaps = () => {
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
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