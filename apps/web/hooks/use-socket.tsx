"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import { WS_URL } from "../lib/constants";

type MessageHandler = (message: any) => void;

interface SocketContextValue {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (type: string, payload: any) => void;
  onMessage: (handler: MessageHandler) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);

  const connect = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("token");
      if (!token) {
        reject(new Error("No auth token"));
        return;
      }

      // Already connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // Close stale socket if exists but not open
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.onopen = null;
        wsRef.current = null;
      }

      reconnectAttemptRef.current = 0;
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      let settled = false;

      ws.onopen = () => {
        if (wsRef.current === ws) {
          setIsConnected(true);
          reconnectAttemptRef.current = 0;
        }
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handlersRef.current.forEach((handler) => handler(message));
        } catch {
          // ignore invalid messages
        }
      };

      ws.onclose = () => {
        // Only handle if this is still the active socket
        if (wsRef.current !== ws) return;

        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect with exponential backoff
        const attempt = reconnectAttemptRef.current;
        if (attempt < 5) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 16000);
          reconnectRef.current = setTimeout(() => {
            reconnectAttemptRef.current++;
            connect().catch(() => {});
          }, delay);
        }
      };

      ws.onerror = () => {
        if (!settled) {
          settled = true;
          reject(new Error("Connection failed"));
        }
      };

      wsRef.current = ws;
    });
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    reconnectAttemptRef.current = 999;

    if (wsRef.current) {
      // Detach handlers so old onclose doesn't clobber new state
      const oldWs = wsRef.current;
      oldWs.onclose = null;
      oldWs.onerror = null;
      oldWs.onmessage = null;
      oldWs.onopen = null;
      oldWs.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type, payload }));
      }
    } catch (err) {
      console.error("Failed to send WS message:", err);
    }
  }, []);

  const onMessage = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <SocketContext.Provider value={{ isConnected, connect, disconnect, sendMessage, onMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
