"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSocket } from "@/lib/socket";

interface SocketContextValue {
  isConnected: boolean;
  socket: ReturnType<typeof getSocket>;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children, token }: { children: ReactNode; token?: string }) {
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (token) {
      socket.auth = { token };
    }
    socket.connect();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [token, socket]);

  return (
    <SocketContext.Provider value={{ isConnected, socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
