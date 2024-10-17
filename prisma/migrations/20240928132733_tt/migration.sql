/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Twitter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Twitter_userId_key" ON "Twitter"("userId");
