/*
  Warnings:

  - You are about to drop the column `restTime` on the `Set` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Set" DROP COLUMN "restTime";

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "restTimer" INTEGER;
