import type { Lease, NewLease } from "@server/database/schema";

export interface LeasesRepository {
  create(lease: Omit<NewLease, 'createdAt' | 'updatedAt'>): Promise<Lease | null>;
  findAll(userId: string): Promise<Lease[]>;
  findById(id: string, userId: string): Promise<Lease | null>;
  update(id: string, userId: string, lease: Partial<Lease>): Promise<Lease | null>;
  delete(id: string, userId: string): Promise<boolean>;
}