-- CreateTable
CREATE TABLE "Twitter" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "account_id" INTEGER,
    "username" TEXT,
    "location" TEXT,
    "descripiton" TEXT,
    "name" TEXT,

    CONSTRAINT "Twitter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Twitter_userId_key" ON "Twitter"("userId");

-- AddForeignKey
ALTER TABLE "Twitter" ADD CONSTRAINT "Twitter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
