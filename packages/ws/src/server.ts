import { createServer, type Server as HTTPServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { getOrgRoom, getWorkspaceRoom, getUserRoom, getFlowRoom } from "./rooms.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("ws:server");

export interface SocketServerConfig {
  corsOrigin?: string;
  path?: string;
}

export class SocketManager {
  private io: SocketIOServer | null = null;
  private httpServer: HTTPServer | null = null;

  initialize(
    httpServer?: HTTPServer,
    config: SocketServerConfig = {},
  ): SocketIOServer {
    const server = httpServer ?? createServer();

    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.corsOrigin ?? process.env["SOCKETIO_CORS_ORIGIN"] ?? "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: config.path ?? process.env["SOCKETIO_PATH"] ?? "/api/socket",
      pingInterval: 25000,
      pingTimeout: 20000,
      transports: ["websocket", "polling"],
    });

    const redisUrl = process.env["REDIS_URL"] ?? "redis://localhost:6379";
    const pubClient = new Redis(redisUrl);
    const subClient = new Redis(redisUrl);

    this.io.adapter(createAdapter(pubClient, subClient));

    this.setupAuth();
    this.setupRooms();

    logger.info("Socket.io server initialized");
    return this.io;
  }

  private setupAuth(): void {
    if (!this.io) return;

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.["token"] ?? socket.handshake.query?.["token"];
      if (!token) {
        return next(new Error("Authentication required"));
      }
      try {
        const jwt = require("jsonwebtoken");
        const secret = process.env["JWT_ACCESS_SECRET"] ?? "secret";
        const decoded = jwt.verify(token, secret) as Record<string, unknown>;
        (socket as any).user = decoded;
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });
  }

  private setupRooms(): void {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      const user = (socket as any).user as Record<string, string> | undefined;
      if (!user) {
        socket.disconnect();
        return;
      }

      const userId = user["userId"] ?? user["sub"];
      const orgId = user["orgId"] as string | undefined;

      logger.info({ userId: userId as string, socketId: socket.id }, "Client connected");

      if (userId) {
        socket.join(getUserRoom(userId as string));
      }
      if (orgId) {
        socket.join(getOrgRoom(orgId));
      }

      socket.on("join:workspace", (workspaceId: string) => {
        socket.join(getWorkspaceRoom(workspaceId));
        logger.debug({ workspaceId, socketId: socket.id }, "Joined workspace room");
      });

      socket.on("join:flow", (flowId: string) => {
        socket.join(getFlowRoom(flowId));
        logger.debug({ flowId, socketId: socket.id }, "Joined flow room");
      });

      socket.on("leave:workspace", (workspaceId: string) => {
        socket.leave(getWorkspaceRoom(workspaceId));
      });

      socket.on("leave:flow", (flowId: string) => {
        socket.leave(getFlowRoom(flowId));
      });

      socket.on("disconnect", (reason) => {
        logger.info({ userId: userId as string, reason }, "Client disconnected");
      });
    });
  }

  getIO(): SocketIOServer {
    if (!this.io) throw new Error("Socket.io not initialized");
    return this.io;
  }

  async shutdown(): Promise<void> {
    if (this.io) {
      await this.io.close();
      logger.info("Socket.io server closed");
    }
    if (this.httpServer) {
      await new Promise<void>((resolve) => this.httpServer?.close(() => resolve()));
    }
  }
}

export const socketManager = new SocketManager();
