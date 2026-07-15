import { eq, like, desc, sql } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { templates } from "../schema/templates.js";
import { Template } from "@flowmind/core";
import type { TemplateRepository } from "@flowmind/core";
import type { PaginatedResult, PaginationParams } from "@flowmind/shared";

export class DrizzleTemplateRepository implements TemplateRepository {
  private get db() { return getConnection(); }

  async findById(id: string): Promise<Template | null> {
    const row = await this.db.select().from(templates).where(eq(templates.id, id)).limit(1);
    if (!row[0]) return null;
    return Template.from(this.toDomain(row[0]));
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Template>> {
    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db.select().from(templates)
      .orderBy(desc(templates.popularity))
      .limit(params.pageSize).offset(offset);
    const total = await this.db.select({ count: sql<number>`count(*)` }).from(templates);
    return {
      items: rows.map((r) => Template.from(this.toDomain(r))),
      total: Number(total[0]?.count ?? 0),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(total[0]?.count ?? 0) / params.pageSize),
    };
  }

  async findByCategory(category: string, params: PaginationParams): Promise<PaginatedResult<Template>> {
    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db.select().from(templates)
      .where(eq(templates.category, category))
      .orderBy(desc(templates.popularity))
      .limit(params.pageSize).offset(offset);
    const total = await this.db.select({ count: sql<number>`count(*)` }).from(templates)
      .where(eq(templates.category, category));
    return {
      items: rows.map((r) => Template.from(this.toDomain(r))),
      total: Number(total[0]?.count ?? 0),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(total[0]?.count ?? 0) / params.pageSize),
    };
  }

  async search(query: string, params: PaginationParams): Promise<PaginatedResult<Template>> {
    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db.select().from(templates)
      .where(like(templates.name, `%${query}%`))
      .orderBy(desc(templates.popularity))
      .limit(params.pageSize).offset(offset);
    const total = await this.db.select({ count: sql<number>`count(*)` }).from(templates)
      .where(like(templates.name, `%${query}%`));
    return {
      items: rows.map((r) => Template.from(this.toDomain(r))),
      total: Number(total[0]?.count ?? 0),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(total[0]?.count ?? 0) / params.pageSize),
    };
  }

  async create(template: Template): Promise<Template> {
    const data = template.toJSON();
    await this.db.insert(templates).values({
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      icon: data.icon,
      flowData: JSON.stringify(data.flowData),
      requiredConnectors: JSON.stringify(data.requiredConnectors),
      popularity: data.popularity,
      isOfficial: data.isOfficial,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return template;
  }

  async update(template: Template): Promise<Template> {
    const data = template.toJSON();
    await this.db.update(templates).set({
      name: data.name,
      description: data.description,
      popularity: data.popularity,
      updatedAt: data.updatedAt,
    }).where(eq(templates.id, data.id));
    return template;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(templates).where(eq(templates.id, id));
  }

  private toDomain(row: typeof templates.$inferSelect): Parameters<typeof Template.from>[0] {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      icon: row.icon,
      flowData: typeof row.flowData === "string" ? JSON.parse(row.flowData) : row.flowData as any,
      requiredConnectors: typeof row.requiredConnectors === "string" ? JSON.parse(row.requiredConnectors) : row.requiredConnectors as string[],
      popularity: row.popularity,
      isOfficial: row.isOfficial,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
