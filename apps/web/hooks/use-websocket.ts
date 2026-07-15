"use client";

import { useEffect, useCallback, useRef } from "react";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket(token?: string) {
  const qc = useQueryClient();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    connectedRef.current = true;

    socket.on("execution:completed", () => {
      qc.invalidateQueries({ queryKey: ["executions"] });
      qc.invalidateQueries({ queryKey: ["flows"] });
    });

    socket.on("execution:started", () => {
      qc.invalidateQueries({ queryKey: ["executions"] });
    });

    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [token, qc]);
}

export function useExecutionSocket(executionId: string) {
  useEffect(() => {
    if (!executionId) return;
    const socket = getSocket();

    socket.emit("subscribe:execution", { executionId });

    return () => {
      socket.emit("unsubscribe:execution", { executionId });
    };
  }, [executionId]);
}

export function useFlowLiveUpdates(flowId: string, callback: (data: unknown) => void) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const stableCallback = useCallback((data: unknown) => {
    cbRef.current(data);
  }, []);

  useEffect(() => {
    if (!flowId) return;
    const socket = getSocket();
    socket.emit("subscribe:flow", { flowId });
    socket.on(`flow:update:${flowId}`, stableCallback);

    return () => {
      socket.off(`flow:update:${flowId}`, stableCallback);
      socket.emit("unsubscribe:flow", { flowId });
    };
  }, [flowId, stableCallback]);
}
