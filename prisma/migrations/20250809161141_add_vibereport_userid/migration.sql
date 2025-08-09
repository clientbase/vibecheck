-- AlterTable
ALTER TABLE "public"."VibeReport" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."VibeReport" ADD CONSTRAINT "VibeReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
