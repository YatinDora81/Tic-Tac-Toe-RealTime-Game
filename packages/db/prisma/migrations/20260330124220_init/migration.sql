-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('CLASSIC', 'TIMED');

-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('X_WIN', 'O_WIN', 'DRAW', 'FORFEIT', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "Symbol" AS ENUM ('X', 'O');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestPlayer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "mode" "GameMode" NOT NULL DEFAULT 'CLASSIC',
    "result" "GameResult",
    "playerXId" TEXT,
    "playerXGuestId" TEXT,
    "playerOId" TEXT,
    "playerOGuestId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Move" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT,
    "playerGuestId" TEXT,
    "position" INTEGER NOT NULL,
    "symbol" "Symbol" NOT NULL,
    "moveNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStats_userId_key" ON "PlayerStats"("userId");

-- CreateIndex
CREATE INDEX "PlayerStats_rating_idx" ON "PlayerStats"("rating" DESC);

-- CreateIndex
CREATE INDEX "PlayerStats_userId_idx" ON "PlayerStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_roomCode_key" ON "Game"("roomCode");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "Game_roomCode_idx" ON "Game"("roomCode");

-- CreateIndex
CREATE INDEX "Game_playerXId_idx" ON "Game"("playerXId");

-- CreateIndex
CREATE INDEX "Game_playerOId_idx" ON "Game"("playerOId");

-- CreateIndex
CREATE INDEX "Game_playerXGuestId_idx" ON "Game"("playerXGuestId");

-- CreateIndex
CREATE INDEX "Game_playerOGuestId_idx" ON "Game"("playerOGuestId");

-- CreateIndex
CREATE INDEX "Game_createdAt_idx" ON "Game"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Move_gameId_moveNumber_idx" ON "Move"("gameId", "moveNumber");

-- CreateIndex
CREATE INDEX "Move_playerId_idx" ON "Move"("playerId");

-- CreateIndex
CREATE INDEX "Move_playerGuestId_idx" ON "Move"("playerGuestId");

-- AddForeignKey
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerXId_fkey" FOREIGN KEY ("playerXId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerXGuestId_fkey" FOREIGN KEY ("playerXGuestId") REFERENCES "GuestPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerOId_fkey" FOREIGN KEY ("playerOId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerOGuestId_fkey" FOREIGN KEY ("playerOGuestId") REFERENCES "GuestPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_playerGuestId_fkey" FOREIGN KEY ("playerGuestId") REFERENCES "GuestPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
