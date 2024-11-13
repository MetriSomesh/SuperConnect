-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twitterAuthToken" TEXT DEFAULT '',
ADD COLUMN     "twitterCsrfToken" TEXT NOT NULL DEFAULT '';
