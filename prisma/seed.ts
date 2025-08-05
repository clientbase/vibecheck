import { PrismaClient } from '../lib/generated/prisma';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const venues = JSON.parse(fs.readFileSync('./prisma/venues_seed.json', 'utf8'));
  const vibeReports = JSON.parse(fs.readFileSync('./prisma/vibe_reports_seed.json', 'utf8'));

  console.log(`Seeding ${venues.length} venues...`);
  for (const venue of venues) {
    await prisma.venue.create({
      data: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        lat: venue.lat,
        lon: venue.lon,
        categories: venue.categories,
        isFeatured: venue.isFeatured,
        coverPhotoUrl: venue.coverPhotoUrl,
        createdAt: new Date(venue.createdAt),
        updatedAt: new Date(venue.updatedAt),
      },
    });
  }

  console.log(`Seeding ${vibeReports.length} vibe reports...`);
  for (const report of vibeReports) {
    await prisma.vibeReport.create({
      data: {
        id: report.id,
        venueId: report.venueId,
        submittedAt: new Date(report.submittedAt),
        vibeLevel: report.vibeLevel,
        queueLength: report.queueLength,
        coverCharge: report.coverCharge,
        musicGenre: report.musicGenre,
        notes: report.notes,
        ipAddress: report.ipAddress,
        userAgent: report.userAgent,
        geoHint: report.geoHint,
        userAnonId: report.userAnonId,
      },
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });