import type { Property } from "@server/database/schema";

export interface PropertiesRepository {
  create(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property | null>;
  findAll(): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  update(id: string, property: Partial<Property>): Promise<Property | null>;
  delete(id: string): Promise<void>;
}