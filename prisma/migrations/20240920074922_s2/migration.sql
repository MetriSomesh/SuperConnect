-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "interests" DROP NOT NULL,
ALTER COLUMN "interests" SET DATA TYPE TEXT,
ALTER COLUMN "connections" DROP NOT NULL,
ALTER COLUMN "connections" SET DATA TYPE TEXT;
