"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/use-auth";
import { useSocket } from "../hooks/use-socket";
import { Navbar } from "../components/shared/navbar";
import { AuthPage } from "../components/auth/auth-page";
import { PlayOptions } from "../components/lobby/play-options";
import { API_URL, WS_HTTP_URL } from "../lib/constants";

export default function HomePage() {
  const { user, loading } = useAuth();
  const { connect, disconnect, isConnected } = useSocket();
  const connectAttemptedRef = useRef(false);

  // Health ping to wake up both servers every 2s
  useEffect(() => {
    const ping = () => {
      fetch(`${API_URL}/health`).catch(() => {});
      fetch(`${WS_HTTP_URL}/health`).catch(() => {});
    };

    ping(); // immediate first ping
    const interval = setInterval(ping, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-connect WebSocket once authenticated with toast.promise
  useEffect(() => {
    if (user && !isConnected && !connectAttemptedRef.current) {
      connectAttemptedRef.current = true;
      toast.promise(connect(), {
        loading: "Connecting to server...",
        success: "Connected!",
        error: "Failed to connect to server",
      });
    }
    if (!user && isConnected) {
      disconnect();
    }
    if (!user) {
      connectAttemptedRef.current = false;
    }
  }, [user, isConnected, connect, disconnect]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500" />
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
          <h1 className="text-3xl font-bold mb-2">
            Welcome, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="text-white/40">Choose how you want to play</p>
        </div>
        <PlayOptions />
      </main>
    </div>
  );
}
