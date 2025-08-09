export type VibeDescriptor = {
  label: string;
  emoji: string;
  colorClass: string; // tailwind text color class
  description: string;
};

export const VIBE_LEVELS: Record<number, VibeDescriptor> = {
  1: { label: 'COOKING',   emoji: '🌅', colorClass: 'text-red-500',     description: 'Things are warming up' },
  2: { label: 'CHILL',     emoji: '😎', colorClass: 'text-yellow-500',  description: 'Laid-back, casual vibes' },
  3: { label: 'LIT',       emoji: '🔥', colorClass: 'text-green-500',   description: 'Great energy, good crowd' },
  4: { label: 'INSANE', emoji: '🎉', colorClass: 'text-purple-500',  description: 'Peak energy, big moments' },
  5: { label: 'LEGENDARY',    emoji: '👑', colorClass: 'text-pink-500',    description: 'Off the charts' },
};

export function getVibeDescriptor(level?: number | null): VibeDescriptor {
  if (level == null) return { label: 'UNKNOWN', emoji: '🎵', colorClass: 'text-gray-500', description: 'Unknown vibe' };
  const min = 1;
  const max = Math.max(...Object.keys(VIBE_LEVELS).map((k) => Number(k)));
  const idx = Math.min(max, Math.max(min, Math.round(level)));
  return VIBE_LEVELS[idx] || { label: `LEVEL ${idx}`, emoji: '🎵', colorClass: 'text-gray-500', description: 'Unknown vibe' };
}


