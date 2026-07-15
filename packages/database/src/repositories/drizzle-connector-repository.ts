import { eq, and, sql } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { installedConnectors } from "../schema/installed_connectors.js";
import { connectors } from "../schema/connectors.js";
import { Connector } from "@flowmind/core";
import type { ConnectorRepository } from "@flowmind/core";

export class DrizzleConnectorRepository implements ConnectorRepository {
  private get db() { return getConnection(); }

  async findById(id: string): Promise<Connector | null> {
    const row = await this.db.select().from(installedConnectors).where(eq(installedConnectors.id, id)).limit(1);
    if (!row[0]) return null;
    return Connector.from(this.toDomain(row[0]));
  }

  async findByOrganization(orgId: string): Promise<Connector[]> {
    const rows = await this.db.select().from(installedConnectors).where(eq(installedConnectors.organizationId, orgId));
    return rows.map((r) => Connector.from(this.toDomain(r)));
  }

  async findByType(orgId: string, type: string): Promise<Connector[]> {
    const rows = await this.db.select().from(installedConnectors)
      .where(and(eq(installedConnectors.organizationId, orgId), eq(installedConnectors.connectorId, type)));
    return rows.map((r) => Connector.from(this.toDomain(r)));
  }

  async create(connector: Connector): Promise<Connector> {
    const data = connector.toJSON();
    await this.db.insert(installedConnectors).values({
      id: data.id,
      organizationId: data.organizationId,
      connectorId: data.connectorType,
      label: data.label,
      config: JSON.stringify(data.config),
      isEnabled: data.isEnabled,
      lastTestedAt: data.lastTestedAt,
      lastTestSuccess: data.lastTestSuccess,
      createdBy: "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return connector;
  }

  async update(connector: Connector): Promise<Connector> {
    const data = connector.toJSON();
    await this.db.update(installedConnectors).set({
      config: JSON.stringify(data.config),
      isEnabled: data.isEnabled,
      lastTestedAt: data.lastTestedAt,
      lastTestSuccess: data.lastTestSuccess,
      updatedAt: data.updatedAt,
    }).where(eq(installedConnectors.id, data.id));
    return connector;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(installedConnectors).where(eq(installedConnectors.id, id));
  }

  private toDomain(row: typeof installedConnectors.$inferSelect): Parameters<typeof Connector.from>[0] {
    return {
      id: row.id,
      organizationId: row.organizationId,
      connectorType: row.connectorId,
      label: row.label,
      config: typeof row.config === "string" ? JSON.parse(row.config) : row.config as any,
      isEnabled: row.isEnabled,
      lastTestedAt: row.lastTestedAt,
      lastTestSuccess: row.lastTestSuccess,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
