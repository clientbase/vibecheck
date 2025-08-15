/*
  Warnings:

  - A unique constraint covering the columns `[google_place_id]` on the table `Venue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Venue" ADD COLUMN     "google_place_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Venue_google_place_id_key" ON "public"."Venue"("google_place_id");
