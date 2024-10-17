-- CreateTable
CREATE TABLE "ConnectionsOfConnections" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "connectionId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionsOfConnections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConnectionsOfConnections" ADD CONSTRAINT "ConnectionsOfConnections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionsOfConnections" ADD CONSTRAINT "ConnectionsOfConnections_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
