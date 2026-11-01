import type { Renter, NewRenter } from "@server/database/schema";

export interface RentersRepository {
  create(renter: Omit<NewRenter, 'createdAt' | 'updatedAt'>): Promise<Renter | null>;
  findAll(userId: string): Promise<Renter[]>;
  findById(id: string, userId: string): Promise<Renter | null>;
  update(id: string, userId: string, renter: Partial<Renter>): Promise<Renter | null>;
  delete(id: string, userId: string): Promise<boolean>;
  hasActiveLeases(id: string, userId: string): Promise<boolean>;
}