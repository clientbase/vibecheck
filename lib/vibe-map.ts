export type VibeDescriptor = {
  label: string;
  emoji: string;
  colorClass: string; // tailwind text color class
};

export const VIBE_LEVELS: Record<number, VibeDescriptor> = {
  1: { label: 'DEAD', emoji: '💀', colorClass: 'text-red-500' },
  2: { label: 'MID', emoji: '😐', colorClass: 'text-yellow-500' },
  3: { label: 'LIT', emoji: '🔥', colorClass: 'text-green-500' },
  4: { label: 'CHAOTIC', emoji: '🤪', colorClass: 'text-purple-500' },
  5: { label: 'INSANE', emoji: '🎉', colorClass: 'text-pink-500' }, // spare slot for future
};

export function getVibeDescriptor(level?: number | null): VibeDescriptor {
  if (!level) return { label: 'UNKNOWN', emoji: '🎵', colorClass: 'text-gray-500' };
  return VIBE_LEVELS[level] || { label: `LEVEL ${level}`, emoji: '🎵', colorClass: 'text-gray-500' };
}


