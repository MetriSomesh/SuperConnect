-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "interests" TEXT[],
    "connections" TEXT[],
    "profileaPic" TEXT,
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connections" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitaions" (
    "id" SERIAL NOT NULL,
    "senerId" INTEGER NOT NULL,
    "message" TEXT,

    CONSTRAINT "Invitaions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Invitaions_senerId_key" ON "Invitaions"("senerId");

-- AddForeignKey
ALTER TABLE "Invitaions" ADD CONSTRAINT "Invitaions_senerId_fkey" FOREIGN KEY ("senerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
