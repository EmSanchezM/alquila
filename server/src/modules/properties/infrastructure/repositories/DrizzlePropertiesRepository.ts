import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

import { db } from "@server/database";
import { leases, properties, type Property, type NewProperty } from "@server/database/schema";
import { and, eq } from "drizzle-orm";

export class DrizzlePropertiesRepository implements PropertiesRepository {
  async create(property: Omit<NewProperty, 'createdAt' | 'updatedAt'>): Promise<Property | null> {
    const [newProperty] = await db.insert(properties).values({
      ...property,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if(!newProperty) return null;

    return newProperty;
  }
  async findAll(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.isActive, true));
  }
  
  async findById(id: string): Promise<Property | null> {
    const [result] = await db.select().from(properties).where(and(eq(properties.id, id), eq(properties.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, property: Partial<Property>): Promise<Property | null> {
    const [updatedProperty] = await db.update(properties)
      .set({
        ...property,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, id), eq(properties.isActive, true)))
      .returning();

    if(!updatedProperty) return null;

    return updatedProperty;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db.update(properties)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, id), eq(properties.isActive, true)))
      .returning({ id: properties.id });

    return deleted.length > 0;
  }

  async hasActiveLeases(id: string): Promise<boolean> {
    const [lease] = await db.select({ id: leases.id })
      .from(leases)
      .where(and(eq(leases.propertyId, id), eq(leases.isActive, true)))
      .limit(1);

    return lease !== undefined;
  }
}
