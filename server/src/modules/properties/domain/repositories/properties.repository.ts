import type { Property, NewProperty } from "@server/database/schema";

export interface PropertiesRepository {
  create(property: Omit<NewProperty, 'createdAt' | 'updatedAt'>): Promise<Property | null>;
  findAll(userId: string): Promise<Property[]>;
  findById(id: string, userId: string): Promise<Property | null>;
  update(id: string, userId: string, property: Partial<Property>): Promise<Property | null>;
  delete(id: string, userId: string): Promise<boolean>;
  hasActiveLeases(id: string, userId: string): Promise<boolean>;
}