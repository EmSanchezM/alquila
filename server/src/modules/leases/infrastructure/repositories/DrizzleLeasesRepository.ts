import { and, eq } from "drizzle-orm";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

import { db } from "@server/database";
import { leases, type Lease, type NewLease } from "@server/database/schema";

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
  async findAll(): Promise<Lease[]> {
    return await db.select().from(leases).where(eq(leases.isActive, true));
  }
  
  async findById(id: string): Promise<Lease | null> {
    const [result] = await db.select().from(leases).where(and(eq(leases.id, id), eq(leases.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, lease: Partial<Lease>): Promise<Lease | null> {
    const [updatedLease] = await db.update(leases)
      .set({
        ...lease,
        updatedAt: new Date(),
      })
      .where(and(eq(leases.id, id), eq(leases.isActive, true)))
      .returning();

    if(!updatedLease) return null;

    return updatedLease;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db.update(leases)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(leases.id, id), eq(leases.isActive, true)))
      .returning({ id: leases.id });

    return deleted.length > 0;
  }
}