import { eq } from "drizzle-orm";
import { getConnection } from "../connection.js";
import { users, organizationMembers, workspaceMembers } from "../schema/users.js";
import { User } from "@flowmind/core";
import type { UserRepository } from "@flowmind/core";

export class DrizzleUserRepository implements UserRepository {
  private get db() {
    return getConnection();
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!row[0]) return null;
    return User.from(this.toDomain(row[0]));
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!row[0]) return null;
    return User.from(this.toDomain(row[0]));
  }

  async create(user: User): Promise<User> {
    const data = user.toJSON();
    await this.db.insert(users).values({
      id: data.id,
      email: data.email.toString(),
      name: data.name,
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
      lastLoginAt: data.lastLoginAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return user;
  }

  async update(user: User): Promise<User> {
    const data = user.toJSON();
    await this.db.update(users).set({
      name: data.name,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
      lastLoginAt: data.lastLoginAt,
      updatedAt: data.updatedAt,
    }).where(eq(users.id, data.id));
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async findManyByOrganization(orgId: string): Promise<User[]> {
    const rows = await this.db
      .select(users as any)
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, orgId));
    return rows.map((r: any) => User.from(this.toDomain(r["users"])));
  }

  async countByOrganization(orgId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));
    return Number(result[0]?.count ?? 0);
  }

  private toDomain(row: typeof users.$inferSelect): Parameters<typeof User.from>[0] {
    return {
      id: row.id,
      email: { toString: () => row.email } as any,
      name: row.name,
      passwordHash: row.passwordHash,
      avatarUrl: row.avatarUrl,
      isActive: row.isActive,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

import { sql } from "drizzle-orm";
