import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await Bun.password.hash("password123", "bcrypt");

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice",
      email: "alice@example.com",
      password: hashedPassword,
      stats: { create: { wins: 15, losses: 5, draws: 3, currentStreak: 4, maxStreak: 7, rating: 1180, gamesPlayed: 23 } },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob",
      email: "bob@example.com",
      password: hashedPassword,
      stats: { create: { wins: 10, losses: 8, draws: 2, currentStreak: 1, maxStreak: 5, rating: 1050, gamesPlayed: 20 } },
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: {
      name: "Charlie",
      email: "charlie@example.com",
      password: hashedPassword,
      stats: { create: { wins: 20, losses: 3, draws: 1, currentStreak: 10, maxStreak: 10, rating: 1320, gamesPlayed: 24 } },
    },
  });

  const diana = await prisma.user.upsert({
    where: { email: "diana@example.com" },
    update: {},
    create: {
      name: "Diana",
      email: "diana@example.com",
      password: hashedPassword,
      stats: { create: { wins: 7, losses: 12, draws: 4, currentStreak: 0, maxStreak: 3, rating: 920, gamesPlayed: 23 } },
    },
  });

  const eve = await prisma.user.upsert({
    where: { email: "eve@example.com" },
    update: {},
    create: {
      name: "Eve",
      email: "eve@example.com",
      password: hashedPassword,
      stats: { create: { wins: 12, losses: 6, draws: 2, currentStreak: 3, maxStreak: 6, rating: 1140, gamesPlayed: 20 } },
    },
  });

  const guestPlayer = await prisma.guestPlayer.create({
    data: { name: "RandomGuest" },
  });

  console.log("Created users:", { alice: alice.id, bob: bob.id, charlie: charlie.id, diana: diana.id, eve: eve.id });
  console.log("Created guest:", guestPlayer.id);

  // Create completed games using GamePlayer join table
  const game1 = await prisma.game.create({
    data: {
      roomCode: "SEED01",
      status: "COMPLETED",
      mode: "CLASSIC",
      result: "X_WIN",
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3500000),
      players: {
        create: [
          { userId: alice.id, symbol: "X" },
          { userId: bob.id, symbol: "O" },
        ],
      },
      moves: {
        create: [
          { playerId: alice.id, position: 0, symbol: "X", moveNumber: 1 },
          { playerId: bob.id, position: 3, symbol: "O", moveNumber: 2 },
          { playerId: alice.id, position: 4, symbol: "X", moveNumber: 3 },
          { playerId: bob.id, position: 5, symbol: "O", moveNumber: 4 },
          { playerId: alice.id, position: 8, symbol: "X", moveNumber: 5 },
        ],
      },
    },
  });

  const game2 = await prisma.game.create({
    data: {
      roomCode: "SEED02",
      status: "COMPLETED",
      mode: "CLASSIC",
      result: "X_WIN",
      startedAt: new Date(Date.now() - 1800000),
      completedAt: new Date(Date.now() - 1700000),
      players: {
        create: [
          { userId: charlie.id, symbol: "X" },
          { guestId: guestPlayer.id, symbol: "O" },
        ],
      },
      moves: {
        create: [
          { playerId: charlie.id, position: 0, symbol: "X", moveNumber: 1 },
          { playerGuestId: guestPlayer.id, position: 1, symbol: "O", moveNumber: 2 },
          { playerId: charlie.id, position: 3, symbol: "X", moveNumber: 3 },
          { playerGuestId: guestPlayer.id, position: 4, symbol: "O", moveNumber: 4 },
          { playerId: charlie.id, position: 6, symbol: "X", moveNumber: 5 },
        ],
      },
    },
  });

  const game3 = await prisma.game.create({
    data: {
      roomCode: "SEED03",
      status: "COMPLETED",
      mode: "TIMED",
      result: "DRAW",
      startedAt: new Date(Date.now() - 7200000),
      completedAt: new Date(Date.now() - 7100000),
      players: {
        create: [
          { userId: eve.id, symbol: "X" },
          { userId: diana.id, symbol: "O" },
        ],
      },
      moves: {
        create: [
          { playerId: eve.id, position: 0, symbol: "X", moveNumber: 1 },
          { playerId: diana.id, position: 1, symbol: "O", moveNumber: 2 },
          { playerId: eve.id, position: 2, symbol: "X", moveNumber: 3 },
          { playerId: diana.id, position: 3, symbol: "O", moveNumber: 4 },
          { playerId: eve.id, position: 5, symbol: "X", moveNumber: 5 },
          { playerId: diana.id, position: 4, symbol: "O", moveNumber: 6 },
          { playerId: eve.id, position: 6, symbol: "X", moveNumber: 7 },
          { playerId: diana.id, position: 8, symbol: "O", moveNumber: 8 },
          { playerId: eve.id, position: 7, symbol: "X", moveNumber: 9 },
        ],
      },
    },
  });

  console.log("Created games:", { game1: game1.id, game2: game2.id, game3: game3.id });
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
