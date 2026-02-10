-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "assignedClasses" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "targetTeacherId" TEXT;

-- CreateIndex
CREATE INDEX "visits_targetTeacherId_idx" ON "visits"("targetTeacherId");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_targetTeacherId_fkey" FOREIGN KEY ("targetTeacherId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
