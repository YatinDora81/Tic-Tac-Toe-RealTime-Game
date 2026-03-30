"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useSocket } from "../hooks/use-socket";
import { Navbar } from "../components/shared/navbar";
import { AuthPage } from "../components/auth/auth-page";
import { PlayOptions } from "../components/lobby/play-options";

export default function HomePage() {
  const { user, loading } = useAuth();
  const { connect, disconnect, isConnected } = useSocket();

  // Auto-connect WebSocket once authenticated, disconnect on logout
  useEffect(() => {
    if (user && !isConnected) {
      connect();
    }
    if (!user && isConnected) {
      disconnect();
    }
  }, [user, isConnected, connect, disconnect]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-gray-400">Choose how you want to play</p>
        </div>
        <PlayOptions />
      </main>
    </div>
  );
}
