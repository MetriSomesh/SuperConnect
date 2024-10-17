-- CreateTable
CREATE TABLE "Invitation2" (
    "id" SERIAL NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "connectors" TEXT[],

    CONSTRAINT "Invitation2_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invitation2" ADD CONSTRAINT "Invitation2_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
