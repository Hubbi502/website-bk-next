-- CreateEnum
CREATE TYPE "DelegationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "VisitStatus" ADD VALUE 'FORWARDED';

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "delegatedToTeacherId" TEXT,
ADD COLUMN     "delegationNotes" TEXT,
ADD COLUMN     "delegationStatus" "DelegationStatus",
ADD COLUMN     "forwardedToCoordinator" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "visits_delegatedToTeacherId_idx" ON "visits"("delegatedToTeacherId");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_delegatedToTeacherId_fkey" FOREIGN KEY ("delegatedToTeacherId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
