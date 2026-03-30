import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { jwtVerify } from "jose";
import type { AuthTokenPayload } from "@repo/common/types/auth";
import game from "./game";

const PORT = parseInt(process.env.WS_PORT ?? "8081", 10);
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-me",
);

async function authenticate(url: string): Promise<AuthTokenPayload | null> {
  try {
    const token = new URL(url, "http://localhost").searchParams.get("token");
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const httpServer = createServer(app);
const socketToUser = new Map<WebSocket, AuthTokenPayload>();
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", async (socket: WebSocket, req) => {
  const user = await authenticate(req.url ?? "");
  if (!user) {
    socket.close(4001, "Unauthorized");
    return;
  }

  socketToUser.set(socket, user);
  game.onConnect(user.id, socket, user.name, user.isGuest);

  socket.on("message", async (data) => {
    try {
      const { type, payload } = JSON.parse(data.toString());

      switch (type) {
        case "join_game":
          await game.handleJoinGame(
            socket,
            user.id,
            user.name,
            user.isGuest,
            payload,
          );
          break;
        case "find_match":
          await game.handleFindMatch(
            socket,
            user.id,
            user.name,
            user.isGuest,
            payload,
          );
          break;
        case "make_move":
          await game.handleMakeMove(socket, user.id, user.isGuest, payload);
          break;
        case "leave_game":
          await game.handleLeaveGame(user.id, user.isGuest);
          break;
        default:
          socket.send(
            JSON.stringify({
              type: "error",
              data: { message: `Unknown message type: ${type}` },
            }),
          );
      }
    } catch {
      socket.send(
        JSON.stringify({
          type: "error",
          data: { message: "Invalid message format" },
        }),
      );
    }
  });

  socket.on("close", () => {
    const user = socketToUser.get(socket);
    if (user) {
      game.onDisconnect(user.id, socket, user.isGuest);
      socketToUser.delete(socket);
    }
  });

  socket.on("error", (err) => console.error("WebSocket error:", err.message));
});

httpServer.listen(PORT, () =>
  console.log(`WebSocket server running on ws://localhost:${PORT}`),
);
