/*
  Warnings:

  - You are about to drop the column `class` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `visits` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VisitStatus" ADD VALUE 'WAITING';
ALTER TYPE "VisitStatus" ADD VALUE 'AWAITING_STUDENT';
ALTER TYPE "VisitStatus" ADD VALUE 'PENDING_TIME_NEGOTIATION';
ALTER TYPE "VisitStatus" ADD VALUE 'PENDING_DELEGATION';

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "emailPublic" TEXT,
ADD COLUMN     "expertise" TEXT,
ADD COLUMN     "officeHours" TEXT,
ADD COLUMN     "officeLocation" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "positionTitle" TEXT,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "shortBio" TEXT,
ADD COLUMN     "socialLinks" TEXT;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "class",
ADD COLUMN     "classId" TEXT;

-- AlterTable
ALTER TABLE "visits" DROP COLUMN "class",
ADD COLUMN     "assignedAdminId" TEXT,
ADD COLUMN     "classId" TEXT,
ADD COLUMN     "delegationStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "proposedVisitDate" TIMESTAMP(3),
ADD COLUMN     "proposedVisitTime" TEXT,
ADD COLUMN     "rejectedAdminIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "timeNegotiationNotes" TEXT,
ADD COLUMN     "timeNegotiationStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "waitDurationMinutes" INTEGER,
ADD COLUMN     "waitExpiredAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "majors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "majorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_notes" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "majors_code_key" ON "majors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE INDEX "classes_majorId_idx" ON "classes"("majorId");

-- CreateIndex
CREATE INDEX "visit_notes_visitId_idx" ON "visit_notes"("visitId");

-- CreateIndex
CREATE INDEX "visits_classId_idx" ON "visits"("classId");

-- CreateIndex
CREATE INDEX "visits_assignedAdminId_idx" ON "visits"("assignedAdminId");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_notes" ADD CONSTRAINT "visit_notes_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
