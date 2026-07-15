"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env["NEXT_PUBLIC_WS_URL"] || "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function connectSocket(token?: string): Socket {
  const s = getSocket();
  if (s.connected) return s;
  if (token) s.auth = { token };
  s.connect();
  return s;
}

export function disconnectSocket() {
  const s = getSocket();
  s.disconnect();
}

export function subscribeToExecution(
  executionId: string,
  callback: (data: unknown) => void
) {
  const s = getSocket();
  s.emit("subscribe:execution", { executionId });
  s.on(`execution:update:${executionId}`, callback);
  return () => {
    s.off(`execution:update:${executionId}`, callback);
    s.emit("unsubscribe:execution", { executionId });
  };
}

export function subscribeToFlowUpdates(
  flowId: string,
  callback: (data: unknown) => void
) {
  const s = getSocket();
  s.emit("subscribe:flow", { flowId });
  s.on(`flow:update:${flowId}`, callback);
  return () => {
    s.off(`flow:update:${flowId}`, callback);
    s.emit("unsubscribe:flow", { flowId });
  };
}
