import { and, eq, getTableColumns, sql } from "drizzle-orm";
import type { LeasesRepository, LeaseWithNames } from "@server/modules/leases/domain/repositories/leases.repository";

import { db } from "@server/database";
import { leases, properties, renters, type Lease, type NewLease } from "@server/database/schema";

// Leases with the names the screens show. Inner joins are safe: both references are NOT NULL,
// and soft-deleted properties or renters keep their rows.
const withNames = () =>
  db.select({
    ...getTableColumns(leases),
    propertyName: properties.name,
    renterName: sql<string>`${renters.firstName} || ' ' || ${renters.lastName}`,
  })
    .from(leases)
    .innerJoin(properties, eq(leases.propertyId, properties.id))
    .innerJoin(renters, eq(leases.renterId, renters.id));

export class DrizzleLeasesRepository implements LeasesRepository {
  async create(lease: Omit<NewLease, 'createdAt' | 'updatedAt'>): Promise<Lease | null> {
    const [newLease] = await db.insert(leases).values({
      ...lease,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if(!newLease) return null;

    return newLease;
  }
  async findAll(userId: string): Promise<LeaseWithNames[]> {
    return await withNames().where(and(eq(leases.userId, userId), eq(leases.isActive, true)));
  }
  
  async findById(id: string, userId: string): Promise<LeaseWithNames | null> {
    const [result] = await withNames().where(and(eq(leases.id, id), eq(leases.userId, userId), eq(leases.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id: string, userId: string, lease: Partial<Lease>): Promise<Lease | null> {
    const [updatedLease] = await db.update(leases)
      .set({
        ...lease,
        updatedAt: new Date(),
      })
      .where(and(eq(leases.id, id), eq(leases.userId, userId), eq(leases.isActive, true)))
      .returning();

    if(!updatedLease) return null;

    return updatedLease;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await db.update(leases)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(leases.id, id), eq(leases.userId, userId), eq(leases.isActive, true)))
      .returning({ id: leases.id });

    return deleted.length > 0;
  }
}