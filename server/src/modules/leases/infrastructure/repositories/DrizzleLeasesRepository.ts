import { eq } from "drizzle-orm";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

import { db } from "@server/database";
import { leases, type Lease } from "@server/database/schema";

export class DrizzleLeasesRepository implements LeasesRepository {
  async create(lease: Omit<Lease, 'createdAt' | 'updatedAt'>): Promise<Lease | null> {
    const [newLease] = await db.insert(leases).values({
      ...lease,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if(!newLease) return null;

    return newLease;
  }
  async findAll(): Promise<Lease[]> {
    return await db.select().from(leases);
  }
  
  async findById(id: string): Promise<Lease | null> {
    const [result] = await db.select().from(leases).where(eq(leases.id, id));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, lease: Partial<Lease>): Promise<Lease | null> {
    const [updatedLease] = await db.update(leases)
      .set({
        ...lease,
        updatedAt: new Date(),
      })
      .where(eq(leases.id, id))
      .returning();

    if(!updatedLease) return null;

    return updatedLease;
  }

  async delete(id: string): Promise<void> {
    await db.delete(leases).where(eq(leases.id, id));
  }
}