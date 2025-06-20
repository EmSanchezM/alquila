import { eq } from "drizzle-orm";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";

import { db } from "@server/database";
import { renters, type Renter } from "@server/database/schema";

export class DrizzleRentersRepository implements RentersRepository {
  async create(renter: Omit<Renter, 'createdAt' | 'updatedAt'>): Promise<Renter | null> {
    const [newRenter] = await db.insert(renters).values({
      ...renter,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if(!newRenter) return null;

    return newRenter;
  }
  async findAll(): Promise<Renter[]> {
    return await db.select().from(renters);
  }
  
  async findById(id: string): Promise<Renter | null> {
    const [result] = await db.select().from(renters).where(eq(renters.id, id));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, renter: Partial<Renter>): Promise<Renter | null> {
    const [updatedRenter] = await db.update(renters)
      .set({
        ...renter,
        updatedAt: new Date(),
      })
      .where(eq(renters.id, id))
      .returning();

    if(!updatedRenter) return null;

    return updatedRenter;
  }

  async delete(id: string): Promise<void> {
    await db.delete(renters).where(eq(renters.id, id));
  }
}