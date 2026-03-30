import { prisma } from "db";

class UserRepository {
  createUser = async (data: { name: string; email: string; password: string }) => {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        stats: { create: {} },
      },
      include: { stats: true },
    });
  };

  createGuestPlayer = async (name: string) => {
    return prisma.guestPlayer.create({ data: { name } });
  };

  findByEmail = async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
      include: { stats: true },
    });
  };

  findById = async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: { stats: true },
    });
  };

  findGuestById = async (id: string) => {
    return prisma.guestPlayer.findUnique({ where: { id } });
  };

  findUserByName = async (name: string) => {
    return prisma.user.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  };

  findActiveGuestByName = async (name: string) => {
    return prisma.guestPlayer.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        games: {
          some: {
            game: { status: { in: ["WAITING", "IN_PROGRESS"] } },
          },
        },
      },
    });
  };
}

export default new UserRepository();
