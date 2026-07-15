import type { Server as SocketIOServer } from "socket.io";
import { getUserRoom } from "../rooms.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("ws:notification-events");

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  body: string;
  userId: string;
  organizationId: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export function emitNotification(
  io: SocketIOServer,
  notification: NotificationEvent,
): void {
  io.to(getUserRoom(notification.userId)).emit("notification:new", notification);
  logger.debug({ type: notification.type, userId: notification.userId }, "Notification emitted");
}

export function emitNotificationRead(
  io: SocketIOServer,
  userId: string,
  notificationId: string,
): void {
  io.to(getUserRoom(userId)).emit("notification:read", { notificationId });
}
