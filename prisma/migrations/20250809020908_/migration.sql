-- CreateEnum
CREATE TYPE "public"."VibeLevel" AS ENUM ('DEAD', 'MID', 'LIT', 'CHAOTIC');

-- CreateEnum
CREATE TYPE "public"."QueueLength" AS ENUM ('NONE', 'SHORT', 'LONG', 'INSANE');

-- CreateTable
CREATE TABLE "public"."Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "categories" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "coverPhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VibeReport" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vibeLevel" INTEGER NOT NULL,
    "queueLength" "public"."QueueLength",
    "coverCharge" INTEGER,
    "musicGenre" TEXT,
    "notes" TEXT,
    "imageUrl" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "geoHint" TEXT,
    "userAnonId" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VibeReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "public"."Venue"("slug");

-- AddForeignKey
ALTER TABLE "public"."VibeReport" ADD CONSTRAINT "VibeReport_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
