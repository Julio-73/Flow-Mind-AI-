import { eq, desc, and, sql } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { flows } from "../schema/flows.js";
import { Flow } from "@flowmind/core";
import type { FlowRepository } from "@flowmind/core";
import type { PaginatedResult, PaginationParams } from "@flowmind/shared";

export class DrizzleFlowRepository implements FlowRepository {
  private get db() { return getConnection(); }

  async findById(id: string): Promise<Flow | null> {
    const row = await this.db.select().from(flows).where(eq(flows.id, id)).limit(1);
    if (!row[0]) return null;
    return Flow.from(this.toDomain(row[0]));
  }

  async findByWorkspace(workspaceId: string, params: PaginationParams): Promise<PaginatedResult<Flow>> {
    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db.select().from(flows)
      .where(eq(flows.workspaceId, workspaceId))
      .orderBy(desc(flows.updatedAt))
      .limit(params.pageSize).offset(offset);
    const total = await this.db.select({ count: sql<number>`count(*)` }).from(flows)
      .where(eq(flows.workspaceId, workspaceId));
    return {
      items: rows.map((r) => Flow.from(this.toDomain(r))),
      total: Number(total[0]?.count ?? 0),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(total[0]?.count ?? 0) / params.pageSize),
    };
  }

  async findByOrganization(orgId: string, params: PaginationParams): Promise<PaginatedResult<Flow>> {
    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db.select().from(flows)
      .where(eq(flows.organizationId, orgId))
      .orderBy(desc(flows.updatedAt))
      .limit(params.pageSize).offset(offset);
    const total = await this.db.select({ count: sql<number>`count(*)` }).from(flows)
      .where(eq(flows.organizationId, orgId));
    return {
      items: rows.map((r) => Flow.from(this.toDomain(r))),
      total: Number(total[0]?.count ?? 0),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(total[0]?.count ?? 0) / params.pageSize),
    };
  }

  async findActiveByTrigger(triggerType: string): Promise<Flow[]> {
    const rows = await this.db.select().from(flows)
      .where(and(eq(flows.isActive, true), eq(flows.triggerType, triggerType)));
    return rows.map((r) => Flow.from(this.toDomain(r)));
  }

  async create(flow: Flow): Promise<Flow> {
    const data = flow.toJSON();
    await this.db.insert(flows).values({
      id: data.id,
      name: data.name,
      description: data.description,
      workspaceId: data.workspaceId,
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      nodes: JSON.stringify(data.nodes),
      edges: JSON.stringify(data.edges),
      triggerType: data.triggerType,
      triggerConfig: JSON.stringify(data.triggerConfig),
      isActive: data.isActive,
      isDraft: data.isDraft,
      version: data.version,
      tags: JSON.stringify(data.tags),
      lastRunAt: data.lastRunAt,
      lastRunStatus: data.lastRunStatus,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return flow;
  }

  async update(flow: Flow): Promise<Flow> {
    const data = flow.toJSON();
    await this.db.update(flows).set({
      name: data.name,
      description: data.description,
      nodes: JSON.stringify(data.nodes),
      edges: JSON.stringify(data.edges),
      triggerConfig: JSON.stringify(data.triggerConfig),
      isActive: data.isActive,
      isDraft: data.isDraft,
      version: data.version,
      tags: JSON.stringify(data.tags),
      lastRunAt: data.lastRunAt,
      lastRunStatus: data.lastRunStatus,
      updatedAt: data.updatedAt,
    }).where(eq(flows.id, data.id));
    return flow;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(flows).where(eq(flows.id, id));
  }

  async countByWorkspace(workspaceId: string): Promise<number> {
    const result = await this.db.select({ count: sql<number>`count(*)` }).from(flows)
      .where(eq(flows.workspaceId, workspaceId));
    return Number(result[0]?.count ?? 0);
  }

  private toDomain(row: typeof flows.$inferSelect): Parameters<typeof Flow.from>[0] {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      workspaceId: row.workspaceId,
      organizationId: row.organizationId,
      createdBy: row.createdBy,
      nodes: typeof row.nodes === "string" ? JSON.parse(row.nodes) : row.nodes as any,
      edges: typeof row.edges === "string" ? JSON.parse(row.edges) : row.edges as any,
      triggerType: row.triggerType as any,
      triggerConfig: typeof row.triggerConfig === "string" ? JSON.parse(row.triggerConfig) : row.triggerConfig as any,
      isActive: row.isActive,
      isDraft: row.isDraft,
      version: row.version,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags as string[],
      lastRunAt: row.lastRunAt,
      lastRunStatus: row.lastRunStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
