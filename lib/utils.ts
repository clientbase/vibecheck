import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { VibeLevel } from "@/lib/generated/prisma"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

// Get emoji for vibe level
export function getVibeEmoji(vibeLevel: VibeLevel | null | undefined): string {
  if (!vibeLevel) return '😐';
  
  switch (vibeLevel) {
    case VibeLevel.DEAD:
      return '💀';
    case VibeLevel.MID:
      return '😐';
    case VibeLevel.LIT:
      return '🔥';
    case VibeLevel.CHAOTIC:
      return '🤪';
    default:
      return '😐';
  }
}
