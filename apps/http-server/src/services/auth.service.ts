import { signJwt } from "@config/jwt";
import userRepository from "@repository/user.repository";
import type { AuthTokenPayload } from "@repo/common/types/auth";

class AuthService {
  register = async (name: string, email: string, password: string) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await Bun.password.hash(password, "bcrypt");
    const user = await userRepository.createUser({ name, email, password: hashedPassword });

    const payload: AuthTokenPayload = { id: user.id, name: user.name, isGuest: false, email: user.email };
    const token = await signJwt(payload);
    return { user, token };
  };

  authenticate = async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const valid = await Bun.password.verify(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const payload: AuthTokenPayload = { id: user.id, name: user.name, isGuest: false, email: user.email };
    const token = await signJwt(payload);
    return { user, token };
  };

  createGuest = async (name: string) => {
    const registeredUser = await userRepository.findUserByName(name);
    if (registeredUser) {
      throw new Error("Name already taken");
    }

    const activeGuest = await userRepository.findActiveGuestByName(name);
    if (activeGuest) {
      throw new Error("Name already taken");
    }

    const guest = await userRepository.createGuestPlayer(name);

    const payload: AuthTokenPayload = { id: guest.id, name: guest.name, isGuest: true };
    const token = await signJwt(payload);
    return { guest, token };
  };

  getUserById = async (id: string) => {
    return userRepository.findById(id);
  };

  getGuestById = async (id: string) => {
    return userRepository.findGuestById(id);
  };
}

export default new AuthService();
