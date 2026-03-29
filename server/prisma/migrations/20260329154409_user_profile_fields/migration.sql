-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "sex" "Sex",
ADD COLUMN     "weight" DOUBLE PRECISION;
