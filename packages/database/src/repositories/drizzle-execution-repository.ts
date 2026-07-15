import { eq, desc, and, sql } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { executions } from "../schema/executions.js";
import { executionSteps } from "../schema/execution_steps.js";
import { Execution } from "@flowmind/core";
import type { ExecutionRepository } from "@flowmind/core";
import type { PaginatedResult, PaginationParams } from "@flowmind/shared";
import type { ExecutionStatus } from "@flowmind/core";

export class DrizzleExecutionRepository implements ExecutionRepository {
  private get db() { return getConnection(); }

  async findById(id: string): Promise<Execution | null> {
    const row = await this.db.select().from(executions).where(eq(executions.id, id)).limit(1);
    if (!row[0]) return null;
    const steps = await this.db.select().from(executionSteps)
      .where(eq(executionSteps.executionId, id));
    return Execution.from({ ...this.toDomain(row[0]), steps: steps as any });
  }

  async findByFlow(flowId: string, params: PaginationParams): Promise<PaginatedResult<Execution>> {
    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db.select().from(executions)
      .where(eq(executions.flowId, flowId))
      .orderBy(desc(executions.createdAt))
      .limit(params.pageSize).offset(offset);
    const total = await this.db.select({ count: sql<number>`count(*)` }).from(executions)
      .where(eq(executions.flowId, flowId));
    return {
      items: rows.map((r) => Execution.from(this.toDomain(r))),
      total: Number(total[0]?.count ?? 0),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(total[0]?.count ?? 0) / params.pageSize),
    };
  }

  async findByOrganization(orgId: string, params: PaginationParams): Promise<PaginatedResult<Execution>> {
    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db.select().from(executions)
      .where(eq(executions.organizationId, orgId))
      .orderBy(desc(executions.createdAt))
      .limit(params.pageSize).offset(offset);
    const total = await this.db.select({ count: sql<number>`count(*)` }).from(executions)
      .where(eq(executions.organizationId, orgId));
    return {
      items: rows.map((r) => Execution.from(this.toDomain(r))),
      total: Number(total[0]?.count ?? 0),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(total[0]?.count ?? 0) / params.pageSize),
    };
  }

  async findRunning(): Promise<Execution[]> {
    const rows = await this.db.select().from(executions).where(eq(executions.status, "RUNNING"));
    return rows.map((r) => Execution.from(this.toDomain(r)));
  }

  async findByStatus(status: ExecutionStatus): Promise<Execution[]> {
    const rows = await this.db.select().from(executions).where(eq(executions.status, status));
    return rows.map((r) => Execution.from(this.toDomain(r)));
  }

  async create(exec: Execution): Promise<Execution> {
    const data = exec.toJSON();
    await this.db.insert(executions).values({
      id: data.id,
      flowId: data.flowId,
      workspaceId: data.workspaceId,
      organizationId: data.organizationId,
      triggeredBy: data.triggeredBy,
      status: data.status,
      triggerData: data.triggerData ? JSON.stringify(data.triggerData) : null,
      error: data.error,
      durationMs: data.durationMs?.toString() ?? null,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return exec;
  }

  async update(exec: Execution): Promise<Execution> {
    const data = exec.toJSON();
    await this.db.update(executions).set({
      status: data.status,
      error: data.error,
      durationMs: data.durationMs?.toString() ?? null,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      updatedAt: data.updatedAt,
    }).where(eq(executions.id, data.id));

    for (const step of data.steps) {
      await this.db.insert(executionSteps).values({
        id: step.id,
        executionId: step.executionId,
        nodeId: step.nodeId,
        status: step.status,
        input: JSON.stringify(step.input),
        output: step.output ? JSON.stringify(step.output) : null,
        error: step.error,
        attempt: step.attempt,
        durationMs: step.durationMs,
        startedAt: step.startedAt,
        completedAt: step.completedAt,
      }).onConflictDoUpdate({
        target: executionSteps.id,
        set: {
          status: step.status,
          output: step.output ? JSON.stringify(step.output) : null,
          error: step.error,
          attempt: step.attempt,
          durationMs: step.durationMs,
          completedAt: step.completedAt,
        },
      });
    }
    return exec;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(executions).where(eq(executions.id, id));
  }

  async countByFlow(flowId: string): Promise<number> {
    const result = await this.db.select({ count: sql<number>`count(*)` }).from(executions)
      .where(eq(executions.flowId, flowId));
    return Number(result[0]?.count ?? 0);
  }

  async countByStatus(orgId: string, status: ExecutionStatus): Promise<number> {
    const result = await this.db.select({ count: sql<number>`count(*)` }).from(executions)
      .where(and(eq(executions.organizationId, orgId), eq(executions.status, status)));
    return Number(result[0]?.count ?? 0);
  }

  private toDomain(row: typeof executions.$inferSelect): Parameters<typeof Execution.from>[0] {
    return {
      id: row.id,
      flowId: row.flowId,
      workspaceId: row.workspaceId,
      organizationId: row.organizationId,
      triggeredBy: row.triggeredBy,
      status: row.status as ExecutionStatus,
      triggerData: row.triggerData ? (typeof row.triggerData === "string" ? JSON.parse(row.triggerData) : row.triggerData) : null,
      steps: [],
      error: row.error,
      durationMs: row.durationMs ? parseInt(row.durationMs, 10) : null,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
