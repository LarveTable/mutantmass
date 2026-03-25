/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_userId_key" ON "Exercise"("name", "userId");
