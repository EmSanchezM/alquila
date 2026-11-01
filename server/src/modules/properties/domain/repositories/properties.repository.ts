import type { Property, NewProperty } from "@server/database/schema";

export interface PropertiesRepository {
  create(property: Omit<NewProperty, 'createdAt' | 'updatedAt'>): Promise<Property | null>;
  findAll(): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  update(id: string, property: Partial<Property>): Promise<Property | null>;
  delete(id: string): Promise<boolean>;
  hasActiveLeases(id: string): Promise<boolean>;
}