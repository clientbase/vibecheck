/*
  Dumps the database contents into JSON files.
  - Output directory: provided as first arg, or defaults to ./db-dump-YYYYMMDD-HHmmss
  - Files: venues.json, vibeReports.json
*/

import { PrismaClient } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const outputArg = process.argv[2];
    const defaultDir = `db-dump-${formatTimestamp(new Date())}`;
    const outputDir = outputArg ? outputArg : defaultDir;
    const absOutputDir = join(process.cwd(), outputDir);

    if (!existsSync(absOutputDir)) {
      await mkdir(absOutputDir, { recursive: true });
    }

    const [venues, vibeReports] = await Promise.all([
      prisma.venue.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.vibeReport.findMany({
        orderBy: { submittedAt: 'asc' },
      }),
    ]);

    const venuesPath = join(absOutputDir, 'venues.json');
    const reportsPath = join(absOutputDir, 'vibeReports.json');

    await Promise.all([
      writeFile(venuesPath, JSON.stringify(venues, null, 2), 'utf8'),
      writeFile(reportsPath, JSON.stringify(vibeReports, null, 2), 'utf8'),
    ]);

    // eslint-disable-next-line no-console
    console.log(`Dumped ${venues.length} venues → ${venuesPath}`);
    // eslint-disable-next-line no-console
    console.log(`Dumped ${vibeReports.length} vibe reports → ${reportsPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Dump failed:', err);
  process.exit(1);
});


