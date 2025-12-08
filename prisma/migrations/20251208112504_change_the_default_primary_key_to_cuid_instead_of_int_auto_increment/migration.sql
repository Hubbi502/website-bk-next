/*
  Warnings:

  - The primary key for the `admins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `articles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `visits` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_authorId_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_approvedBy_fkey";

-- AlterTable
ALTER TABLE "admins" DROP CONSTRAINT "admins_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "admins_id_seq";

-- AlterTable
ALTER TABLE "articles" DROP CONSTRAINT "articles_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "authorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "articles_id_seq";

-- AlterTable
ALTER TABLE "visits" DROP CONSTRAINT "visits_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "approvedBy" SET DATA TYPE TEXT,
ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "visits_id_seq";

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
