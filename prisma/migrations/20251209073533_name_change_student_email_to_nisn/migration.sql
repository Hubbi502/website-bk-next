/*
  Warnings:

  - You are about to drop the column `email` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nisn]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nisn` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "students_email_key";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "email",
ADD COLUMN     "nisn" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "students_nisn_key" ON "students"("nisn");
