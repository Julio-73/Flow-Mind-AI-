import { eq } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { organizations } from "../schema/organizations.js";
import { organizationMembers } from "../schema/users.js";
import { Organization } from "@flowmind/core";
import type { OrganizationRepository } from "@flowmind/core";

export class DrizzleOrganizationRepository implements OrganizationRepository {
  private get db() { return getConnection(); }

  async findById(id: string): Promise<Organization | null> {
    const row = await this.db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    if (!row[0]) return null;
    return Organization.from(this.toDomain(row[0]));
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const row = await this.db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
    if (!row[0]) return null;
    return Organization.from(this.toDomain(row[0]));
  }

  async create(org: Organization): Promise<Organization> {
    const data = org.toJSON();
    await this.db.insert(organizations).values({
      id: data.id,
      name: data.name,
      slug: data.slug.toString(),
      logoUrl: data.logoUrl,
      ownerId: data.ownerId,
      maxSeats: data.maxSeats,
      features: data.features,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return org;
  }

  async update(org: Organization): Promise<Organization> {
    const data = org.toJSON();
    await this.db.update(organizations).set({
      name: data.name,
      logoUrl: data.logoUrl,
      maxSeats: data.maxSeats,
      features: data.features,
      updatedAt: data.updatedAt,
    }).where(eq(organizations.id, data.id));
    return org;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(organizations).where(eq(organizations.id, id));
  }

  async findUserOrganizations(userId: string): Promise<Organization[]> {
    const rows = await this.db
      .select(organizations as any)
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId));
    return rows.map((r: any) => Organization.from(this.toDomain(r["organizations"])));
  }

  private toDomain(row: typeof organizations.$inferSelect): Parameters<typeof Organization.from>[0] {
    return {
      id: row.id,
      name: row.name,
      slug: { toString: () => row.slug } as any,
      logoUrl: row.logoUrl,
      ownerId: row.ownerId,
      maxSeats: row.maxSeats,
      features: row.features as Record<string, boolean>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
