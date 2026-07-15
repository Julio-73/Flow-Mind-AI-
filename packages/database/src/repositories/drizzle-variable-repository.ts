import { eq, and, like, sql } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { variables } from "../schema/variables.js";
import { Variable } from "@flowmind/core";
import type { VariableRepository } from "@flowmind/core";

export class DrizzleVariableRepository implements VariableRepository {
  private get db() { return getConnection(); }

  async findById(id: string): Promise<Variable | null> {
    const row = await this.db.select().from(variables).where(eq(variables.id, id)).limit(1);
    if (!row[0]) return null;
    return Variable.from(this.toDomain(row[0]));
  }

  async findByKey(workspaceId: string, key: string): Promise<Variable | null> {
    const row = await this.db.select().from(variables)
      .where(and(eq(variables.workspaceId, workspaceId), eq(variables.key, key))).limit(1);
    if (!row[0]) return null;
    return Variable.from(this.toDomain(row[0]));
  }

  async findByWorkspace(workspaceId: string): Promise<Variable[]> {
    const rows = await this.db.select().from(variables).where(eq(variables.workspaceId, workspaceId));
    return rows.map((r) => Variable.from(this.toDomain(r)));
  }

  async create(variable: Variable): Promise<Variable> {
    const data = variable.toJSON();
    await this.db.insert(variables).values({
      id: data.id,
      workspaceId: data.workspaceId,
      organizationId: data.organizationId,
      key: data.key,
      value: JSON.stringify(data.value),
      type: data.type,
      description: data.description,
      isSecret: data.isSecret,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return variable;
  }

  async update(variable: Variable): Promise<Variable> {
    const data = variable.toJSON();
    await this.db.update(variables).set({
      value: JSON.stringify(data.value),
      description: data.description,
      updatedAt: data.updatedAt,
    }).where(eq(variables.id, data.id));
    return variable;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(variables).where(eq(variables.id, id));
  }

  async search(workspaceId: string, query: string): Promise<Variable[]> {
    const rows = await this.db.select().from(variables)
      .where(and(eq(variables.workspaceId, workspaceId), like(variables.key, `%${query}%`)));
    return rows.map((r) => Variable.from(this.toDomain(r)));
  }

  private toDomain(row: typeof variables.$inferSelect): Parameters<typeof Variable.from>[0] {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      organizationId: row.organizationId,
      key: row.key,
      value: typeof row.value === "string" ? JSON.parse(row.value) : row.value,
      type: row.type as any,
      description: row.description,
      isSecret: row.isSecret,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
