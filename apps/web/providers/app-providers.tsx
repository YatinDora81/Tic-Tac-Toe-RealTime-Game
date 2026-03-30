"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../hooks/use-auth";
import { SocketProvider } from "../hooks/use-socket";
import { GameProvider } from "../hooks/use-game";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <GameProvider>
          {children}
        </GameProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
