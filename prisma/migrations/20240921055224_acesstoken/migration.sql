-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "refreshToken" TEXT NOT NULL DEFAULT '';
