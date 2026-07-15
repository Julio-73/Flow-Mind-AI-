import type { Server as SocketIOServer } from "socket.io";
import { getOrgRoom, getWorkspaceRoom, getFlowRoom } from "../rooms.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("ws:execution-events");

export function emitExecutionEvent(
  io: SocketIOServer,
  event: {
    type: string;
    executionId: string;
    flowId: string;
    workspaceId: string;
    organizationId: string;
    nodeId?: string;
    status: string;
    data?: Record<string, unknown>;
    timestamp: string;
  },
): void {
  const { organizationId, workspaceId, flowId } = event;

  io.to(getOrgRoom(organizationId)).emit("execution:event", event);
  io.to(getWorkspaceRoom(workspaceId)).emit("execution:event", event);
  io.to(getFlowRoom(flowId)).emit("execution:event", event);

  if (event.nodeId) {
    io.to(getFlowRoom(flowId)).emit("execution:node_event", {
      ...event,
      nodeId: event.nodeId,
    });
  }

  logger.debug({ eventType: event.type, executionId: event.executionId }, "Execution event emitted");
}
