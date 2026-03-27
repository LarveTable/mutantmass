-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'LEGS', 'GLUTES', 'CORE', 'CARDIO', 'FULL_BODY');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "muscleGroup" "MuscleGroup";
