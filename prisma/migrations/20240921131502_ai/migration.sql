-- AlterTable
ALTER TABLE "User" ADD COLUMN     "AIDescription" TEXT,
ALTER COLUMN "accessToken" SET DEFAULT '',
ALTER COLUMN "refreshToken" SET DEFAULT '';
