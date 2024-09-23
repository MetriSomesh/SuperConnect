/*
  Warnings:

  - You are about to drop the column `connections` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Connections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Connections" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "connections";

-- CreateTable
CREATE TABLE "Recommendations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchingPercentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Recommendations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendations" ADD CONSTRAINT "Recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
