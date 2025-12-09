-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "role",
ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';
