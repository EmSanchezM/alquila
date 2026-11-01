import type { Renter, NewRenter } from "@server/database/schema";

export interface RentersRepository {
  create(renter: Omit<NewRenter, 'createdAt' | 'updatedAt'>): Promise<Renter | null>;
  findAll(): Promise<Renter[]>;
  findById(id: string): Promise<Renter | null>;
  update(id: string, renter: Partial<Renter>): Promise<Renter | null>;
  delete(id: string): Promise<void>;
}