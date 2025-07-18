import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

import { db } from "@server/database";
import { properties, type Property } from "@server/database/schema";
import { eq } from "drizzle-orm";

export class DrizzlePropertiesRepository implements PropertiesRepository {
  async create(property: Omit<Property, 'createdAt' | 'updatedAt'>): Promise<Property | null> {
    const [newProperty] = await db.insert(properties).values({
      ...property,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if(!newProperty) return null;

    return newProperty;
  }
  async findAll(): Promise<Property[]> {
    //return await db.select().from(properties).where(eq(properties.isActive, true));
    try {
      const results = await db.select().from(properties);
      return results;
    } catch (error) {
      console.error('Error finding all properties:', error);
      throw error;
    }
  }
  
  async findById(id: string): Promise<Property | null> {
    const [result] = await db.select().from(properties).where(eq(properties.id, id));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, property: Partial<Property>): Promise<Property | null> {
    const [updatedProperty] = await db.update(properties)
      .set({
        ...property,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    if(!updatedProperty) return null;

    return updatedProperty;
  }

  async delete(id: string): Promise<void> {
    await db.update(properties)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id));
  }
}