import { eq } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { workspaces } from "../schema/workspaces.js";
import { Workspace } from "@flowmind/core";
import type { WorkspaceRepository } from "@flowmind/core";

export class DrizzleWorkspaceRepository implements WorkspaceRepository {
  private get db() { return getConnection(); }

  async findById(id: string): Promise<Workspace | null> {
    const row = await this.db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    if (!row[0]) return null;
    return Workspace.from(this.toDomain(row[0]));
  }

  async findByOrganization(orgId: string): Promise<Workspace[]> {
    const rows = await this.db.select().from(workspaces).where(eq(workspaces.organizationId, orgId));
    return rows.map((r) => Workspace.from(this.toDomain(r)));
  }

  async create(ws: Workspace): Promise<Workspace> {
    const data = ws.toJSON();
    await this.db.insert(workspaces).values({
      id: data.id,
      name: data.name,
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return ws;
  }

  async update(ws: Workspace): Promise<Workspace> {
    const data = ws.toJSON();
    await this.db.update(workspaces).set({ name: data.name, updatedAt: data.updatedAt })
      .where(eq(workspaces.id, data.id));
    return ws;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(workspaces).where(eq(workspaces.id, id));
  }

  private toDomain(row: typeof workspaces.$inferSelect): Parameters<typeof Workspace.from>[0] {
    return {
      id: row.id,
      name: row.name,
      organizationId: row.organizationId,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
