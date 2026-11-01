import { and, eq } from "drizzle-orm";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";

import { db } from "@server/database";
import { leases, renters, type Renter, type NewRenter } from "@server/database/schema";

export class DrizzleRentersRepository implements RentersRepository {
  async create(renter: Omit<NewRenter, 'createdAt' | 'updatedAt'>): Promise<Renter | null> {
    const [newRenter] = await db.insert(renters).values({
      ...renter,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if(!newRenter) return null;

    return newRenter;
  }
  async findAll(): Promise<Renter[]> {
    return await db.select().from(renters).where(eq(renters.isActive, true));
  }
  
  async findById(id: string): Promise<Renter | null> {
    const [result] = await db.select().from(renters).where(and(eq(renters.id, id), eq(renters.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, renter: Partial<Renter>): Promise<Renter | null> {
    const [updatedRenter] = await db.update(renters)
      .set({
        ...renter,
        updatedAt: new Date(),
      })
      .where(and(eq(renters.id, id), eq(renters.isActive, true)))
      .returning();

    if(!updatedRenter) return null;

    return updatedRenter;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db.update(renters)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(renters.id, id), eq(renters.isActive, true)))
      .returning({ id: renters.id });

    return deleted.length > 0;
  }

  async hasActiveLeases(id: string): Promise<boolean> {
    const [lease] = await db.select({ id: leases.id })
      .from(leases)
      .where(and(eq(leases.renterId, id), eq(leases.isActive, true)))
      .limit(1);

    return lease !== undefined;
  }
}
