"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../hooks/use-auth";
import { SocketProvider } from "../hooks/use-socket";
import { GameProvider } from "../hooks/use-game";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <GameProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(15, 15, 30, 0.9)",
                backdropFilter: "blur(24px)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                fontSize: "14px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#030014" },
                duration: 2000,
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#030014" },
                duration: 3000,
              },
              loading: {
                iconTheme: { primary: "#818cf8", secondary: "#030014" },
              },
            }}
          />
          {children}
        </GameProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
