import { VenueAggregatedData } from './types';
import type { VibeReport } from '@/lib/generated/prisma';
import { VibeLevel, QueueLength } from '@/lib/generated/prisma';

export function calculateVenueAggregatedData(vibeReports: VibeReport[]): VenueAggregatedData {
  if (vibeReports.length === 0) {
    return {
      totalVibes: 0,
      vibesLastHour: 0,
      averageVibeLevel: null,
      averageQueueLength: null,
      averageCoverCharge: null,
      mostCommonMusicGenre: null,
      lastVibeReportAt: null,
    };
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Filter reports from last hour
  const vibesLastHour = vibeReports.filter(
    report => new Date(report.submittedAt) >= oneHourAgo
  ).length;

  // Calculate average vibe level
  const vibeLevelValues = {
    [VibeLevel.DEAD]: 1,
    [VibeLevel.MID]: 2,
    [VibeLevel.LIT]: 3,
    [VibeLevel.CHAOTIC]: 4,
  };

  const validVibeReports = vibeReports.filter(report => report.vibeLevel);
  const averageVibeLevel = validVibeReports.length > 0
    ? calculateAverageVibeLevel(validVibeReports.map(r => r.vibeLevel))
    : null;

  // Calculate average queue length
  const queueLengthValues = {
    [QueueLength.NONE]: 0,
    [QueueLength.SHORT]: 1,
    [QueueLength.LONG]: 2,
    [QueueLength.INSANE]: 3,
  };

  const validQueueReports = vibeReports.filter(report => report.queueLength);
  const averageQueueLength = validQueueReports.length > 0
    ? calculateAverageQueueLength(validQueueReports.map(r => r.queueLength!))
    : null;

  // Calculate average cover charge
  const coverChargeReports = vibeReports.filter(report => report.coverCharge !== null);
  const averageCoverCharge = coverChargeReports.length > 0
    ? coverChargeReports.reduce((sum, report) => sum + (report.coverCharge || 0), 0) / coverChargeReports.length
    : null;

  // Find most common music genre
  const musicGenreCounts = new Map<string, number>();
  vibeReports.forEach(report => {
    if (report.musicGenre) {
      musicGenreCounts.set(report.musicGenre, (musicGenreCounts.get(report.musicGenre) || 0) + 1);
    }
  });

  let mostCommonMusicGenre: string | null = null;
  let maxCount = 0;
  musicGenreCounts.forEach((count, genre) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonMusicGenre = genre;
    }
  });

  // Find last vibe report
  const lastVibeReportAt = vibeReports.length > 0
    ? new Date(Math.max(...vibeReports.map(r => new Date(r.submittedAt).getTime())))
    : null;

  return {
    totalVibes: vibeReports.length,
    vibesLastHour,
    averageVibeLevel,
    averageQueueLength,
    averageCoverCharge: averageCoverCharge ? Math.round(averageCoverCharge * 100) / 100 : null,
    mostCommonMusicGenre,
    lastVibeReportAt,
  };
}

function calculateAverageVibeLevel(vibeLevels: VibeLevel[]): VibeLevel {
  const vibeLevelValues = {
    [VibeLevel.DEAD]: 1,
    [VibeLevel.MID]: 2,
    [VibeLevel.LIT]: 3,
    [VibeLevel.CHAOTIC]: 4,
  };

  const total = vibeLevels.reduce((sum, level) => sum + vibeLevelValues[level], 0);
  const average = total / vibeLevels.length;

  // Map back to vibe level
  if (average <= 1.5) return VibeLevel.DEAD;
  if (average <= 2.5) return VibeLevel.MID;
  if (average <= 3.5) return VibeLevel.LIT;
  return VibeLevel.CHAOTIC;
}

function calculateAverageQueueLength(queueLengths: QueueLength[]): QueueLength {
  const queueLengthValues = {
    [QueueLength.NONE]: 0,
    [QueueLength.SHORT]: 1,
    [QueueLength.LONG]: 2,
    [QueueLength.INSANE]: 3,
  };

  const total = queueLengths.reduce((sum, length) => sum + queueLengthValues[length], 0);
  const average = total / queueLengths.length;

  // Map back to queue length
  if (average <= 0.5) return QueueLength.NONE;
  if (average <= 1.5) return QueueLength.SHORT;
  if (average <= 2.5) return QueueLength.LONG;
  return QueueLength.INSANE;
} 