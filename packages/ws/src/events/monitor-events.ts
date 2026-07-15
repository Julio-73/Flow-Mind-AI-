import type { Server as SocketIOServer } from "socket.io";
import { getOrgRoom, getWorkspaceRoom } from "../rooms.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("ws:monitor-events");

export interface MonitorEvent {
  organizationId: string;
  workspaceId: string;
  type: "execution_count" | "success_rate" | "avg_duration" | "error_rate" | "active_flows";
  value: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function emitMonitorUpdate(
  io: SocketIOServer,
  event: MonitorEvent,
): void {
  io.to(getOrgRoom(event.organizationId)).emit("monitor:update", event);
  io.to(getWorkspaceRoom(event.workspaceId)).emit("monitor:update", event);
  logger.debug({ type: event.type, value: event.value }, "Monitor update emitted");
}

export function emitFlowMetrics(
  io: SocketIOServer,
  organizationId: string,
  metrics: Record<string, number>,
): void {
  io.to(getOrgRoom(organizationId)).emit("monitor:metrics", {
    metrics,
    timestamp: new Date().toISOString(),
  });
}
